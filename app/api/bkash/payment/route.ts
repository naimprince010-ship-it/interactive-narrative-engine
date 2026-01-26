import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabaseServer'

export const runtime = 'nodejs'

const REQUIRED_AMOUNT = 10

type Action = 'create' | 'execute'

type CreateRequest = {
  action: 'create'
  storyId: string
  amount: number
  returnUrl: string
  deviceId?: string
}

type ExecuteRequest = {
  action: 'execute'
  storyId: string
  paymentID: string
  deviceId?: string
}

async function getIdToken() {
  const appKey = process.env.BKASH_CHECKOUT_APP_KEY
  const appSecret = process.env.BKASH_CHECKOUT_APP_SECRET
  const username = process.env.BKASH_CHECKOUT_USERNAME
  const password = process.env.BKASH_CHECKOUT_PASSWORD
  const baseUrl = process.env.BKASH_CHECKOUT_BASE_URL

  if (!appKey || !appSecret || !username || !password || !baseUrl) {
    throw new Error('Missing bKash environment variables.')
  }

  const response = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      username,
      password,
    },
    body: JSON.stringify({
      app_key: appKey,
      app_secret: appSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`bKash token error: ${errorText}`)
  }

  const data = await response.json()
  if (!data.id_token) {
    throw new Error('bKash token response missing id_token.')
  }

  return {
    idToken: data.id_token as string,
    appKey,
    baseUrl,
  }
}

async function createPayment(payload: CreateRequest) {
  if (payload.amount !== REQUIRED_AMOUNT) {
    throw new Error('Invalid payment amount.')
  }

  const { idToken, appKey, baseUrl } = await getIdToken()
  const invoiceId = `${payload.storyId}-${Date.now()}`

  const response = await fetch(`${baseUrl}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: idToken,
      'x-app-key': appKey,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: payload.deviceId || 'anonymous',
      callbackURL: payload.returnUrl,
      amount: REQUIRED_AMOUNT.toFixed(2),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceId,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`bKash create error: ${errorText}`)
  }

  return response.json()
}

async function executePayment(payload: ExecuteRequest) {
  const { idToken, appKey, baseUrl } = await getIdToken()

  const response = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: idToken,
      'x-app-key': appKey,
    },
    body: JSON.stringify({
      paymentID: payload.paymentID,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`bKash execute error: ${errorText}`)
  }

  return response.json()
}

async function savePaymentRecord(params: {
  paymentID: string
  trxID?: string
  storyId: string
  deviceId?: string
}) {
  const supabase = getSupabaseServerClient()

  const { error } = await supabase.from('payments').insert({
    payment_id: params.paymentID,
    trx_id: params.trxID || null,
    story_id: params.storyId,
    device_id: params.deviceId || null,
  })

  if (error) {
    throw new Error(`Supabase insert failed: ${error.message}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateRequest | ExecuteRequest
    if (!body?.action) {
      return NextResponse.json({ error: 'Missing action.' }, { status: 400 })
    }

    if (body.action === 'create') {
      const payload = body as CreateRequest
      if (!payload.storyId || !payload.returnUrl) {
        return NextResponse.json({ error: 'Missing storyId or returnUrl.' }, { status: 400 })
      }

      const data = await createPayment(payload)
      return NextResponse.json({
        bkashURL: data.bkashURL || data.bkashUrl,
        paymentID: data.paymentID,
        raw: data,
      })
    }

    if (body.action === 'execute') {
      const payload = body as ExecuteRequest
      if (!payload.storyId || !payload.paymentID) {
        return NextResponse.json({ error: 'Missing storyId or paymentID.' }, { status: 400 })
      }

      const data = await executePayment(payload)
      const statusCode = data.statusCode || data.status_code
      const statusMessage = data.statusMessage || data.status_message
      const transactionStatus = data.transactionStatus || data.transaction_status

      const isSuccess =
        statusCode === '0000' ||
        statusMessage === 'Successful' ||
        transactionStatus === 'Completed'

      if (isSuccess) {
        await savePaymentRecord({
          paymentID: data.paymentID || payload.paymentID,
          trxID: data.trxID,
          storyId: payload.storyId,
          deviceId: payload.deviceId,
        })
      }

      return NextResponse.json({
        success: isSuccess,
        paymentID: data.paymentID || payload.paymentID,
        trxID: data.trxID,
        raw: data,
      })
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storyId = searchParams.get('storyId')
    const deviceId = searchParams.get('deviceId')

    if (!storyId) {
      return NextResponse.json({ error: 'Missing storyId.' }, { status: 400 })
    }

    const supabase = getSupabaseServerClient()
    let query = supabase.from('payments').select('id').eq('story_id', storyId).limit(1)

    if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`Supabase query failed: ${error.message}`)
    }

    return NextResponse.json({ hasPayment: (data || []).length > 0 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
