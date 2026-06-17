import React from 'react'
import { Box, type BoxProps, type SxProps, type Theme } from '@mui/material'
import { type LinkProps as NextLinkProps } from 'next/link'

import { NextIntlLink } from '#/common/navigation/navigation'
import { useUIStore } from '#/common/store/uiStore'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/routing/routing-client'
import { useGetRoute } from '#/common/hooks/routing/useGetRoute'

type NextIntlLinkComponentProps = Omit<
  React.ComponentProps<typeof NextIntlLink>,
  'sx'
> & {
  sx?: SxProps<Theme>
}

type MutableLinkProps = React.PropsWithChildren<
  Omit<NextLinkProps, 'href'> &
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
      route: RouteTree
      routeTree: RouteTree
      params?: Params
      removeSteps?: number
      removeStepsFromRoot?: number
      sx?: SxProps<Theme>
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
  ].filter(Boolean) as unknown as SxProps<Theme>

  return (
    <Box
      component={NextIntlLinkComponent as React.ElementType}
      sx={composedSx as BoxProps['sx']}
      prefetch={prefetch}
      {...props}
      href={href}
    >
      {children}
    </Box>
  )
}

export default MutableLink
