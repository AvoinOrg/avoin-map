import React from 'react'

import { Box, type AppSxProps } from '#/common/style/theme'
import { AppLink, type AppLinkProps } from '#/common/navigation/navigation'
import { useUIStore } from '#/common/store/uiStore'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/routing/routing-client'
import { useGetRoute } from '#/common/hooks/routing/useGetRoute'

type AppLinkComponentProps = Omit<AppLinkProps, 'sx'> & {
  sx?: AppSxProps
}

type MutableLinkProps = React.PropsWithChildren<
  Omit<AppLinkProps, 'href' | 'sx'> &
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

const AppLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  AppLinkComponentProps
>((props, ref) => {
  const { sx, ...nextProps } = props as AppLinkComponentProps
  void sx

  return (
    <AppLink
      {...(nextProps as React.ComponentProps<typeof AppLink>)}
      ref={ref}
    />
  )
})

AppLinkComponent.displayName = 'AppLinkComponent'

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
      component={AppLinkComponent as React.ElementType}
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
