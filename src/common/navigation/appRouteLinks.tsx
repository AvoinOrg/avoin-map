import { useMatches, useParams, useRouter } from '@tanstack/react-router'
import React, { useCallback, useMemo } from 'react'

import {
  AppLink,
  DEFAULT_ROUTE_LOCALE,
  type AppLinkProps,
  type AppRouteParams,
} from '#/common/navigation/navigation'
import {
  getAppRouteMetadata,
  type AppRouteKey,
  type AppRouteMetadata,
} from '#/common/routing/routeMetadata'
import type { QueryParams, SearchParamsLike } from '#/common/types/searchParams'
import { Box, type AppSxProps } from '#/common/style/theme'

type RouteParamValue = string | number | boolean | string[] | undefined | null
type RouteParamInput = Record<string, RouteParamValue>
type SearchParamInput = QueryParams | Record<string, unknown>

type AppRouteRecord = {
  id: string
  fullPath?: string
  to?: string
  options?: {
    staticData?: unknown
  }
}

type RoutesById = Record<string, unknown>

export type AppRouteEntry = {
  routeId: string
  fullPath: string
  to: string
  metadata: AppRouteMetadata
}

export type AppRouteMatchContext = {
  routeId: string
}

export type AppRouteHrefOptions = {
  routeKey: AppRouteKey
  routeParams?: RouteParamInput
  queryParams?: SearchParamInput
  search?: SearchParamInput
  locale?: string
  preferVisible?: boolean
}

type SelectAppRouteEntryOptions = {
  entries: AppRouteEntry[]
  routeKey: AppRouteKey
  currentMatches?: AppRouteMatchContext[]
  preferVisible?: boolean
}

type BuildAppRouteHrefOptions = {
  router: {
    buildLocation: (options: {
      to: string
      params?: Record<string, string>
      search?: Record<string, unknown>
    }) => { href: string }
  }
  entry: AppRouteEntry
  routeParams?: RouteParamInput
  search?: SearchParamInput
}

type ResolveAppRouteHrefOptions = Omit<BuildAppRouteHrefOptions, 'entry'> &
  SelectAppRouteEntryOptions

type AppLinkComponentProps = Omit<AppLinkProps, 'sx'> & {
  sx?: AppSxProps
}

export type AppRouteLinkProps = React.PropsWithChildren<
  Omit<AppLinkProps, 'href' | 'locale' | 'sx'> &
    AppRouteHrefOptions & {
      sx?: AppSxProps
    }
>

export type AppRouteHrefBuilder = (options: AppRouteHrefOptions) => string

