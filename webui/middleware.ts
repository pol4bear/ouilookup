import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent');
  const acceptHeader = request.headers.get('accept');

  if (
    (acceptHeader && acceptHeader.includes('application/json')) ||
    (userAgent && (userAgent.includes('curl') || userAgent.includes('wget')))
  ) {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const query = pathSegments[0];
    const apiUrl = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${query}`);

    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    if (page) {
      apiUrl.searchParams.append('page', page);
    }
    if (limit) {
      apiUrl.searchParams.append('limit', limit);
    }

    const response = await fetch(apiUrl.toString());
    const data = await response.json();

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/([&/]+)'],
};
