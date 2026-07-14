import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { postId, actions } = body;

  if (!postId || !actions || !Array.isArray(actions)) {
    return NextResponse.json(
      { error: 'Missing required fields: postId, actions (array)' },
      { status: 400 }
    );
  }

  const validActions = ['summarize', 'seo_suggest', 'fact_check', 'suggest_headlines'];
  const invalidActions = actions.filter((a: string) => !validActions.includes(a));
  if (invalidActions.length > 0) {
    return NextResponse.json(
      { error: `Invalid actions: ${invalidActions.join(', ')}. Valid: ${validActions.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    // Forward to n8n for AI assistance workflow
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE}/editor-ai-assist`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, actions }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      suggestions: data.suggestions || data,
    });
  } catch (error) {
    console.error('Editor AI assist error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI suggestions' },
      { status: 500 }
    );
  }
}
