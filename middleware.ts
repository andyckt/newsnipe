import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/auth'];
  const isPublicPath = publicPaths.includes(path);
  
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic
  if (!token && !isPublicPath) {
    // If not authenticated and trying to access a protected route,
    // redirect to the auth page
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  if (token && isPublicPath) {
    // If authenticated and trying to access auth page,
    // redirect to the dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/auth', '/dashboard/:path*'],
};
