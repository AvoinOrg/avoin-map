import React from 'react'
import { LinkProps as MuiLinkProps, Link as MuiLink } from '@mui/material'
import NextLink, { LinkProps as NextLinkProps } from 'next/link'

import { useUIStore } from '#/common/store'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/utils/routing'
import { useGetRoute } from '#/common/hooks/routing/useGetRoute'

type LinkProps = Omit<MuiLinkProps & NextLinkProps, 'href'> & {
  route: RouteTree
  routeTree: RouteTree
  params?: Params
  removeSteps?: number
  removeStepsFromRoot?: number
}

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
  ...props
}: LinkProps) => {
  const { routeParams = {}, queryParams = {} } = params

  const isBaseDomainForApplet = useUIStore(
    (state) => state.isBaseDomainForApplet
  )

  const parsedRoute = useGetRoute(
    route,
    routeTree,
    { routeParams, queryParams },
    removeSteps
  )

  return (
    <>
      {isBaseDomainForApplet ? (
        <MuiLink
          component={NextLink}
          sx={{
            display: 'inline-flex',
            color: 'inherit',
            textDecoration: 'none',
            ...sx,
          }}
          prefetch={true}
          {...props}
          href={parsedRoute}
        >
          {children}
        </MuiLink>
      ) : (
        <MuiLink
          component={NextLink}
          sx={{
            display: 'inline-flex',
            color: 'inherit',
            textDecoration: 'none',
            ...sx,
          }}
          prefetch={true}
          {...props}
          href={getRoute(
            route,
            routeTree,
            params,
            removeSteps,
            removeStepsFromRoot
          )}
        >
          {children}
        </MuiLink>
      )}
    </>
  )
}

export default MutableLink
