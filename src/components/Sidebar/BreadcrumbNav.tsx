import React, { useMemo } from 'react'
import { useMatches } from '@tanstack/react-router'
import { useTranslate } from '@tolgee/react'

import TText from '#/components/common/TText'
import { AppRouteLink } from '#/common/navigation/appRouteLinks'
import { Box, toSxArray } from '#/common/style/theme/system'
import type { AppSxProps } from '#/common/style/theme/system'
import {
  getAppRouteMetadataFromStaticData,
  type AppRouteKey,
  type RouteTextKey,
} from '#/common/routing/routeMetadata'

interface Props {
  collapseIfRoot?: boolean
  sx?: AppSxProps
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

type BreadcrumbMatch = {
  routeId: string
  params: Record<string, string>
  staticData: unknown
}

type BreadcrumbItem = {
  routeId: string
  routeKey: AppRouteKey
  label: RouteTextKey
  params: Record<string, string>
}

const BreadcrumbBackIcon = ({ sx }: { sx?: AppSxProps }) => (
  <Box
    component="span"
    aria-hidden="true"
    sx={[
      {
        display: 'inline-flex',
        width: '1em',
        height: '1em',
        flexShrink: 0,
      },
      ...toSxArray(sx),
    ]}
  >
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <path d="M14.7 5.3a1 1 0 0 1 0 1.4L9.41 12l5.3 5.3a1 1 0 0 1-1.42 1.4l-6-6a1 1 0 0 1 0-1.4l6-6a1 1 0 0 1 1.42 0Z" />
    </svg>
  </Box>
)

const BreadcrumbNav = ({
  collapseIfRoot = false,
  sx,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const matches = useMatches({
    select: (routeMatches) =>
      routeMatches.map((match) => ({
        routeId: String(match.routeId),
        params: match.params as Record<string, string>,
        staticData: match.staticData,
      })),
  }) as BreadcrumbMatch[]

  const visibleRoutes = useMemo(
    () =>
      matches.flatMap((match): BreadcrumbItem[] => {
        const metadata = getAppRouteMetadataFromStaticData(match.staticData)
        const label = metadata?.breadcrumb ?? metadata?.title

        if (!metadata || !label) {
          return []
        }

        return [
          {
            routeId: match.routeId,
            routeKey: metadata.key,
            label,
            params: match.params,
          },
        ]
      }),
    [matches]
  )

  const RouteElement = ({ route }: { route: BreadcrumbItem }) => (
    <AppRouteLink
      routeKey={route.routeKey}
      routeParams={route.params}
      sx={{ color: 'inherit' }}
    >
      <Box
        sx={(theme) => ({
          ...breadcrumbLabelSx,
          color: theme.palette.neutral.dark,
          '&:hover': { color: theme.palette.primary.main },
        })}
        component="span"
      >
        <TText ns={route.label.ns} keyName={route.label.key} />
      </Box>
    </AppRouteLink>
  )

  const RouteElementInert = ({ label }: { label: RouteTextKey }) => (
    <>
      <Box
        sx={(theme) => ({
          ...breadcrumbLabelSx,
          color: theme.palette.neutral.darker,
        })}
        component="span"
      >
        <TText ns={label.ns} keyName={label.key} />
      </Box>
    </>
  )

  return (
    <Box
      className="breadcrumb-nav"
      sx={[
        (theme) => ({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          color: theme.palette.neutral.dark,
          width: '100%',
        }),
        ...toSxArray(sx),
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
          <AppRouteLink
            routeKey={visibleRoutes[visibleRoutes.length - 2].routeKey}
            routeParams={visibleRoutes[visibleRoutes.length - 2].params}
            aria-label={t('breadcrumb.back')}
            sx={{ alignItems: 'center' }}
          >
            <BreadcrumbBackIcon
              sx={(theme) => ({
                cursor: 'pointer',
                color: theme.palette.neutral.dark,
                height: '0.85rem',
                mt: 0.1,
                ml: -1,
                '&:hover': { color: theme.palette.neutral.main },
              })}
            />
          </AppRouteLink>
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
                    key={route.routeId}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <RouteElementInert label={route.label}></RouteElementInert>
                  </Box>
                )
              }
              return (
                <Box
                  key={route.routeId}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <RouteElement route={route}></RouteElement>
                  <Box
                    sx={(theme) => ({
                      display: 'block',
                      fontSize: '0.75rem',
                      lineHeight: 1.2,
                      color: theme.palette.neutral.dark,
                      margin: '0 3px',
                      position: 'relative',
                      top: '1px',
                    })}
                    component="span"
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
  )
}

export default BreadcrumbNav
