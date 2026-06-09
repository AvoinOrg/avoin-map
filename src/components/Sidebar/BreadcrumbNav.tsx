import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'

import type { PandaStyleProp } from '#/common/style/panda'
import MutableLink from '#/components/common/MutableLink'
import { Box } from '#/components/common/PandaBox'
import { compiledApplets, getRoutesForPath } from '#/common/routing/routing'
import { RouteForLinks, RouteTree } from '#/common/types/routing'
import { useUIStore } from '#/common/store'
import { mainRouteTree } from '#/common/routing/routes/main'
import { ArrowLeft } from '#/components/icons'

interface Props {
  routeTree: RouteTree
  collapseIfRoot?: boolean
  appletNamespace?: string
  sx?: PandaStyleProp
}

const breadcrumbLabelSx = {
  display: 'block',
  fontSize: '0.72rem',
  lineHeight: 1.2,
  fontWeight: 600,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  position: 'relative',
  top: '1px',
} as const

const BreadcrumbNav = ({ routeTree, collapseIfRoot = false, sx }: Props) => {
  const pathname = usePathname()
  const isBaseDomainForApplet = useUIStore(
    (state) => state.isBaseDomainForApplet
  )
  const isStandaloneAppletBuild =
    compiledApplets.length === 1 && !compiledApplets.includes('main')

  const { routes, usedRouteTree } = useMemo(() => {
    if (
      isStandaloneAppletBuild ||
      (isBaseDomainForApplet && !mainRouteTree._conf.domain)
    ) {
      return {
        routes: getRoutesForPath(pathname, routeTree),
        usedRouteTree: routeTree,
      }
    }
    return {
      routes: getRoutesForPath(pathname, mainRouteTree),
      usedRouteTree: mainRouteTree,
    }
  }, [routeTree, isBaseDomainForApplet, isStandaloneAppletBuild, pathname])

  const visibleRoutes = useMemo(() => {
    const isAppletBreadcrumbInMainApp =
      usedRouteTree === mainRouteTree && routeTree !== mainRouteTree

    return isAppletBreadcrumbInMainApp ? routes.slice(1) : routes
  }, [routeTree, routes, usedRouteTree])

  const RouteElement = ({ route }: { route: RouteForLinks }) => (
    <MutableLink
      route={route.routeTree}
      routeTree={usedRouteTree}
      params={route.params}
      sx={{ color: 'inherit' }}
    >
      <Box
        component="span"
        sx={{
          ...breadcrumbLabelSx,
          color: 'neutral.dark',
          '&:hover': { color: 'primary.main' },
        }}
      >
        {route.name}
      </Box>
    </MutableLink>
  )

  const RouteElementInert = ({ name }: { name: string }) => (
    <>
      <Box
        component="span"
        sx={{
          ...breadcrumbLabelSx,
          color: 'neutral.darker',
        }}
      >
        {name}
      </Box>
    </>
  )

  return (
    <Box
      className="breadcrumb-nav"
      sx={[
        {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          color: 'neutral.dark',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
        collapseIfRoot && visibleRoutes.length <= 1
          ? {
              minHeight: '0px',
              height: '0px',
              flexGrow: 0,
              mt: 0,
              mb: 0,
              pt: 0,
              pb: 0,
            }
          : { flexGrow: 1 },
      ]}
    >
      {visibleRoutes.length > 1 && (
        <Box
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <MutableLink
            route={visibleRoutes[visibleRoutes.length - 2].routeTree}
            routeTree={usedRouteTree}
            params={visibleRoutes[visibleRoutes.length - 2].params}
            sx={{ alignItems: 'center' }}
          >
            <ArrowLeft
              sx={{
                cursor: 'pointer',
                color: 'neutral.dark',
                width: '0.85rem',
                height: '0.85rem',
                mt: 0.1,
                ml: -1,
                '&:hover': { color: 'neutral.main' },
              }}
            />
          </MutableLink>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row',
              alignItems: 'center',
              rowGap: '0.125rem',
            }}
          >
            {visibleRoutes.map((route) => {
              if (route === visibleRoutes[visibleRoutes.length - 1]) {
                return (
                  <Box
                    key={route.path}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <RouteElementInert name={route.name}></RouteElementInert>
                  </Box>
                )
              }
              return (
                <Box
                  key={route.path}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <RouteElement route={route}></RouteElement>
                  <Box
                    component="span"
                    sx={{
                      display: 'block',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      color: 'neutral.dark',
                      margin: '0 3px',
                      position: 'relative',
                      top: '1px',
                    }}
                  >
                    /
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>
      )}
    </Box>

    // <nav aria-label="breadcrumb">
    //   {breadcrumbs.map((breadcrumb, index) => {
    //     const isLast = index === breadcrumbs.length - 1;
    //     const breadcrumbPath = `/${breadcrumbs.slice(0, index + 1).join('/')}`;

    //     return (
    //       <React.Fragment key={breadcrumb}>
    //         {!isLast ? (
    //           <MutableLink href={breadcrumbPath}>
    //             <a>{breadcrumb}</a>
    //           </MutableLink>
    //         ) : (
    //           <span>{breadcrumb}</span>
    //         )}
    //         {!isLast && separator}
    //       </React.Fragment>
    //     );
    //   })}
    // </nav>
  )
}

export default BreadcrumbNav
