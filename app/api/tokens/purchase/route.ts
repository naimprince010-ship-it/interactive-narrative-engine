import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

type PurchaseRequest = {
  deviceId?: string
  packageId: 'trial' | 'bonus' | 'best'
  trxId?: string
}

const PACKAGES = {
  trial: { amount: 10, tokens: 100 },
  bonus: { amount: 50, tokens: 550 },
  best: { amount: 100, tokens: 1200 },
} as const

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

async function getOrCreateWallet(identity: { userId?: string; deviceId?: string }) {
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PurchaseRequest
    const userId = await getUserIdFromRequest(request)
    const deviceId = body.deviceId

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    if (!body.packageId || !(body.packageId in PACKAGES)) {
      return NextResponse.json({ error: 'Invalid purchase request.' }, { status: 400 })
    }

    const pack = PACKAGES[body.packageId]
    const supabase = getSupabaseServerClient()

    const currentBalance = await getOrCreateWallet({ userId: userId || undefined, deviceId: deviceId || undefined })
    const newBalance = currentBalance + pack.tokens

    const { error: purchaseError } = await supabase.from('token_purchases').insert({
      device_id: deviceId || null,
      user_id: userId || null,
      package_id: body.packageId,
      amount_bdt: pack.amount,
      tokens: pack.tokens,
      trx_id: body.trxId || null,
    })

    if (purchaseError) {
      throw new Error(`Supabase purchase insert failed: ${purchaseError.message}`)
    }

    let walletUpdate = supabase
      .from('user_wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })

    if (userId) {
      walletUpdate = walletUpdate.eq('user_id', userId)
    } else if (deviceId) {
      walletUpdate = walletUpdate.eq('device_id', deviceId)
    }

    const { error: walletError } = await walletUpdate

    if (walletError) {
      throw new Error(`Supabase wallet update failed: ${walletError.message}`)
    }

    return NextResponse.json({ balance: newBalance, tokens: pack.tokens })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
