import { NextRequest, NextResponse } from 'next/server'

// Marketing domains — rewrite to _site landing pages, no auth needed
const MARKETING_HOSTS = new Set(['glowdeskapp.online', 'www.glowdeskapp.online'])

// Public routes on the app domain that never require a session
const PUBLIC = ['/login', '/signup', '/admin-login', '/api/auth', '/api/book', '/book', '/admin', '/api/admin']

function isPublic(pathname: string) {
  return PUBLIC.some(p => pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
  const session    = req.cookies.get('session')?.value
  const { pathname, hostname } = req.nextUrl

  // Pass through static assets regardless of host
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // ── Marketing domain: rewrite into _site folder ──────────────────────────
  if (MARKETING_HOSTS.has(hostname)) {
    // Already an internal path or a static public asset — pass through
    if (pathname.startsWith('/marketing') || pathname.startsWith('/images') || pathname.startsWith('/fonts') || pathname.startsWith('/logo')) {
      return NextResponse.next()
    }

    const url = req.nextUrl.clone()
    url.pathname = pathname === '/' ? '/marketing' : `/marketing${pathname}`
    return NextResponse.rewrite(url)
  }

  // API routes — let through (they do their own auth)
  if (pathname.startsWith('/api')) return NextResponse.next()

  // Internal _site paths accessed directly — allow
  if (pathname.startsWith('/marketing')) return NextResponse.next()

  // Tenant booking subdomains (e.g. salonname.glowdeskapp.online)
  const isProductionSubdomain =
    (hostname.endsWith('.glowdesk.app') && hostname !== 'glowdesk.app' && hostname !== 'www.glowdesk.app') ||
    (hostname.endsWith('.glowdeskapp.online') && hostname !== 'glowdeskapp.online' && hostname !== 'www.glowdeskapp.online' && hostname !== 'app.glowdeskapp.online')
  if (isProductionSubdomain) {
    const slug = hostname.split('.')[0]
    const res  = NextResponse.next()
    res.headers.set('x-tenant-slug', slug)
    if (!session && !isPublic(pathname)) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return res
  }

  // Redirect authenticated users away from login/signup
  if (session && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Public routes
  if (isPublic(pathname)) return NextResponse.next()

  // Protected: require session cookie
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
