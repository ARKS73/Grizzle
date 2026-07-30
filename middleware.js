import { NextResponse } from 'next/server';
import { verifyJoseToken, COOKIE_NAME } from '@/lib/edgeJwt';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedCustomerRoute =
    pathname.startsWith('/cart') ||
    pathname.startsWith('/wishlist') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/profile');

  const isAdminRoute = pathname.startsWith('/admin');

  if (!isProtectedCustomerRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get(COOKIE_NAME);
  const token = tokenCookie ? tokenCookie.value : null;

  const decoded = token ? await verifyJoseToken(token) : null;

  // Unauthenticated user trying to access customer protected routes
  if (isProtectedCustomerRoute && !decoded) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User or unauthenticated trying to access admin route without admin role
  if (isAdminRoute) {
    if (!decoded) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cart/:path*', '/wishlist/:path*', '/checkout/:path*', '/orders/:path*', '/profile/:path*'],
};
