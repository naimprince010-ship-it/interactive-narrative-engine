import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

type PurchaseRequest = {
  deviceId: string
  packageId: 'trial' | 'bonus' | 'best'
  trxId?: string
}

const PACKAGES = {
  trial: { amount: 10, tokens: 100 },
  bonus: { amount: 50, tokens: 550 },
  best: { amount: 100, tokens: 1200 },
} as const

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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PurchaseRequest
    if (!body.deviceId || !body.packageId || !(body.packageId in PACKAGES)) {
      return NextResponse.json({ error: 'Invalid purchase request.' }, { status: 400 })
    }

    const pack = PACKAGES[body.packageId]
    const supabase = getSupabaseServerClient()

    const currentBalance = await getOrCreateWallet(body.deviceId)
    const newBalance = currentBalance + pack.tokens

    const { error: purchaseError } = await supabase.from('token_purchases').insert({
      device_id: body.deviceId,
      package_id: body.packageId,
      amount_bdt: pack.amount,
      tokens: pack.tokens,
      trx_id: body.trxId || null,
    })

    if (purchaseError) {
      throw new Error(`Supabase purchase insert failed: ${purchaseError.message}`)
    }

    const { error: walletError } = await supabase
      .from('user_wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('device_id', body.deviceId)

    if (walletError) {
      throw new Error(`Supabase wallet update failed: ${walletError.message}`)
    }

    return NextResponse.json({ balance: newBalance, tokens: pack.tokens })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
