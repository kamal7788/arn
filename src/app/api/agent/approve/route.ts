import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json();
  const { postId, action } = body;

  if (!postId || !action) {
    return NextResponse.json({ error: 'Missing postId or action' }, { status: 400 });
  }

  try {
    const webhookUrl = `${process.env.N8N_WEBHOOK_BASE}/editorial-approve`;
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, action }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Trigger revalidation after approval
    if (action === 'publish' && data.slug) {
      await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT?.replace('/graphql', '') || ''}/api/revalidate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-revalidation-secret': process.env.REVALIDATION_SECRET || '',
        },
        body: JSON.stringify({ slug: data.slug, type: data.postType || 'post' }),
      });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    return NextResponse.json({ error: 'Approval action failed' }, { status: 500 });
  }
}
