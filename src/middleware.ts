import { NextResponse, NextRequest } from 'next/server'
import {
  DEFAULT_LOCALE,
  getLocalesForApplet,
} from '#/common/navigation/tolgee/shared'
import { compiledApplets } from './common/routing/routing'
import { MAIN_NAMESPACE } from './common/routing/routes/main'

// If you don't use domain-based detection anymore, remove this import.
import conf from '../appletConf.json' assert { type: 'json' }

// ---------- helpers ----------
const SKIP_PREFIXES = new Set([
  '/_next',
  '/api',
  '/favicon.ico',
  '/apple-icon',
  '/icon',
  '/robots.txt',
  '/sitemap.xml',
  '/files',
  '/lib',
])

const COMMON_LOCALIZED_PATHS = new Set<string>(['/adds'])

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
  Object.keys((conf as any).default || conf).filter((k) => k !== MAIN_NAMESPACE)
)

const APPLET_PATH_ALIASES: Record<string, string> = {
  energymap: 'energiakartta',
}

function findAppletFromSegment(seg: string): string | null {
  const normalized = seg.toLowerCase()

  // First try canonical namespace
  if (KNOWN_APPLETS.has(normalized)) return normalized
  if (APPLET_PATH_ALIASES[normalized] != null) {
    return APPLET_PATH_ALIASES[normalized]
  }

  // Fallback: your `pathnames` alias mapping (if slugs differ from ns)
  return null
  // const hit = Object.entries(pathnames).find(([, p]) => {
  //   const first = p.replace(/^\//, '').split('/')[0]?.toLowerCase()
  //   return first === seg.toLowerCase()
  // })
  // console.log('hit', hit)
  // return hit ? hit[0] : null
}

// Standalone applet? (env controls it)
function getActiveAppletNs(): string | null {
  if (compiledApplets.length === 1 && compiledApplets[0] !== MAIN_NAMESPACE) {
    return compiledApplets[0]
  }
  return null
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Pass-through ASAP
  for (const p of SKIP_PREFIXES) {
    if (pathname.startsWith(p)) {
      return NextResponse.next()
    }
  }

  const envNs = getActiveAppletNs()
  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  // const hasLocale = !!first && ALL_LOCALES.has(first)
  const hasLocale = !!first && first.length === 2
  const locale = hasLocale ? first! : null

  // handle common localized paths, which are the same regardless of APPLET mode
  for (const p of COMMON_LOCALIZED_PATHS) {
    const pathWithoutSlash = p.replace(/^\//, '')

    // TODO: Add a check later to actually validate the localizations
    if (hasLocale) {
      if (segments[1] === pathWithoutSlash) {
        return NextResponse.next()
      }
    } else {
      if (segments[0] === pathWithoutSlash) {
        return NextResponse.next()
      }
    }
  }
  // ----------------- Standalone APPLET site -----------------
  if (envNs) {
    const allowed = new Set<string>(getLocalesForApplet(envNs))
    const def = getLocalesForApplet(envNs)[0] ?? DEFAULT_LOCALE

    // Make the locale visible in the URL (redirect)
    if (pathname === '/') return redirectPreserveQuery(req, `/${def}`)
    const segments = pathname.split('/').filter(Boolean)
    const first = segments[0]
    const hasLocale = !!first && first.length === 2 // or use your own ALL_LOCALES check
    const locale = hasLocale ? first! : null

    if (!hasLocale) {
      // "/path" -> "/<def>/path" (visible change)
      return redirectPreserveQuery(req, `/${def}${pathname}`)
    }

    if (!allowed.has(locale!)) {
      // "/<bad-locale>/..." -> "/<def>/..." (visible change)
      const tail = segments.length > 1 ? `/${segments.slice(1).join('/')}` : ''
      return redirectPreserveQuery(req, `/${def}${tail}`)
    }

    // At this point URL is "/<locale>[/...]" and locale is valid.
    // Internally serve from "/<locale>/<ns>[/...]" WITHOUT changing the URL:
    const tail = segments.length > 1 ? `/${segments.slice(1).join('/')}` : ''
    return NextResponse.rewrite(new URL(`/${locale}/${envNs}${tail}`, req.url))
  }

  // ----------------- MAIN app (applets under /<locale>/<applet>) -----------------

  // "/" -> "/<DEFAULT_LOCALE>"
  if (pathname === '/') return redirectPreserveQuery(req, `/${DEFAULT_LOCALE}`)

  // Figure out if the url includes an applet path
  const probe = hasLocale ? segments[1] : segments[0]
  const targetNs = probe ? findAppletFromSegment(probe) : null
  const isApplet = !!targetNs
  const isAppletAlias = probe != null && targetNs != null && probe !== targetNs

  if (isApplet) {
    const localesForNs = getLocalesForApplet(targetNs!)

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
    if (isAppletAlias) {
      const tail = segments.length > 2 ? `/${segments.slice(2).join('/')}` : ''
      return NextResponse.rewrite(
        new URL(`/${locale}/${targetNs}${tail}`, req.url)
      )
    }

    return NextResponse.next()
  }

  // No applet path detected
  const localesForNs = getLocalesForApplet(MAIN_NAMESPACE)

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
