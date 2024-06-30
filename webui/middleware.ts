import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get('user-agent');
  const acceptHeader = request.headers.get('accept');

  if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
    return NextResponse.next();
  }

  const pathSegments = pathname.split('/').filter(segment => segment);

  if (pathSegments.length > 1) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  if (
    (acceptHeader && acceptHeader.includes('application/json')) ||
    (userAgent && (userAgent.includes('curl') || userAgent.includes('wget')))
  ) {
    const query = pathSegments[0];
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/${query}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/:query*'],
};
