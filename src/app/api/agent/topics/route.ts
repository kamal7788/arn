import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json();
  const { agentId, topic, category, state, suburb } = body;

  if (!agentId || !topic) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE}/agent-topic`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, topic, category, state, suburb }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, workflowId: data.workflowId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit topic' }, { status: 500 });
  }
}
