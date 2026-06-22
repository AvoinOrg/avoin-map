'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useParams } from 'next/navigation'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Box } from '#/common/style/theme'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'
import { SidebarContentBox } from '#/components/Sidebar'
import { Button } from '#/components/common/Button'
import TText from '#/components/common/TText'
import { Save } from '#/components/icons'
import { adminFolayerPatchMutation } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import FolayerImportPictures, {
  FolayerImportPicturesRef,
  FolayerImportPicturesValues,
} from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportPictures'
import { FolayerConfState } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { LoadingSpinner } from '#/components/Loading'

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
  }, [localAdminFolayerPatchMutation.isPending, setIsLoading])

  const handleSaveClick = async (event: MouseEvent<HTMLElement>) => {
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
          id: adminFolayerConf.id,
          bulkImages: picValues.bulkImages,
          bulkAreaIds: picValues.bulkAreaIds,
        } as unknown as Parameters<
          typeof localAdminFolayerPatchMutation.mutate
        >[0]
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
          <Button
            type="button"
            variant="text"
            color="neutral"
            aria-label={t('sidebar.admin.folayer.pictures.save')}
            onClick={handleSaveClick}
            startIcon={<Save />}
            sx={{
              mt: 1.3,
              display: 'inline-flex',
              width: '100%',
              minWidth: 0,
              minHeight: 'auto',
              justifyContent: 'flex-start',
              alignSelf: 'flex-start',
              p: 0,
              color: 'neutral.dark',
              typography: 'h3',
              gap: 1,
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <TText
              keyName={'sidebar.admin.folayer.pictures.save'}
              ns={'luonnonmetsakartat'}
            />
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Page
