import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const defaultAllowedHeaders =
  'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Internal-Auth-Secret, X-Internal-User-Id';

function isAllowedOrigin(origin: string): boolean {
  return allowedOrigins.includes(origin);
}

function withCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.headers.get('origin');
  const requestHeaders =
    request.headers.get('access-control-request-headers') ?? defaultAllowedHeaders;

  response.headers.set('Vary', 'Origin');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  response.headers.set('Access-Control-Allow-Headers', requestHeaders);

  if (origin && isAllowedOrigin(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (origin && !isAllowedOrigin(origin)) {
    return NextResponse.json(
      { success: false, message: 'CORS origin not allowed' },
      { status: 403 },
    );
  }

  if (request.method === 'OPTIONS') {
    return withCorsHeaders(new NextResponse(null, { status: 204 }), request);
  }

  return withCorsHeaders(NextResponse.next(), request);
}

export const config = {
  matcher: '/api/:path*',
};
