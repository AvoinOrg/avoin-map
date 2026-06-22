import { useMemo, type ComponentProps } from 'react'
import { createNavigation } from 'next-intl/navigation'
import { defineRouting, type Pathnames } from 'next-intl/routing'
import {
  useParams as useNextParams,
  usePathname as useNextPathname,
  useRouter as useNextRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation'

import { DEFAULT_LOCALE, LOCALES } from '#/common/navigation/tolgee/shared'
import { generatePathNames } from '#/common/routing/routing'
import { RouteTree } from '#/common/types/routing'

type RouteTreeModule = {
  routeTree: RouteTree
}

type RouteTreeRequireContext = {
  keys: () => string[]
  (key: string): RouteTreeModule
}

type RequireWithContext = typeof require & {
  context: (
    path: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ) => RouteTreeRequireContext
}

const requireRouteTrees = (require as RequireWithContext).context(
  '#/app',
  true,
  /routes\.ts$/
)
const routeTrees: RouteTree[] = requireRouteTrees.keys().map((key: string) => {
  const routeModule = requireRouteTrees(key)
  return routeModule.routeTree
})

// Generate pathnames
const mainPathnames = { '/': '/' } satisfies Pathnames<typeof LOCALES>
const generatedPathnames = generatePathNames(routeTrees)
const pathnames = { ...mainPathnames, ...generatedPathnames }
const defaultRoutingLocale = LOCALES.includes(DEFAULT_LOCALE)
  ? DEFAULT_LOCALE
  : (LOCALES[0] ?? DEFAULT_LOCALE)

export { pathnames }

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: defaultRoutingLocale,
  pathnames,
})

export const {
  Link: NextIntlLink,
  redirect,
  usePathname: useLocalizedPathname,
  useRouter: useLocalizedRouter,
} = createNavigation(routing)

export const usePathname = useLocalizedPathname
export const useRouter = useLocalizedRouter

export const AppLink = NextIntlLink
export type AppLinkHref = string
export type AppLinkProps = Omit<ComponentProps<typeof AppLink>, 'href'> & {
  href: AppLinkHref
}

export type AppRouteParams = Record<string, string | string[] | undefined>

type NextRouter = ReturnType<typeof useNextRouter>
type NextRouterNavigateOptions = Parameters<NextRouter['push']>[1]

export type AppRouterNavigateOptions =
  NonNullable<NextRouterNavigateOptions> & {
    locale?: string | false
  }

export type AppRouter = {
  push: (href: string, options?: AppRouterNavigateOptions) => void
  replace: (href: string, options?: AppRouterNavigateOptions) => void
  refresh: NextRouter['refresh']
}

const getLocaleParam = (locale: AppRouteParams[string]) =>
  typeof locale === 'string'
    ? locale
    : Array.isArray(locale)
      ? locale[0]
      : undefined

const isInternalAbsoluteHref = (href: string) =>
  href.startsWith('/') && !href.startsWith('//')

const splitHrefPath = (href: string) => {
  const suffixStart = href.search(/[?#]/)

  if (suffixStart === -1) {
    return { pathname: href, suffix: '' }
  }

  return {
    pathname: href.slice(0, suffixStart),
    suffix: href.slice(suffixStart),
  }
}

const withLocalePrefix = (href: string, locale: string | false | undefined) => {
  if (locale === false || !locale || !isInternalAbsoluteHref(href)) {
    return href
  }

  const { pathname, suffix } = splitHrefPath(href)
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] && LOCALES.includes(segments[0])) {
    segments[0] = locale
    return `/${segments.join('/')}${suffix}`
  }

  const pathWithoutLeadingSlash = pathname.replace(/^\/+/, '')
  const localizedPath = pathWithoutLeadingSlash
    ? `/${locale}/${pathWithoutLeadingSlash}`
    : `/${locale}`

  return `${localizedPath}${suffix}`
}

const getNextRouterOptions = (options?: AppRouterNavigateOptions) => {
  if (!options) {
    return undefined
  }

  const nextOptions = { ...options }
  delete nextOptions.locale

  return Object.keys(nextOptions).length > 0
    ? (nextOptions as NextRouterNavigateOptions)
    : undefined
}

// Temporary F048 dual-stack adapter: shared routing consumers import this
// local surface while Next/next-intl still own runtime navigation. The router
// hook intentionally uses next/navigation so it also works before the
// NextIntlClientProvider exists, while preserving locale-prefixed app URLs.
// Later TanStack Start route-family work should swap these implementations for
// TanStack Router hooks and keep the route-object link contract stable.
export const useAppRouter = (): AppRouter => {
  const router = useNextRouter()
  const params = useNextParams<AppRouteParams>()
  const currentLocale = getLocaleParam(params.locale)

  return useMemo(
    () => ({
      push: (href, options) => {
        const locale = options?.locale ?? currentLocale
        router.push(
          withLocalePrefix(href, locale),
          getNextRouterOptions(options)
        )
      },
      replace: (href, options) => {
        const locale = options?.locale ?? currentLocale
        router.replace(
          withLocalePrefix(href, locale),
          getNextRouterOptions(options)
        )
      },
      refresh: router.refresh,
    }),
    [currentLocale, router]
  )
}
export const useAppPathname = useNextPathname
export const useAppSearchParams = useNextSearchParams
export const useAppParams = <
  TParams extends AppRouteParams = AppRouteParams,
>() => useNextParams<TParams>()
