import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  const body = await request.json();
  const { slug, type, paths } = body;

  try {
    const revalidatePath = (await import('next/cache')).revalidatePath;

    if (paths && Array.isArray(paths)) {
      for (const path of paths) {
        revalidatePath(path);
      }
    } else if (slug && type) {
      switch (type) {
        case 'post':
          revalidatePath(`/articles/${slug}`);
          revalidatePath('/');
          break;
        case 'market_report':
          revalidatePath(`/market-report/${slug}`);
          revalidatePath('/');
          break;
        case 'suburb_guide':
          revalidatePath(`/suburb-guide/${slug}`);
          revalidatePath('/');
          break;
        case 'policy_update':
          revalidatePath(`/policy-update/${slug}`);
          revalidatePath('/');
          break;
        default:
          revalidatePath('/');
      }
    } else {
      revalidatePath('/');
    }

    return NextResponse.json({ revalidated: true, timestamp: Date.now() });
  } catch (error) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
