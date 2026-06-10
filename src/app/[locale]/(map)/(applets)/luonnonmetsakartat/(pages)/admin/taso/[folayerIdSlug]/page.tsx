'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'

import { ArrowNextBig } from '#/components/icons'
import MutableLink from '#/components/common/MutableLink'

import SearchTable from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/SearchTable'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { FolayerConfState } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { getFolayerCentroidSourceId } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/utils'

const Page = () => {
  const params = useParams<{ folayerIdSlug: string }>()
  const { t } = useTranslate('luonnonmetsakartat')

  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )
  const folayerAreaConf = useAppletStore(
    (state) => state.folayerAreaConfs[params.folayerIdSlug]
  )

  const isFolayerReady =
    adminFolayerConf && adminFolayerConf.state === FolayerConfState.Idle

  return (
    <Box styleProps={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <SidebarContentBox>
        {!isFolayerReady && (
          <Box styleProps={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isFolayerReady && (
          <Box>
            <Box component="h2" styleProps={{ typography: 'h2', m: 0 }}>
              {adminFolayerConf.name}
            </Box>
          </Box>
        )}
        <Box
          styleProps={{
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
            params={{ routeParams: { folayerId: adminFolayerConf.id } }}
            styleProps={{ alignItems: 'center' }}
          >
            <Box
              component="span"
              styleProps={{
                typography: 'h6',
                fontWeight: 500,
                textDecoration: 'underline',
                textUnderlineOffset: '0.1em',
              }}
            >
              <TText
                keyName={'sidebar.admin.folayer.open_settings'}
                ns={'luonnonmetsakartat'}
              ></TText>
            </Box>
            <ArrowNextBig styleProps={{ ml: 1, height: '1.2rem' }}></ArrowNextBig>
          </MutableLink>
        </Box>
        <Box
          styleProps={{
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
            params={{ routeParams: { folayerId: adminFolayerConf.id } }}
            styleProps={{ alignItems: 'center' }}
          >
            <Box
              component="span"
              styleProps={{
                typography: 'h6',
                fontWeight: 500,
                textDecoration: 'underline',
                textUnderlineOffset: '0.1em',
              }}
            >
              <TText
                keyName={'sidebar.admin.folayer.open_pictures'}
                ns={'luonnonmetsakartat'}
              ></TText>
            </Box>
            <ArrowNextBig styleProps={{ ml: 1, height: '1.2rem' }}></ArrowNextBig>
          </MutableLink>
        </Box>

        <Box component="h3" styleProps={{ mt: 7, typography: 'h3', mb: 0 }}>
          <TText
            ns={'luonnonmetsakartat'}
            keyName={'sidebar.admin.folayer.all_areas_title'}
          ></TText>
        </Box>
        {folayerAreaConf?.data && (
          <SearchTable
            styleProps={{ mt: 2, pb: 5 }}
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
