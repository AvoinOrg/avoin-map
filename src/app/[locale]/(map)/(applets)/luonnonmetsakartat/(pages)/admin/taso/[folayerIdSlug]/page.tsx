'use client'

import React, {
  useRef,
  useEffect,
  useState,
  ChangeEvent,
  use,
  useMemo,
} from 'react'
import { Box, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import { SaveOutlined } from '@mui/icons-material'

import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'

import { ArrowNextBig } from '#/components/icons'
import MutableLink from '#/components/common/MutableLink'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'

import { adminFolayerPatchMutation } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import SearchTable from 'applets/luonnonmetsakartat/components/SearchTable'
import { routeTree } from 'applets/luonnonmetsakartat/common/routes'
import { FolayerConfState } from 'applets/luonnonmetsakartat/common/types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'

const Page = () => {
  const [isFolayerReady, setIsFolayerReady] = useState(false)
  const [isAreaCollectionReady, setIsAreaCollectionReady] = useState(false)
  const params = useParams<{ folayerIdSlug: string }>()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useTranslate('luonnonmetsakartat')

  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )
  const folayerAreaCollection = useAppletStore(
    (state) => state.folayerAreaCollections[params.folayerIdSlug]
  )
  const updateAdminFolayerConf = useAppletStore(
    (state) => state.updateAdminFolayerConf
  )
  const localAdminFolayerPatchMutation = useMutation(
    adminFolayerPatchMutation()
  )

  useEffect(() => {
    if (adminFolayerConf && adminFolayerConf.state === FolayerConfState.Idle) {
      setIsFolayerReady(true)
    } else {
      setIsFolayerReady(false)
    }
    console.log(adminFolayerConf)
  }, [adminFolayerConf])

  useEffect(() => {
    if (
      folayerAreaCollection &&
      folayerAreaCollection.state === FolayerConfState.Idle
    ) {
      setIsAreaCollectionReady(true)
    } else {
      setIsAreaCollectionReady(false)
    }
    console.log(folayerAreaCollection)
  }, [folayerAreaCollection])

  const isEditingDisabled = useMemo(() => {
    if (adminFolayerConf && adminFolayerConf.state === FolayerConfState.Idle) {
      return false
    }
    return true
  }, [adminFolayerConf?.state])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    updateAdminFolayerConf(params.folayerIdSlug, {
      name: newName,
      unsyncedChanges: true,
    })
  }

  const handleColorChange = (color: string) => {
    updateAdminFolayerConf(params.folayerIdSlug, {
      colorCode: color,
      unsyncedChanges: true,
    })
  }

  const handleIsVisibleChange = (
    _e: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    updateAdminFolayerConf(params.folayerIdSlug, {
      isVisible: checked,
      unsyncedChanges: true,
    })
  }

  const handleSaveClick = (event: any) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    if (adminFolayerConf) {
      localAdminFolayerPatchMutation.mutate(adminFolayerConf)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <SidebarContentBox>
        {!isFolayerReady && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isFolayerReady && (
          <Box>
            <Typography sx={{ typography: 'h2' }}>
              {adminFolayerConf.name}
            </Typography>
          </Box>
        )}
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
            params={{ routeParams: { folayerId: adminFolayerConf.id } }}
            sx={{ alignItems: 'center' }}
          >
            <Typography
              sx={{
                typography: 'h6',
                fontWeight: 500,
                textDecoration: 'underline',
                textUnderlineOffset: '0.1em',
              }}
            >
              <T
                keyName={'sidebar.admin.folayer.open_settings'}
                ns={'luonnonmetsakartat'}
              ></T>
            </Typography>
            <ArrowNextBig sx={{ ml: 1, height: '1.2rem' }}></ArrowNextBig>
          </MutableLink>
        </Box>

        <Typography sx={{ mt: 7, typography: 'h3' }}>
          <T
            ns={'luonnonmetsakartat'}
            keyName={'sidebar.admin.folayer.all_areas_title'}
          ></T>
        </Typography>
        <SearchTable
          sx={{ mt: 2, pb: 5 }}
          data={folayerAreaCollection.features}
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
      </SidebarContentBox>
    </Box>
  )
}

export default Page
