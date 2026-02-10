import React, { useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { Box, SxProps, Theme, Typography } from '@mui/material'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'

import MutableLink from '#/components/common/MutableLink'
import { compiledApplets, getRoutesForPath } from '#/common/routing/routing'
import { RouteForLinks, RouteTree } from '#/common/types/routing'
import { useUIStore } from '#/common/store'
import { mainRouteTree } from '#/common/routing/routes/main'

interface Props {
  routeTree: RouteTree
  collapseIfRoot?: boolean
  appletNamespace?: string
  sx?: SxProps<Theme>
}

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

  const RouteElement = ({ route }: { route: RouteForLinks }) => (
    <MutableLink
      route={route.routeTree}
      routeTree={usedRouteTree}
      params={route.params}
      sx={{ color: 'inherit' }}
    >
      <Typography
        sx={(theme) => ({
          display: 'inline-block',
          typography: theme.typography.subtitle2,
          '&:hover': { color: theme.palette.primary.main },
          textTransform: 'uppercase',
        })}
      >
        {route.name}
      </Typography>
    </MutableLink>
  )

  const RouteElementInert = ({ name }: { name: string }) => (
    <>
      <Typography
        sx={(theme) => ({
          display: 'inline-block',
          typography: theme.typography.subtitle2,
          color: 'neutral.darker',
          textTransform: 'uppercase',
        })}
      >
        {name}
      </Typography>
    </>
  )

  return (
    <Box
      className="breadcrumb-nav"
      sx={[
        (theme) => ({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          color: theme.palette.neutral.dark,
          width: '100%',
          pb: 2,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
        collapseIfRoot && routes.length <= 1
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
      {routes.length > 1 && (
        <Box
          sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        >
          <MutableLink
            route={routes[routes.length - 2].routeTree}
            routeTree={usedRouteTree}
            params={routes[routes.length - 2].params}
          >
            <ArrowBackIosNewIcon
              sx={(theme) => ({
                float: 'left',
                cursor: 'pointer',
                color: theme.palette.neutral.dark,
                margin: '0 10px 0 -5px',
                '&:hover': { color: theme.palette.neutral.main },
              })}
            ></ArrowBackIosNewIcon>
          </MutableLink>
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {routes.map((route) => {
              if (route === routes[routes.length - 1]) {
                return (
                  <RouteElementInert
                    key={route.path}
                    name={route.name}
                  ></RouteElementInert>
                )
              }
              return (
                <Box
                  sx={(theme) => ({
                    display: 'inline-block',
                    lineHeight: '0',
                    height: '18px',
                  })}
                  key={route.path}
                >
                  <RouteElement route={route}></RouteElement>
                  <Typography
                    sx={(theme) => ({
                      display: 'inline-block',
                      margin: '0 5px 0 5px',
                    })}
                  >
                    /
                  </Typography>
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
