import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, license_details, preferred_agency, payment_session_id, plan_id } = body;

  if (!name || !email || !phone || !license_details) {
    return NextResponse.json(
      { error: 'Missing required fields: name, email, phone, license_details' },
      { status: 400 }
    );
  }

  try {
    // Forward to n8n for agent vetting workflow
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE}/agent-vetting`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        phone,
        license_details,
        preferred_agency,
        payment_session_id,
        plan_id,
        submitted_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      applicationId: data.applicationId || data.id,
      message: 'Application submitted successfully. We will review your application shortly.',
    });
  } catch (error) {
    console.error('Agent application error:', error);
    return NextResponse.json(
      { error: 'Failed to submit application. Please try again.' },
      { status: 500 }
    );
  }
}
