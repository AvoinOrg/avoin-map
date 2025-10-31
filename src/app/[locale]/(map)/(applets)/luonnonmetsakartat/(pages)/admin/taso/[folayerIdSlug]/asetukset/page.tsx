'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { T, useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import { SaveOutlined } from '@mui/icons-material'

import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'
import { useMapStore, useUIStore } from '#/common/store'
import { Delete } from '#/components/icons'
import { getRoute } from '#/common/routing/routing-client'
import IconWithText from '#/components/common/IconWithText'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Upload } from '#/components/icons'

import { FolayerConfState } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { adminFolayerPatchMutation } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { adminFolayerDeleteMutation } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/queries/adminFolayerDeleteMutation'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import { getFolayerGroupId } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/utils'
import FolayerUpdateShp, {
  FolayerUpdateShpRef,
} from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerUpdateShp'
import FolayerImportPictures, {
  FolayerImportPicturesRef,
} from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportPictures'

const Page = () => {
  const [isFolayerReady, setIsFolayerReady] = useState(false)
  const [isLoading, setIsLoading] = useSidebarActivityLoader()
  const [fileType, setFileType] = useState<'shp'>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBuffer[]>()
  const [isUpdateValid, setIsUpdateValid] = useState<boolean>(true)
  const [deleteAreasNotUpdated, setDeleteAreasNotUpdated] =
    useState<boolean>(false)
  const shpRef = useRef<FolayerUpdateShpRef>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const f = e.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(f)

    const newArrayBuffers: ArrayBuffer[] = []

    reader.onloadend = async () => {
      if (reader.result != null) {
        setFileName(f.name)
        if (typeof reader.result !== 'string') {
          const ext = f.name.split('.').pop()?.toLowerCase()
          if (ext === 'zip' || ext === 'shp') {
            setFileType('shp')
            newArrayBuffers.push(reader.result)
          }
          setArrayBuffers(newArrayBuffers)
        } else {
          console.error('reader.result is a string, not an ArrayBuffer')
        }
      }
      e.target.value = ''
    }
  }

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

  // After successful save, clear uploaded file state and reset flags
  useEffect(() => {
    if (localAdminFolayerPatchMutation.isSuccess) {
      setFileName(undefined)
      setFileType(undefined)
      setArrayBuffers(undefined)
      setDeleteAreasNotUpdated(false)
      setIsUpdateValid(true)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }, [localAdminFolayerPatchMutation.isSuccess])

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

  const handleSaveClick = async (event: any) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    if (adminFolayerConf) {
      // Gather shapefile colOptions and confirm validity
      const shpValues = await new Promise<any>((resolve) => {
        if (!shpRef.current) return resolve(null)
        shpRef.current.getValues((vals) => resolve(vals))
      })

      // Build payload, include raw shapefile, deleteAreasNotUpdated, and pictures when provided
      const payload: any = {
        ...adminFolayerConf,
      }
      if (fileType && arrayBuffers?.length) {
        if (shpValues && shpValues.colOptions) {
          payload.colOptions = shpValues.colOptions
        }
        payload.rawShapefile = shpValues?.rawShapefile || arrayBuffers[0]
        payload.deleteAreasNotUpdated = deleteAreasNotUpdated
      }
      localAdminFolayerPatchMutation.mutate(payload)
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
            removeLayerGroup(getFolayerGroupId(adminFolayerConf.id, true))
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
              pb: 5,
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
            <Box
              sx={(theme) => ({
                backgroundColor: theme.palette.neutral.light,
                p: 4,
                borderRadius: '0.3125rem',
                mt: 6,
              })}
            >
              <TextFieldWithHeader
                headerText={t('sidebar.admin.folayer.settings.name.header')}
                value={adminFolayerConf.name}
                onChange={handleNameChange}
                placeholderText={adminFolayerConf.name}
                sx={{ mt: 2 }}
              />
              <ColorPickerWithPopover
                color={adminFolayerConf.colorCode}
                onChange={handleColorChange}
                sx={{ mt: 4 }}
                labelText={t('sidebar.admin.folayer.settings.color')}
              />
              <CheckBoxWithText
                checked={adminFolayerConf.isVisible}
                onChange={handleIsVisibleChange}
                sx={{ mt: 4 }}
              >
                <T
                  ns={'luonnonmetsakartat'}
                  keyName={'sidebar.admin.folayer.settings.is_visible'}
                />
              </CheckBoxWithText>
            </Box>
            {/* Import/update shapefile */}
            <Box
              sx={(theme) => ({
                backgroundColor: theme.palette.neutral.light,
                p: 4,
                borderRadius: '0.3125rem',
                mt: 6,
              })}
            >
              <BigMenuButton
                variant="outlined"
                component="label"
                sx={{ width: '100%', minHeight: '60px' }}
              >
                {fileName ||
                  t('sidebar.admin.folayer.settings.update_with_file')}
                <input
                  hidden
                  accept=".zip"
                  multiple={false}
                  type="file"
                  onChange={handleFileInput}
                  ref={inputRef}
                />
                <Upload sx={{ width: '24px' }} />
              </BigMenuButton>

              {fileType === 'shp' &&
                arrayBuffers &&
                arrayBuffers.length > 0 && (
                  <>
                    <CheckBoxWithText
                      checked={deleteAreasNotUpdated}
                      onChange={(_e, checked) =>
                        setDeleteAreasNotUpdated(checked)
                      }
                      sx={{ mt: 5 }}
                    >
                      <T
                        ns={'luonnonmetsakartat'}
                        keyName={
                          'sidebar.admin.folayer.settings.delete_areas_not_updated'
                        }
                      />
                    </CheckBoxWithText>
                    <Box sx={{ mt: 5 }}>
                      <FolayerUpdateShp
                        fileBuffers={arrayBuffers}
                        adminFolayerConf={adminFolayerConf}
                        onValidationChange={setIsUpdateValid}
                        ref={shpRef}
                      />
                    </Box>
                  </>
                )}
            </Box>
          </Box>
        )}
      </SidebarContentBox>
      {adminFolayerConf && (adminFolayerConf.unsyncedChanges || fileName) && (
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
            onClick={(event) => {
              if (fileType && arrayBuffers?.length && !isUpdateValid) {
                event.preventDefault()
                event.stopPropagation()
                // @ts-ignore
                event.nativeEvent?.stopImmediatePropagation?.()
                return
              }
              handleSaveClick(event)
            }}
            sx={{
              mt: 1.3,
              display: 'inline-flex',
              flexDirection: 'row',
              cursor:
                fileType && arrayBuffers?.length
                  ? isUpdateValid
                    ? 'pointer'
                    : 'not-allowed'
                  : 'pointer',
              '&:hover': {
                cursor:
                  fileType && arrayBuffers?.length
                    ? isUpdateValid
                      ? 'pointer'
                      : 'not-allowed'
                    : 'pointer',
              },
              color: 'neutral.dark',
              flex: '0',
              whiteSpace: 'nowrap',
              alignSelf: 'flex-start',
              width: '100%',
              opacity:
                fileType && arrayBuffers?.length
                  ? isUpdateValid
                    ? 1
                    : 0.5
                  : 1,
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
