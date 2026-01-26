import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

function assertAdmin(request: NextRequest) {
  const token = request.headers.get('x-admin-token')
  const expectedToken = process.env.ADMIN_DASH_TOKEN

  if (!expectedToken || token !== expectedToken) {
    throw new Error('Unauthorized')
  }
}

export async function GET(request: NextRequest) {
  try {
    assertAdmin(request)

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key')

    if (error) {
      throw error
    }

    return NextResponse.json({ settings: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    assertAdmin(request)

    const body = await request.json()
    const { key, value, description } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('settings')
      .upsert(
        {
          key,
          value,
          description: description || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      )
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ setting: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update setting' },
      { status: 401 }
    )
  }
}
