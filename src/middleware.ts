import { NextResponse, NextRequest } from 'next/server'
import { pathnames } from '#/common/navigation/navigation'
import {
  DEFAULT_LOCALE,
  DEFAULT_NS,
  getLocalesForNs,
} from '#/common/navigation/tolgee/shared'

// If you don't use domain-based detection anymore, remove this import.
import conf from '../localeConf.json' assert { type: 'json' }

// ---------- helpers ----------
const SKIP_PREFIXES = new Set([
  '/_next',
  '/api',
  '/adds',
  '/favicon.ico',
  '/apple-icon',
  '/icon',
  '/robots.txt',
  '/sitemap.xml',
  '/files',
  '/lib',
])

function redirectPreserveQuery(req: NextRequest, toPath: string) {
  const url = req.nextUrl
  const next = new URL(toPath, url)
  next.search = url.search
  if (next.pathname === url.pathname) return NextResponse.next()
  return NextResponse.redirect(next, 308)
}

// Union of all locales once (module scope = cached for all requests)
// const ALL_LOCALES: Set<string> = (() => {
//   const s = new Set<string>([DEFAULT_LOCALE])
//   const data = (conf as any).default || conf
//   for (const ns of Object.keys(data)) {
//     for (const l of (data as any)[ns].langs as string[]) s.add(l)
//   }
//   return s
// })()

const KNOWN_APPLETS = new Set(
  Object.keys((conf as any).default || conf).filter(
    (k) => ((conf as any).default || conf)[k].applet
  )
)

function findAppletFromSegment(seg: string): string | null {
  // First try canonical namespace
  if (KNOWN_APPLETS.has(seg)) return seg
  // Fallback: your `pathnames` alias mapping (if slugs differ from ns)
  const hit = Object.entries(pathnames).find(([, p]) => {
    const first = p.replace(/^\//, '').split('/')[0]?.toLowerCase()
    return first === seg.toLowerCase()
  })
  return hit ? hit[0] : null
}

// Standalone applet? (env controls it)
function getActiveAppletNs(): string | null {
  return process.env.NEXT_PUBLIC_APPLET_NAMESPACE || null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Pass-through ASAP
  for (const p of SKIP_PREFIXES) {
    if (pathname.startsWith(p)) return NextResponse.next()
  }

  const envNs = getActiveAppletNs()
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  // const hasLocale = !!first && ALL_LOCALES.has(first)
  const hasLocale = !!first && first.length === 2

  // ----------------- Standalone APPLET site -----------------
  if (envNs) {
    console.log('isEnvNs')
    const allowed = new Set<string>(getLocalesForNs(envNs))
    const def = getLocalesForNs(envNs)[0] ?? DEFAULT_LOCALE

    // 1) "/" -> "/<def>"
    if (pathname === '/') return redirectPreserveQuery(req, `/${def}`)

    // 2) "/path" -> "/<def>/path"
    if (!hasLocale) return redirectPreserveQuery(req, `/${def}${pathname}`)

    // 3) "/<bad-locale>/..." -> "/<def>/..."
    if (!allowed.has(locale!)) {
      const tail = '/' + segments.slice(1).join('/')
      return redirectPreserveQuery(req, `/${def}${tail}`)
    }

    return NextResponse.next()
  }

  // ----------------- MAIN app (applets under /<locale>/<applet>) -----------------

  // "/" -> "/<DEFAULT_LOCALE>"
  if (pathname === '/') return redirectPreserveQuery(req, `/${DEFAULT_LOCALE}`)

  let locale = hasLocale ? first! : null

  // Figure out if the url includes an applet path
  const probe = hasLocale ? segments[1] : segments[0]
  const targetNs = probe ? findAppletFromSegment(probe) : null
  const isApplet = !!targetNs

  if (isApplet) {
    const localesForNs = getLocalesForNs(targetNs!)

    if (!hasLocale) {
      // "/applet/..." (no locale) -> "/<appletDefault>/applet/..."
      const def = localesForNs[0] ?? DEFAULT_LOCALE
      return redirectPreserveQuery(req, `/${def}${pathname}`)
    }

    if (hasLocale && !localesForNs.includes(locale!)) {
      // "<invalidLocale>/applet/..." -> "/<appletDefaultLocale>/applet/..."
      const def = localesForNs[0] ?? DEFAULT_LOCALE
      const tail = segments.slice(1).join('/')
      return redirectPreserveQuery(req, `/${def}/${tail}`)
    }

    // url is correct, the applet includes the locale
    return NextResponse.next()
  }

  // No applet path detected
  const localesForNs = getLocalesForNs(DEFAULT_NS)

  if (hasLocale) {
    if (!localesForNs.includes(locale!)) {
      const def = localesForNs[0] ?? DEFAULT_LOCALE

      if (segments.length > 1) {
        // replace the invalid locale with default
        return redirectPreserveQuery(
          req,
          `/${def}/${segments.slice(1).join('/')}`
        )
      }

      // no segments, redirect to default locale
      return redirectPreserveQuery(req, `/${def}`)
    }

    // locale is fine, pass without redirecting
    return NextResponse.next()
  }

  if (!hasLocale) {
    const def = localesForNs[0] ?? DEFAULT_LOCALE

    return redirectPreserveQuery(req, `/${def}/${segments.join('/')}`)
  }

  return NextResponse.next()
}

// Narrow scope so assets truly bypass (and to reduce edge work)
export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|files|lib).*)'],
}