const DEFAULT_APP_ROUTE_LINK_SX = {
  display: 'inline-flex',
  color: 'inherit',
  textDecoration: 'none',
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

const isAppRouteRecord = (value: unknown): value is AppRouteRecord =>
  isRecord(value) && typeof value.id === 'string'

const isSearchParamsLike = (
  value: SearchParamInput
): value is SearchParamsLike =>
  isRecord(value) &&
  typeof value.toString === 'function' &&
  (typeof value.entries === 'function' || typeof value.forEach === 'function')

const toSearchObject = (
  search: SearchParamInput | undefined
): Record<string, unknown> | undefined => {
  if (!search) {
    return undefined
  }

  if (isSearchParamsLike(search)) {
    const result: Record<string, string | string[]> = {}

    search.forEach?.((value, key) => {
      const existing = result[key]

      if (existing == null) {
        result[key] = value
        return
      }

      result[key] = Array.isArray(existing)
        ? [...existing, value]
        : [existing, value]
    })

    if (!search.forEach && search.entries) {
      for (const [key, value] of search.entries()) {
        const existing = result[key]

        if (existing == null) {
          result[key] = value
        } else {
          result[key] = Array.isArray(existing)
            ? [...existing, value]
            : [existing, value]
        }
      }
    }

    return result
  }

  return Object.fromEntries(
    Object.entries(search).filter(([, value]) => value !== undefined)
  )
}

const toRouteParamString = (value: RouteParamValue) => {
  if (Array.isArray(value)) {
    return value[0]
  }

  if (value == null) {
    return undefined
  }

  return String(value)
}

const toRouteParams = (
  routeParams: RouteParamInput | undefined
): Record<string, string> | undefined => {
  if (!routeParams) {
    return undefined
  }

  const params = Object.fromEntries(
    Object.entries(routeParams)
      .map(([key, value]) => [key, toRouteParamString(value)] as const)
      .filter((entry): entry is readonly [string, string] => entry[1] != null)
  )

  return Object.keys(params).length > 0 ? params : undefined
}

const getLocaleParam = (locale: RouteParamValue) => {
  const normalized = toRouteParamString(locale)
  return normalized || undefined
}

const getRoutePath = (route: AppRouteRecord) => {
  if (typeof route.fullPath === 'string' && route.fullPath.length > 0) {
    return route.fullPath
  }

  if (typeof route.to === 'string' && route.to.length > 0) {
    return route.to
  }

  throw new Error(`App route "${route.id}" is missing a TanStack route path`)
}

const getRouteTo = (route: AppRouteRecord, fullPath: string) =>
  typeof route.to === 'string' && route.to.length > 0 ? route.to : fullPath

const getEntryMaps = (entries: AppRouteEntry[]) => {
  const byRouteKey = new Map<AppRouteKey, AppRouteEntry>()
  const byRouteId = new Map<string, AppRouteEntry>()

  for (const entry of entries) {
    if (byRouteKey.has(entry.metadata.key)) {
      throw new Error(
        `Duplicate AppRouteKey "${entry.metadata.key}" found while indexing route hrefs`
      )
    }

    byRouteKey.set(entry.metadata.key, entry)
    byRouteId.set(entry.routeId, entry)
  }

  return { byRouteKey, byRouteId }
}

export const collectAppRouteEntries = (
  routesById: RoutesById
): AppRouteEntry[] =>
  Object.values(routesById).flatMap((route): AppRouteEntry[] => {
    if (!isAppRouteRecord(route)) {
      return []
    }

    const metadata = getAppRouteMetadata(route)
    if (!metadata) {
      return []
    }

    const fullPath = getRoutePath(route)

    return [
      {
        routeId: route.id,
        fullPath,
        to: getRouteTo(route, fullPath),
        metadata,
      },
    ]
  })

export const selectAppRouteEntry = ({
  entries,
  routeKey,
  currentMatches = [],
  preferVisible = true,
}: SelectAppRouteEntryOptions): AppRouteEntry => {
  const { byRouteKey, byRouteId } = getEntryMaps(entries)
  const requested = byRouteKey.get(routeKey)

  if (!requested) {
    throw new Error(`Unknown AppRouteKey "${routeKey}"`)
  }

  if (!preferVisible || requested.metadata.variant !== 'canonical') {
    return requested
  }

  const currentEntries = currentMatches
    .map((match) => byRouteId.get(match.routeId))
    .filter((entry): entry is AppRouteEntry => entry != null)

  const visibleRootAlias = currentEntries.find(
    (entry) =>
      entry.metadata.variant === 'visible-root-alias' &&
      Object.values(entry.metadata.public?.visibleRootCanonicalRouteKeys ?? {}).includes(
        routeKey
      )
  )

  if (visibleRootAlias != null) {
    return visibleRootAlias
  }

  const requestedAppletNamespace = requested.metadata.appletNamespace

  if (requestedAppletNamespace != null && requestedAppletNamespace !== 'main') {
    const hasVisibleAliasInSameNamespace = currentEntries.some((entry) => {
      if (entry.metadata.variant !== 'visible-alias') {
        return false
      }

      const canonicalRouteKey = entry.metadata.public?.canonicalRouteKey
      if (canonicalRouteKey == null) {
        return false
      }

      const canonicalEntry = byRouteKey.get(canonicalRouteKey)
      return (
        canonicalEntry?.metadata.appletNamespace ===
        requestedAppletNamespace
      )
    })

    if (hasVisibleAliasInSameNamespace) {
      const visibleRoot = entries.find(
        (entry) =>
          entry.metadata.variant === 'visible-root-alias' &&
          entry.metadata.public?.visibleRootCanonicalRouteKeys?.[
            requestedAppletNamespace
          ] === routeKey
      )

      if (visibleRoot != null) {
        return visibleRoot
      }

      const visibleAlias = entries.find((entry) => {
        if (entry.metadata.variant !== 'visible-alias') {
          return false
        }

        const canonicalRouteKey = entry.metadata.public?.canonicalRouteKey
        if (canonicalRouteKey == null) {
          return false
        }

        const canonicalEntry = byRouteKey.get(canonicalRouteKey)
        return (
          canonicalRouteKey === routeKey &&
          canonicalEntry?.metadata.appletNamespace ===
            requestedAppletNamespace
        )
      })

      if (visibleAlias != null) {
        return visibleAlias
      }
    }
  }

  for (const entry of currentEntries) {
    if (
      entry.metadata.variant === 'visible-alias' &&
      entry.metadata.public?.canonicalRouteKey === routeKey
    ) {
      return entry
    }
  }

  return requested
}

export const buildAppRouteHref = ({
  router,
  entry,
  routeParams,
  search,
}: BuildAppRouteHrefOptions) =>
  router.buildLocation({
    to: entry.to,
    params: toRouteParams(routeParams),
    search: toSearchObject(search),
  }).href

export const resolveAppRouteHref = ({
  router,
  entries,
  routeKey,
  currentMatches,
  preferVisible,
  routeParams,
  search,
}: ResolveAppRouteHrefOptions) => {
  const entry = selectAppRouteEntry({
    entries,
    routeKey,
    currentMatches,
    preferVisible,
  })

  return buildAppRouteHref({
    router,
    entry,
    routeParams,
    search,
  })
}

export const useAppRouteHref = ({
  routeKey,
  routeParams,
  queryParams,
  search,
  locale,
  preferVisible = true,
}: AppRouteHrefOptions) => {
  const build = useAppRouteHrefBuilder()

  return build({
    routeKey,
    routeParams,
    queryParams,
    search,
    locale,
    preferVisible,
  })
}

export const useAppRouteHrefBuilder = (): AppRouteHrefBuilder => {
  const router = useRouter()
  const currentParams = useParams({ strict: false } as never) as AppRouteParams
  const currentMatches = useMatches({
    select: (matches) =>
      matches.map((match) => ({ routeId: String(match.routeId) })),
  }) as AppRouteMatchContext[]

  const entries = useMemo(
    () => collectAppRouteEntries(router.routesById as unknown as RoutesById),
    [router]
  )

  return useCallback(
    ({
      routeKey,
      routeParams: nextRouteParams,
      queryParams,
      search,
      locale: nextLocale,
      preferVisible = true,
    }) => {
      const routeLocale =
        nextLocale ??
        getLocaleParam(nextRouteParams?.locale) ??
        getLocaleParam(currentParams.locale) ??
        DEFAULT_ROUTE_LOCALE

      return resolveAppRouteHref({
        router,
        entries,
        routeKey,
        currentMatches,
        preferVisible,
        routeParams: {
          ...currentParams,
          ...nextRouteParams,
          locale: routeLocale,
        },
        search: search ?? queryParams,
      })
    },
    [currentParams, currentMatches, entries, router]
  )
}

const AppLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  AppLinkComponentProps
>((props, ref) => {
  const { sx, ...nextProps } = props
  void sx

  return (
    <AppLink
      {...(nextProps as React.ComponentProps<typeof AppLink>)}
      ref={ref}
    />
  )
})

AppLinkComponent.displayName = 'AppRouteLinkComponent'

const LinkBox = Box as React.ElementType

export const AppRouteLink = React.forwardRef<
  HTMLAnchorElement,
  AppRouteLinkProps
>(
  (
    {
      routeKey,
      routeParams,
      queryParams,
      search,
      locale,
      preferVisible,
      sx,
      children,
      prefetch = true,
      ...props
    },
    ref
  ) => {
    const href = useAppRouteHref({
      routeKey,
      routeParams,
      queryParams,
      search,
      locale,
      preferVisible,
    })

    const composedSx = [
      DEFAULT_APP_ROUTE_LINK_SX,
      ...(Array.isArray(sx) ? sx : [sx]),
    ].filter(Boolean) as AppSxProps

    return (
      <LinkBox
        component={AppLinkComponent as React.ElementType}
        ref={ref}
        sx={composedSx}
        href={href}
        locale={false}
        prefetch={prefetch}
        {...props}
      >
        {children}
      </LinkBox>
    )
  }
)

AppRouteLink.displayName = 'AppRouteLink'
