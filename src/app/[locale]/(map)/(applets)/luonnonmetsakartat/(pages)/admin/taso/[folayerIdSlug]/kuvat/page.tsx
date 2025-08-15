'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import { SaveOutlined } from '@mui/icons-material'

import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import { useUIStore } from '#/common/store'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'
import { SidebarContentBox } from '#/components/Sidebar'
import { adminFolayerPatchMutation } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import FolayerImportPictures, {
  FolayerImportPicturesRef,
  FolayerImportPicturesValues,
} from 'applets/luonnonmetsakartat/components/FolayerImportPictures'
import { FolayerConfState } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { LoadingSpinner } from '#/components/Loading'

const Page = () => {
  const [isLoading, setIsLoading] = useSidebarActivityLoader()
  const [isReadyToSave, setIsReadyToSave] = useState(false)
  const [componentKey, setComponentKey] = useState(0)
  const picturesRef = useRef<FolayerImportPicturesRef>(null)
  const params = useParams<{ folayerIdSlug: string }>()
  const { t } = useTranslate('luonnonmetsakartat')

  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )

  const localAdminFolayerPatchMutation = useMutation(
    adminFolayerPatchMutation()
  )

  useEffect(() => {
    if (!localAdminFolayerPatchMutation.isPending) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [localAdminFolayerPatchMutation.isPending])

  // After successful save, reset the component state by changing its key
  useEffect(() => {
    if (localAdminFolayerPatchMutation.isSuccess) {
      setIsReadyToSave(false)
      setComponentKey((prev) => prev + 1)
    }
  }, [localAdminFolayerPatchMutation.isSuccess])

  const handleSaveClick = async (event: any) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    if (adminFolayerConf) {
      const picValues = await new Promise<FolayerImportPicturesValues | null>(
        (resolve) => {
          if (!picturesRef.current) return resolve(null)
          picturesRef.current.getValues((vals) => resolve(vals))
        }
      )

      if (picValues && picValues.bulkImages?.length) {
        const payload: any = {
          id: adminFolayerConf.id,
          bulkImages: picValues.bulkImages,
          bulkAreaIds: picValues.bulkAreaIds,
        }
        localAdminFolayerPatchMutation.mutate(payload)
        setIsLoading(true)
      }
    }
  }

  const isFolayerReady =
    adminFolayerConf && adminFolayerConf.state === FolayerConfState.Idle

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <SidebarContentBox sxOuter={{ position: 'relative', flex: 1 }}>
        {!isFolayerReady && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isFolayerReady && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              pb: 5,
            }}
          >
            <FolayerImportPictures
              key={componentKey}
              folayerId={adminFolayerConf.id}
              ref={picturesRef}
              onValidationChange={setIsReadyToSave}
            />
          </Box>
        )}
      </SidebarContentBox>
      {isReadyToSave && (
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
              cursor: 'pointer',
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
