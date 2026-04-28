import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/cart', '/checkout'];
const companyRoutes = ['/company'];
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = request.cookies.get('user')?.value;
  let parsedUser: { role?: string } | null = null;

  try {
    if (user) parsedUser = JSON.parse(decodeURIComponent(user));
  } catch {}

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isCompany = companyRoutes.some(r => pathname.startsWith(r));
  const isAdmin = adminRoutes.some(r => pathname.startsWith(r));

  if ((isProtected || isCompany || isAdmin) && !parsedUser) {
    return NextResponse.redirect(new URL(`/login?redirect=${pathname}`, request.url));
  }

  if (isCompany && parsedUser?.role !== 'COMPANY' && parsedUser?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAdmin && parsedUser?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/company/:path*', '/admin/:path*', '/cart', '/checkout'],
};
