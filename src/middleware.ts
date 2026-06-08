import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Pages anyone can visit WITHOUT logging in
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/auth/reset-password',
  '/auth/update-password',
  '/',                    // landing page
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Always allow emergency cards (public by design) ──
  if (pathname.startsWith('/emergency')) {
    return NextResponse.next({ request });
  }

  // ── 2. Always allow public paths ──
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next({ request });
  }

  // ── 3. Always allow Next.js internals & static files ──
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|json|webmanifest)$/)
  ) {
    return NextResponse.next({ request });
  }

  // ── 4. For everything else, check if user is logged in ──
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  // Not logged in → send to login page
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in → allow through
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT Next.js internals.
     * The middleware function above handles all the allow/deny logic.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};