import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

function assertAdmin(request: NextRequest) {
  const expected = process.env.ADMIN_DASH_TOKEN
  const provided = request.headers.get('x-admin-token')
  if (!expected || !provided || expected !== provided) {
    throw new Error('Unauthorized')
  }
}

export async function GET(request: NextRequest) {
  try {
    assertAdmin(request)
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')

    if (!deviceId) {
      return NextResponse.json({ error: 'Missing deviceId.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('user_wallets')
      .select('device_id, balance, updated_at')
      .eq('device_id', deviceId)
      .maybeSingle()

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    return NextResponse.json({ wallet: data || null })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    assertAdmin(request)
    const body = await request.json()
    const deviceId = body?.deviceId as string | undefined
    const tokens = Number(body?.tokens)

    if (!deviceId || !Number.isFinite(tokens) || tokens === 0) {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { data: wallet, error: readError } = await supabase
      .from('user_wallets')
      .select('balance')
      .eq('device_id', deviceId)
      .maybeSingle()

    if (readError) {
      throw new Error(`Supabase wallet query failed: ${readError.message}`)
    }

    const currentBalance = wallet?.balance ?? 0
    const newBalance = Math.max(0, currentBalance + tokens)

    const { error: upsertError } = await supabase
      .from('user_wallets')
      .upsert({ device_id: deviceId, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'device_id' })

    if (upsertError) {
      throw new Error(`Supabase wallet update failed: ${upsertError.message}`)
    }

    return NextResponse.json({ balance: newBalance })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
