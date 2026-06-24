'use client'

import React from 'react'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/common/style/theme'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'

import { ArrowNextBig } from '#/components/icons'
import MutableLink from '#/components/common/MutableLink'
import TText from '#/components/common/TText'

import SearchTable from 'applets/luonnonmetsakartat/components/SearchTable'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { FolayerConfState } from 'applets/luonnonmetsakartat/common/types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { getFolayerCentroidSourceId } from 'applets/luonnonmetsakartat/common/utils'
import { useAppParams } from '#/common/navigation/navigation'

const Page = () => {
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
          <Box>
            <Box component="h2" sx={{ typography: 'h2', m: 0 }}>
              {adminFolayerConf.name}
            </Box>
          </Box>
        )}
        {isFolayerReady && adminFolayerConf && (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                mt: 4,
                width: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <MutableLink
                route={routeTree.admin.folayer.settings}
                routeTree={routeTree}
                params={{
                  routeParams: { folayerIdSlug: adminFolayerConf.id },
                }}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  component="span"
                  sx={{
                    typography: 'h6',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    textUnderlineOffset: '0.1em',
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.folayer.open_settings'}
                    ns={'luonnonmetsakartat'}
                  />
                </Box>
                <ArrowNextBig sx={{ ml: 1, height: '1.2rem' }}></ArrowNextBig>
              </MutableLink>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                mt: 2,
                width: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <MutableLink
                route={routeTree.admin.folayer.pictures}
                routeTree={routeTree}
                params={{
                  routeParams: { folayerIdSlug: adminFolayerConf.id },
                }}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  component="span"
                  sx={{
                    typography: 'h6',
                    fontWeight: 500,
                    textDecoration: 'underline',
                    textUnderlineOffset: '0.1em',
                  }}
                >
                  <TText
                    keyName={'sidebar.admin.folayer.open_pictures'}
                    ns={'luonnonmetsakartat'}
                  />
                </Box>
                <ArrowNextBig sx={{ ml: 1, height: '1.2rem' }}></ArrowNextBig>
              </MutableLink>
            </Box>
          </>
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

export default Page
