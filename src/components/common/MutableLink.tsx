import React from 'react'
import { css, cx } from 'styled-system/css'

import { NextIntlLink } from '#/common/navigation/navigation'
import { useUIStore } from '#/common/store'
import { Params, RouteTree } from '#/common/types/routing'
import { getRoute } from '#/common/routing/routing-client'
import { useGetRoute } from '#/common/hooks/routing/useGetRoute'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type NextIntlLinkProps = React.ComponentProps<typeof NextIntlLink>

type LinkProps = Omit<NextIntlLinkProps, 'href' | 'className' | 'style'> & {
  route: RouteTree
  routeTree: RouteTree
  params?: Params
  removeSteps?: number
  removeStepsFromRoot?: number
  sx?: PandaStyleProp
  className?: string
  style?: React.CSSProperties
  underline?: 'none' | 'hover' | 'always'
  color?: React.CSSProperties['color']
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
  className,
  style,
  underline = 'none',
  color = 'inherit',
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

  const href = isBaseDomainForApplet
    ? parsedRoute
    : getRoute({
        routeNode: route,
        routeTree: routeTree,
        params: params,
        removeSteps: removeSteps,
        removeStepsFromRoot: removeStepsFromRoot,
      })

  return (
    <NextIntlLink
      className={cx(
        css({
          display: 'inline-flex',
          color,
          textDecoration: underline === 'always' ? 'underline' : 'none',
          '&:hover':
            underline === 'hover'
              ? {
                  textDecoration: 'underline',
                }
              : undefined,
        }),
        css(...pandaStylePropsToArray(sx)),
        className
      )}
      style={mergePandaStyleProps({ sx, style })}
      prefetch={true}
      {...props}
      href={href as NextIntlLinkProps['href']}
    >
      {children}
    </NextIntlLink>
  )
}

export default MutableLink
