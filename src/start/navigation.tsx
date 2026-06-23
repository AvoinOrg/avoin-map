import {
  useNavigate,
  useParams,
  useRouter as useTanStackRouter,
  useRouterState,
} from '@tanstack/react-router'
import React, { useMemo } from 'react'

import { DEFAULT_LOCALE, LOCALES } from '#/common/navigation/tolgee/shared'
import { generatePathNames } from '#/common/routing/routing'
import { mainRouteTree } from '#/common/routing/routes/main'

export const pathnames = {
  '/': '/',
  ...generatePathNames([mainRouteTree]),
}

export const routing = {
  locales: LOCALES,
  defaultLocale: LOCALES.includes(DEFAULT_LOCALE)
    ? DEFAULT_LOCALE
    : (LOCALES[0] ?? DEFAULT_LOCALE),
  pathnames,
}

export type AppRouteParams = Record<string, string | string[] | undefined>

export type AppRouterNavigateOptions = {
  locale?: string | false
  scroll?: boolean
}

export type AppRouter = {
  push: (href: string, options?: AppRouterNavigateOptions) => void
  replace: (href: string, options?: AppRouterNavigateOptions) => void
  refresh: () => void
}

export type AppLinkHref = string

export type AppLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> & {
  href: AppLinkHref
  locale?: string | false
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
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

const withLocalePrefix = (
  href: string,
  locale: string | false | undefined
) => {
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

const useCurrentLocale = () => {
  const params = useAppParams()
  const pathname = useAppPathname()
  const locale = getLocaleParam(params.locale)

  if (locale) {
    return locale
  }

  const [firstSegment] = pathname.split('/').filter(Boolean)

  return firstSegment && LOCALES.includes(firstSegment)
    ? firstSegment
    : routing.defaultLocale
}

export const useAppRouter = (): AppRouter => {
  const navigate = useNavigate()
  const router = useTanStackRouter()
  const currentLocale = useCurrentLocale()

  return useMemo(
    () => ({
      push: (href, options) => {
        void navigate({
          to: withLocalePrefix(href, options?.locale ?? currentLocale) as never,
        })
      },
      replace: (href, options) => {
        void navigate({
          to: withLocalePrefix(href, options?.locale ?? currentLocale) as never,
          replace: true,
        })
      },
      refresh: () => {
        void router.invalidate()
      },
    }),
    [currentLocale, navigate, router]
  )
}

export const useAppPathname = () =>
  useRouterState({
    select: (state) => state.location.pathname,
  })

export const useAppSearchParams = () =>
  useRouterState({
    select: (state) => new URLSearchParams(state.location.searchStr),
  })

export const useAppParams = <
  TParams extends AppRouteParams = AppRouteParams,
>() => useParams({ strict: false } as never) as TParams

export const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
  (
    {
      href,
      locale,
      replace = false,
      prefetch,
      scroll,
      onClick,
      target,
      ...props
    },
    ref
  ) => {
    void prefetch
    void scroll

    const navigate = useNavigate()
    const currentLocale = useCurrentLocale()
    const resolvedHref = withLocalePrefix(href, locale ?? currentLocale)

    const handleClick: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
      onClick?.(event)

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        target === '_blank' ||
        event.metaKey ||
        event.altKey ||
        event.ctrlKey ||
        event.shiftKey ||
        !isInternalAbsoluteHref(resolvedHref)
      ) {
        return
      }

      event.preventDefault()
      void navigate({
        to: resolvedHref as never,
        replace,
      })
    }

    return (
      <a
        {...props}
        ref={ref}
        href={resolvedHref}
        target={target}
        onClick={handleClick}
      />
    )
  }
)

AppLink.displayName = 'StartAppLink'

export const NextIntlLink = AppLink
export const usePathname = useAppPathname
export const useRouter = useAppRouter
export const useLocalizedPathname = useAppPathname
export const useLocalizedRouter = useAppRouter

export const redirect = (href: string): never => {
  throw new Response(null, {
    status: 302,
    headers: {
      Location: href,
    },
  })
}
