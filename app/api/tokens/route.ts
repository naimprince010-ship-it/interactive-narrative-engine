import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

type SpendRequest = {
  action: 'spend'
  deviceId: string
  amount: number
}

async function getOrCreateWallet(deviceId: string) {
  const supabase = getSupabaseServerClient()
  const { data, error } = await supabase
    .from('user_wallets')
    .select('balance')
    .eq('device_id', deviceId)
    .maybeSingle()

  if (error) {
    throw new Error(`Supabase wallet query failed: ${error.message}`)
  }

  if (data) {
    return data.balance as number
  }

  const { data: created, error: insertError } = await supabase
    .from('user_wallets')
    .insert({ device_id: deviceId, balance: 0 })
    .select('balance')
    .single()

  if (insertError) {
    throw new Error(`Supabase wallet insert failed: ${insertError.message}`)
  }

  return created.balance as number
}

async function updateWallet(deviceId: string, balance: number) {
  const supabase = getSupabaseServerClient()
  const { error } = await supabase
    .from('user_wallets')
    .update({ balance, updated_at: new Date().toISOString() })
    .eq('device_id', deviceId)

  if (error) {
    throw new Error(`Supabase wallet update failed: ${error.message}`)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId.' }, { status: 400 })
    }

    const balance = await getOrCreateWallet(deviceId)
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

    if (!body.deviceId || !Number.isFinite(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: 'Invalid spend request.' }, { status: 400 })
    }

    const balance = await getOrCreateWallet(body.deviceId)
    if (balance < body.amount) {
      return NextResponse.json({ error: 'Insufficient balance.' }, { status: 402 })
    }

    const newBalance = balance - body.amount
    await updateWallet(body.deviceId, newBalance)
    return NextResponse.json({ balance: newBalance })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
