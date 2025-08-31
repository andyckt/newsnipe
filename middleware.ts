import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth';
  
  // Get the session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // Redirect logic
  if (isPublicPath && token) {
    // If user is signed in and trying to access auth page, redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (!isPublicPath && !token) {
    // If user is not signed in and trying to access a protected route, redirect to auth page
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/', '/auth'],
};
