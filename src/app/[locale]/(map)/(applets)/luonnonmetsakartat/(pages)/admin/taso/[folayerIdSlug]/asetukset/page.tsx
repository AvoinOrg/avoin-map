'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import { SaveOutlined } from '@mui/icons-material'

import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'
import { useMapStore, useUIStore } from '#/common/store'
import { Delete } from '#/components/icons'
import { getRoute } from '#/common/utils/routing-client'
import IconWithText from '#/components/common/IconWithText'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'

import { FolayerConfState } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { adminFolayerPatchMutation } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { adminFolayerDeleteMutation } from 'applets/luonnonmetsakartat/common/queries/adminFolayerDeleteMutation'
import { routeTree } from 'applets/luonnonmetsakartat/common/routes'
import { getFolayerGroupId } from 'applets/luonnonmetsakartat/common/utils'

const Page = () => {
  const [isFolayerReady, setIsFolayerReady] = useState(false)
  const [isLoading, setIsLoading] = useSidebarActivityLoader()
  const params = useParams<{ folayerIdSlug: string }>()
  const router = useRouter()
  const { t } = useTranslate('luonnonmetsakartat')

  const removeLayerGroup = useMapStore((state) => state.removeLayerGroup)
  const notify = useUIStore((state) => state.notify)
  const triggerConfirmationDialog = useUIStore(
    (state) => state.triggerConfirmationDialog
  )
  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )

  const updateAdminFolayerConf = useAppletStore(
    (state) => state.updateAdminFolayerConf
  )
  const localAdminFolayerPatchMutation = useMutation(
    adminFolayerPatchMutation()
  )
  const localAdminFolayerDeleteMutation = useMutation(
    adminFolayerDeleteMutation()
  )

  useEffect(() => {
    if (adminFolayerConf && adminFolayerConf.state === FolayerConfState.Idle) {
      setIsFolayerReady(true)
    } else {
      setIsFolayerReady(false)
    }
  }, [adminFolayerConf])

  useEffect(() => {
    if (!localAdminFolayerPatchMutation.isPending) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [localAdminFolayerPatchMutation.isPending])

  const handleNameChange = (value: string) => {
    updateAdminFolayerConf(params.folayerIdSlug, {
      name: value,
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
    _e: React.SyntheticEvent<Element, Event>,
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

    setIsLoading(true)
  }

  const handleDeleteClick = async () => {
    if (adminFolayerConf) {
      const handleDeleteConfirm = async () => {
        setIsLoading(true)
        localAdminFolayerDeleteMutation.mutate({
          folayerConf: adminFolayerConf,
          callbackFn: () => {
            removeLayerGroup(getFolayerGroupId(adminFolayerConf.id))
            router.push(
              getRoute({ routeNode: routeTree.admin, routeTree: routeTree })
            )
          },
        })
      }

      triggerConfirmationDialog({
        content: t(
          'sidebar.admin.folayer.settings.delete_confirmation_message'
        ),
        onConfirm: handleDeleteConfirm,
      })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <SidebarContentBox sxOuter={{ position: 'relative' }}>
        {!isFolayerReady &&
          adminFolayerConf.state !== FolayerConfState.Deleting && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LoadingSpinner></LoadingSpinner>
            </Box>
          )}
        {isFolayerReady && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <IconWithText
              sx={{ alignSelf: 'flex-end', color: 'neutral.dark' }}
              icon={<Delete />}
              isIconOnRight={true}
              onClick={handleDeleteClick}
              iconSx={{ height: '1.1rem' }}
              textSx={{ typography: 'h8' }}
            >
              <T
                keyName={'sidebar.admin.folayer.settings.delete'}
                ns={'luonnonmetsakartat'}
              ></T>
            </IconWithText>
            <TextFieldWithHeader
              headerText={t('sidebar.admin.folayer.settings.name.header')}
              value={adminFolayerConf.name}
              onChange={handleNameChange}
              placeholderText={adminFolayerConf.name}
              sx={{ mt: 5.5 }}
            ></TextFieldWithHeader>
            <ColorPickerWithPopover
              color={adminFolayerConf.colorCode}
              onChange={handleColorChange}
              sx={{ mt: 6 }}
              labelText={t('sidebar.admin.folayer.settings.color')}
            ></ColorPickerWithPopover>
            <CheckBoxWithText
              checked={adminFolayerConf.isVisible}
              onChange={handleIsVisibleChange}
              sx={{ mt: 5 }}
            >
              <T
                ns={'luonnonmetsakartat'}
                keyName={'sidebar.admin.folayer.settings.is_visible'}
              ></T>
            </CheckBoxWithText>
          </Box>
        )}
      </SidebarContentBox>
      {adminFolayerConf && adminFolayerConf.unsyncedChanges && (
        <Box
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            pl: SIDEBAR_PADDING_REM + 'rem',
            pr: SIDEBAR_PADDING_REM + 'rem',
            pt: 2,
            pb: 2,
            zIndex: theme.zIndex.drawer + 1,
            borderTop: 1,
            borderColor: 'primary.lighter',
          })}
        >
          <Box
            onClick={handleSaveClick}
            sx={{
              mt: 1.3,
              display: 'inline-flex',
              flexDirection: 'row',
              '&:hover': { cursor: 'pointer' },
              color: 'neutral.dark',
              flex: '0',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-start',
              width: '100%',
            }}
          >
            <Box sx={{ mr: 1.7, display: 'flex', alignItems: 'center' }}>
              <SaveOutlined></SaveOutlined>
              <Typography
                sx={{
                  typography: 'h3',
                  ml: 1,
                }}
              >
                <T
                  keyName={'sidebar.admin.folayer.settings.save'}
                  ns={'luonnonmetsakartat'}
                />
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default Page
