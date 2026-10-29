import { NextRequest, NextResponse } from 'next/server'

// Marketing domains — rewrite to _site landing pages, no auth needed
const MARKETING_HOSTS = new Set(['glowdeskapp.online', 'www.glowdeskapp.online'])

// Public booking domain — book.glowdeskapp.online/{slug}
const BOOKING_HOSTS = new Set(['book.glowdeskapp.online'])

// Public routes on the app domain that never require a session
const PUBLIC = ['/login', '/signup', '/admin-login', '/api/auth', '/api/book', '/book', '/admin', '/api/admin']

function isPublic(pathname: string) {
  return PUBLIC.some(p => pathname.startsWith(p))
}

// Files served from /public that never contain private data
function isPublicAsset(pathname: string) {
  return (
    pathname === '/logo.png' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js' ||
    pathname === '/apple-touch-icon.png' ||
    pathname.startsWith('/icon-') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/fonts/')
  )
}

function route(req: NextRequest) {
  const session    = req.cookies.get('session')?.value
  const { pathname, hostname } = req.nextUrl

  // Pass through static assets regardless of host, so the logo, icons and
  // manifest load on the login page for visitors who are not signed in yet
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || isPublicAsset(pathname)) {
    return NextResponse.next()
  }

  // ── Public booking domain: book.glowdeskapp.online/{slug} → /book/{slug} ──
  if (BOOKING_HOSTS.has(hostname)) {
    // Static assets pass through untouched
    if (pathname.startsWith('/images') || pathname.startsWith('/fonts') || pathname.startsWith('/logo')) {
      return NextResponse.next()
    }
    // Rewrite /{slug} → /book/{slug}
    if (!pathname.startsWith('/book') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone()
      url.pathname = pathname === '/' ? '/book' : `/book${pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // ── Marketing domain: rewrite into _site folder ──────────────────────────
  if (MARKETING_HOSTS.has(hostname)) {
    // Already an internal path or a static public asset — pass through
    if (pathname.startsWith('/marketing') || pathname.startsWith('/images') || pathname.startsWith('/fonts') || pathname.startsWith('/logo') ||
        pathname.startsWith('/icon-') || pathname.startsWith('/apple-touch-icon') || pathname === '/manifest.json' || pathname === '/sw.js') {
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

/**
 * Only the marketing site (glowdeskapp.online) and salon booking pages should appear in Google.
 * Everything else, mainly the app at app.glowdeskapp.online and internal /marketing paths, gets noindex.
 */
export function middleware(req: NextRequest) {
  const res = route(req)
  const { hostname } = req.nextUrl
  if (!MARKETING_HOSTS.has(hostname) && !BOOKING_HOSTS.has(hostname)) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
