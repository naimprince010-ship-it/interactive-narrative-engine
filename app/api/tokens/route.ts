import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

type SpendRequest = {
  action: 'spend'
  deviceId: string
  amount: number
}

type WalletIdentity = {
  userId?: string
  deviceId?: string
}

async function getUserIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  if (!token) {
    return null
  }

  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return null
  }

  return data.user.id
}

async function getOrCreateWallet(identity: WalletIdentity) {
  const supabase = getSupabaseServerClient()
  let query = supabase.from('user_wallets').select('balance')

  if (identity.userId) {
    query = query.eq('user_id', identity.userId)
  } else if (identity.deviceId) {
    query = query.eq('device_id', identity.deviceId)
  } else {
    throw new Error('Missing identity')
  }

  const { data, error } = await query.maybeSingle()

  if (error) {
    throw new Error(`Supabase wallet query failed: ${error.message}`)
  }

  if (data) {
    return data.balance as number
  }

  const { data: created, error: insertError } = await supabase
    .from('user_wallets')
    .insert({ device_id: identity.deviceId || null, user_id: identity.userId || null, balance: 0 })
    .select('balance')
    .single()

  if (insertError) {
    throw new Error(`Supabase wallet insert failed: ${insertError.message}`)
  }

  return created.balance as number
}

async function updateWallet(identity: WalletIdentity, balance: number) {
  const supabase = getSupabaseServerClient()
  let updateQuery = supabase.from('user_wallets').update({ balance, updated_at: new Date().toISOString() })

  if (identity.userId) {
    updateQuery = updateQuery.eq('user_id', identity.userId)
  } else if (identity.deviceId) {
    updateQuery = updateQuery.eq('device_id', identity.deviceId)
  } else {
    throw new Error('Missing identity')
  }

  const { error } = await updateQuery

  if (error) {
    throw new Error(`Supabase wallet update failed: ${error.message}`)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const userId = await getUserIdFromRequest(request)

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    const balance = await getOrCreateWallet({ userId: userId || undefined, deviceId: deviceId || undefined })
    return NextResponse.json({ balance })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SpendRequest
    if (body.action !== 'spend') {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }

    const userId = await getUserIdFromRequest(request)
    const deviceId = body.deviceId

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    if (!Number.isFinite(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: 'Invalid spend request.' }, { status: 400 })
    }

    const balance = await getOrCreateWallet({ userId: userId || undefined, deviceId: deviceId || undefined })
    if (balance < body.amount) {
      return NextResponse.json({ error: 'Insufficient balance.' }, { status: 402 })
    }

    const newBalance = balance - body.amount
    await updateWallet({ userId: userId || undefined, deviceId: deviceId || undefined }, newBalance)
    return NextResponse.json({ balance: newBalance })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
