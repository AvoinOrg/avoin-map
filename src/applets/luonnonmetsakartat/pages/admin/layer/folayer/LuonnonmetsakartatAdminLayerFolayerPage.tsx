import React from 'react'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/common/style/theme'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'

import { ArrowNextBig } from '#/components/icons'
import { AppRouteLink } from '#/common/navigation/appRouteLinks'
import TText from '#/components/common/TText'

import SearchTable from 'applets/luonnonmetsakartat/components/SearchTable'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import { FolayerConfState } from 'applets/luonnonmetsakartat/common/types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { getFolayerCentroidSourceId } from 'applets/luonnonmetsakartat/common/utils'
import { useAppParams } from '#/common/navigation/navigation'

const LuonnonmetsakartatAdminLayerFolayerPage = () => {
  const params = useAppParams<{ folayerIdSlug: string }>()
  const { t } = useTranslate('luonnonmetsakartat')

  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )
  const folayerAreaConf = useAppletStore(
    (state) => state.folayerAreaConfs[params.folayerIdSlug]
  )
  const isFolayerReady = adminFolayerConf?.state === FolayerConfState.Idle

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <SidebarContentBox>
        {!isFolayerReady && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isFolayerReady && adminFolayerConf && (
          <Box sx={{ minWidth: 0 }}>
            <Box
              component="h2"
              sx={{
                typography: 'h2',
                m: 0,
                minWidth: 0,
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.25,
              }}
            >
              {adminFolayerConf.name}
            </Box>
          </Box>
        )}
        {isFolayerReady && adminFolayerConf && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 2,
              mt: 4,
              width: '100%',
              minWidth: 0,
            }}
          >
            <AppRouteLink
              routeKey={
                APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_SETTINGS
              }
              routeParams={{ folayerIdSlug: adminFolayerConf.id }}
              sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
                maxWidth: '100%',
                minWidth: 0,
                textAlign: 'right',
              }}
            >
              <Box
                component="span"
                sx={{
                  typography: 'h6',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: '0.1em',
                  minWidth: 0,
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: 1.35,
                }}
              >
                <TText
                  keyName={'sidebar.admin.folayer.open_settings'}
                  ns={'luonnonmetsakartat'}
                />
              </Box>
              <ArrowNextBig
                aria-hidden="true"
                sx={{ width: '1.5rem', height: '1.125rem', flexShrink: 0 }}
              ></ArrowNextBig>
            </AppRouteLink>
            <AppRouteLink
              routeKey={
                APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER_PICTURES
              }
              routeParams={{ folayerIdSlug: adminFolayerConf.id }}
              sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 1,
                maxWidth: '100%',
                minWidth: 0,
                textAlign: 'right',
              }}
            >
              <Box
                component="span"
                sx={{
                  typography: 'h6',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: '0.1em',
                  minWidth: 0,
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                  lineHeight: 1.35,
                }}
              >
                <TText
                  keyName={'sidebar.admin.folayer.open_pictures'}
                  ns={'luonnonmetsakartat'}
                />
              </Box>
              <ArrowNextBig
                aria-hidden="true"
                sx={{ width: '1.5rem', height: '1.125rem', flexShrink: 0 }}
              ></ArrowNextBig>
            </AppRouteLink>
          </Box>
        )}

        <Box component="h3" sx={{ m: 0, mt: 7, typography: 'h3' }}>
          <TText
            ns={'luonnonmetsakartat'}
            keyName={'sidebar.admin.folayer.all_areas_title'}
          />
        </Box>
        {folayerAreaConf?.data && (
          <SearchTable
            sx={{ mt: 2, pb: 5 }}
            data={folayerAreaConf.data.features}
            source={{
              source: getFolayerCentroidSourceId(params.folayerIdSlug, true),
            }}
            keysToSearch={[
              'properties.name',
              'properties.region',
              'properties.municipality',
            ]}
            sortKeys={[
              {
                key: 'name',
                label: t('sidebar.admin.folayer.sort_by_name'),
              },
              // {
              //   key: 'region',
              //   label: t('sidebar.admin.folayer.sort_by_region'),
              // },
              // {
              //   key: 'municipality',
              //   label: t('sidebar.admin.folayer.sort_by_municipality'),
              // },
            ]}
            searchPlaceholder={t('sidebar.admin.folayer.search_placeholder')}
          ></SearchTable>
        )}
      </SidebarContentBox>
    </Box>
  )
}

export default LuonnonmetsakartatAdminLayerFolayerPage
