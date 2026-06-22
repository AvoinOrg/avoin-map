import React from 'react'
import { type LinkProps as NextLinkProps } from 'next/link'

import { Box, type AppSxProps } from '#/common/style/theme'
import { NextIntlLink } from '#/common/navigation/navigation'
import { useUIStore } from '#/common/store/uiStore'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/routing/routing-client'
import { useGetRoute } from '#/common/hooks/routing/useGetRoute'

type NextIntlLinkComponentProps = Omit<
  React.ComponentProps<typeof NextIntlLink>,
  'sx'
> & {
  sx?: AppSxProps
}

type MutableLinkProps = React.PropsWithChildren<
  Omit<NextLinkProps, 'href'> &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
      route: RouteTree
      routeTree: RouteTree
      params?: Params
      removeSteps?: number
      removeStepsFromRoot?: number
      sx?: AppSxProps
    }
>

const DEFAULT_LINK_SX = {
  display: 'inline-flex',
  color: 'inherit',
  textDecoration: 'none',
}

const NextIntlLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  NextIntlLinkComponentProps
>((props, ref) => {
  const { sx, ...nextProps } = props as NextIntlLinkComponentProps
  void sx

  return <NextIntlLink {...nextProps} ref={ref} />
})

NextIntlLinkComponent.displayName = 'NextIntlLinkComponent'

const LinkBox = Box as React.ElementType

/**
 * A link that can be used in applets with their own domain.
 */
const MutableLink = ({
  sx,
  children,
  route,
  routeTree,
  params = {},
  removeSteps = 0,
  removeStepsFromRoot = 0,
  prefetch = true,
  ...props
}: MutableLinkProps) => {
  const { routeParams = {}, queryParams = {} } = params

  const isBaseDomainForApplet = useUIStore(
    (state) => state.isBaseDomainForApplet
  )

  const baseDomainRoute = useGetRoute(
    route,
    routeTree,
    { routeParams, queryParams },
    removeSteps,
    removeStepsFromRoot
  )

  const nonBaseDomainRoute = getRoute({
    routeNode: route,
    routeTree,
    params,
    removeSteps,
    removeStepsFromRoot,
  })

  const href = isBaseDomainForApplet
    ? baseDomainRoute
    : nonBaseDomainRoute

  const composedSx = [
    DEFAULT_LINK_SX,
    ...(Array.isArray(sx) ? sx : [sx]),
  ].filter(Boolean) as AppSxProps

  return (
    <LinkBox
      component={NextIntlLinkComponent as React.ElementType}
      sx={composedSx}
      prefetch={prefetch}
      {...props}
      href={href}
    >
      {children}
    </LinkBox>
  )
}

export default MutableLink
