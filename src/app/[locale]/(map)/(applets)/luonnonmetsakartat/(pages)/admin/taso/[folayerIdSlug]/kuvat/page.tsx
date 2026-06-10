'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import { Box } from '#/components/common/PandaBox'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'
import { SidebarContentBox } from '#/components/Sidebar'
import { adminFolayerPatchMutation } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import FolayerImportPictures, {
  FolayerImportPicturesRef,
  FolayerImportPicturesValues,
} from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportPictures'
import { FolayerConfState } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { LoadingSpinner } from '#/components/Loading'
import SaveActionButton from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/SaveActionButton'

const Page = () => {
  const [, setIsLoading] = useSidebarActivityLoader()
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

  const handleSaveClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
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
        const payload = {
          ...adminFolayerConf,
          bulkImages: picValues.bulkImages,
          bulkAreaIds: picValues.bulkAreaIds,
        }
        localAdminFolayerPatchMutation.mutate(payload, {
          onSuccess: () => {
            setIsReadyToSave(false)
            setComponentKey((prev) => prev + 1)
          },
        })
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
          sx={{
            display: 'flex',
            flexDirection: 'column',
            pl: SIDEBAR_PADDING_REM + 'rem',
            pr: SIDEBAR_PADDING_REM + 'rem',
            pt: 2,
            pb: 2,
            zIndex: 'calc(var(--z-index-drawer) + 1)',
            borderTop: 1,
            borderColor: 'primary.lighter',
          }}
        >
          <SaveActionButton
            keyName="sidebar.admin.folayer.pictures.save"
            ariaLabel={t('sidebar.admin.folayer.pictures.save')}
            onClick={handleSaveClick}
            sx={{
              mt: 1.3,
              alignSelf: 'flex-start',
              width: '100%',
            }}
          />
        </Box>
      )}
    </Box>
  )
}

export default Page
