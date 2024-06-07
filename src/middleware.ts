import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { pathnames } from '#/common/navigation/navigation'
import {
  DEFAULT_LOCALE,
  getLocaleObj,
  getLocalesForNs,
  ALL_NS_LANGS,
} from '#/common/navigation/tolgee/shared'

// check out locale validity and redirect if needed
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  let splitUrl: string[] = []

  if (pathname != null && request.nextUrl.pathname !== '' && pathname !== '/') {
    splitUrl = request.nextUrl.pathname.split('/').filter((path) => path !== '')
    const locale = splitUrl[0]

    let localeObj = getLocaleObj(locale as string)
    const localeExists = Object.keys(localeObj).length > 0
    let localeParamMissing = false

    if (!localeExists || splitUrl.length > 1) {
      let matchedPath: string | undefined

      // find the possible matching path for the relevant part of the url
      if (localeExists && splitUrl.length > 1) {
        matchedPath = findMatchedPath(pathnames, splitUrl[1])
      } else {
        matchedPath = findMatchedPath(pathnames, splitUrl[0])

        if (matchedPath != null) {
          localeParamMissing = true
        } else if (splitUrl.length > 1) {
          matchedPath = findMatchedPath(pathnames, splitUrl[1])
        }
      }

      // if the path is legit
      if (matchedPath) {
        if (Object.keys(ALL_NS_LANGS).includes(matchedPath)) {
          let appletLocale = locale
          if (!localeExists) {
            appletLocale = DEFAULT_LOCALE
          }
          const appletPath = matchedPath as keyof typeof ALL_NS_LANGS
          const localesForNs = getLocalesForNs(appletPath)

          if (localesForNs.includes(locale)) {
            if (!localeExists) {
              // redirect to the global default locale
              if (!localeParamMissing) {
                // if an invalid locale param was supplied, remove the locale from path
                return NextResponse.redirect(
                  new URL(
                    `/${appletLocale}/${splitUrl.slice(1).join('/')}`,
                    request.url
                  )
                )
              }
              return NextResponse.redirect(
                new URL(`/${appletLocale}${pathname}`, request.url)
              )
            }
          } else {
            // redirect to default (first) locale for the applet
            appletLocale = localesForNs[0]

            if (!localeParamMissing) {
              // if an invalid locale param was supplied, remove the locale from path
              return NextResponse.redirect(
                new URL(
                  `/${appletLocale}/${splitUrl.slice(1).join('/')}`,
                  request.url
                )
              )
            }
            return NextResponse.redirect(
              new URL(`/${appletLocale}/${pathname}`, request.url)
            )
          }
        }
      }

      if (!localeExists) {
        // redirect to the global default locale
        return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

const findMatchedPath = (
  pathnames: Record<string, string>,
  urlPath: string
) => {
  let match = Object.values(pathnames).find((pathname) => {
    const splitPathname = pathname.split('/').filter((path) => path !== '')
    if (splitPathname.length > 0) {
      return splitPathname[0].toLowerCase() === urlPath.toLowerCase()
    }
  })

  if (match != null && match.charAt(0) === '/') {
    match = match.slice(1)
  }
  return match
}
