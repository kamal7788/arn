import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { gateway, event_type, payload } = body;

  if (!gateway || !event_type) {
    return NextResponse.json(
      { error: 'Missing required fields: gateway, event_type' },
      { status: 400 }
    );
  }

  try {
    // Forward to n8n for payment processing workflow
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE}/payment-webhook`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateway, event_type, payload }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { error: 'Payment webhook processing failed' },
      { status: 500 }
    );
  }
}
