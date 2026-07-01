'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Box } from '#/common/style/theme'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'
import { SidebarContentBox } from '#/components/Sidebar'
import { Button } from '#/components/common/Button'
import TText from '#/components/common/TText'
import { SaveOutlined } from '#/components/icons'
import { useAdminFolayerPatchMutationOptions } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import FolayerImportPictures, {
  FolayerImportPicturesRef,
  FolayerImportPicturesValues,
} from 'applets/luonnonmetsakartat/components/FolayerImportPictures'
import { FolayerConfState } from 'applets/luonnonmetsakartat/common/types'
import { LoadingSpinner } from '#/components/Loading'
import { useAppParams } from '#/common/navigation/navigation'
import { useLuonnonmetsakartatMockScenarioQueryState } from 'applets/luonnonmetsakartat/common/mockScenarios/queryState'
import {
  createLuonnonmetsakartatMockPicturesMappedFixtureState,
  createLuonnonmetsakartatMockPicturesUnmatchedFixtureState,
} from 'applets/luonnonmetsakartat/common/mockScenarios/seedData'

const Page = () => {
  const [, setIsLoading] = useSidebarActivityLoader()
  const [isReadyToSave, setIsReadyToSave] = useState(false)
  const [componentKey, setComponentKey] = useState(0)
  const picturesRef = useRef<FolayerImportPicturesRef>(null)
  const params = useAppParams<{ folayerIdSlug: string }>()
  const { t } = useTranslate('luonnonmetsakartat')
  const mockScenarioState = useLuonnonmetsakartatMockScenarioQueryState()

  const adminFolayerConf = useAppletStore(
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )

  const localAdminFolayerPatchMutation = useMutation(
    useAdminFolayerPatchMutationOptions()
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
  const pictureFixtureState = useMemo(
    () =>
      mockScenarioState === 'pictures-mapped'
        ? createLuonnonmetsakartatMockPicturesMappedFixtureState()
        : mockScenarioState === 'pictures-unmatched'
          ? createLuonnonmetsakartatMockPicturesUnmatchedFixtureState()
          : undefined,
    [mockScenarioState]
  )

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
              key={`${componentKey}-${mockScenarioState ?? 'normal'}`}
              folayerId={adminFolayerConf.id}
              ref={picturesRef}
              onValidationChange={setIsReadyToSave}
              fixtureState={pictureFixtureState}
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
            startIcon={<SaveOutlined />}
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
