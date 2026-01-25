import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .eq('key', 'bkash_number')
      .single()

    if (error) {
      // If settings table doesn't exist, return default
      return NextResponse.json({ bkash_number: '01700000000' })
    }

    return NextResponse.json({ bkash_number: data?.value || '01700000000' })
  } catch (error) {
    // Return default on any error
    return NextResponse.json({ bkash_number: '01700000000' })
  }
}
