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
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('token_purchases')
      .select('id, device_id, package_id, amount_bdt, tokens, trx_id, verified, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    return NextResponse.json({ purchases: data || [] })
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
    const purchaseId = body?.purchaseId as string | undefined

    if (!purchaseId) {
      return NextResponse.json({ error: 'Missing purchaseId.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { error } = await supabase
      .from('token_purchases')
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq('id', purchaseId)

    if (error) {
      throw new Error(`Supabase update failed: ${error.message}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const status = message === 'Unauthorized' ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
