import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const userId = await getUserIdFromRequest(request)

    if (!userId && !deviceId) {
      return NextResponse.json({ error: 'Missing identity.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    let query = supabase
      .from('token_purchases')
      .select('id, package_id, amount_bdt, tokens, trx_id, verified, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (userId) {
      query = query.eq('user_id', userId)
    } else if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    return NextResponse.json({ purchases: data || [] })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
