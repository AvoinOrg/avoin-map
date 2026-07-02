'use client'

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type SyntheticEvent,
} from 'react'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Box, type AppSxProps, type AppTheme } from '#/common/style/theme'
import {
  MOBILE_SIDEBAR_PADDING_REM,
  SIDEBAR_PADDING_REM,
} from '#/common/style/theme/constants'
import { Button } from '#/components/common/Button'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'
import { useMapStore, useUIStore } from '#/common/store'
import { Delete, SaveOutlined, Upload } from '#/components/icons'
import { useAppRouteHrefBuilder } from '#/common/navigation/appRouteLinks'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import IconWithText from '#/components/common/IconWithText'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'
import BigMenuButton from '#/components/common/BigMenuButton'
import TText from '#/components/common/TText'
import {
  useAppParams,
  useAppRouter,
} from '#/common/navigation/navigation'

import {
  FolayerConfState,
  type AdminFolayerConf,
  type ColOptions,
} from 'applets/luonnonmetsakartat/common/types'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useAdminFolayerPatchMutationOptions } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPatchMutation'
import { useAdminFolayerDeleteMutationOptions } from 'applets/luonnonmetsakartat/common/queries/adminFolayerDeleteMutation'
import { getFolayerGroupId } from 'applets/luonnonmetsakartat/common/utils'
import FolayerUpdateShp, {
  type FolayerUpdateShpRef,
} from 'applets/luonnonmetsakartat/components/FolayerUpdateShp'

type FolayerPatchPayload = AdminFolayerConf & {
  colOptions?: ColOptions
  rawShapefile?: ArrayBuffer
  deleteAreasNotUpdated?: boolean
}

type FolayerUpdateValues = {
  colOptions: ColOptions
  rawShapefile: ArrayBuffer
} | null

const settingsRootSx = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
} as const

const settingsSidebarOuterSx = {
  position: 'relative',
  flex: '1 1 auto',
  minHeight: 0,
} as const

const settingsContentSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: {
    mobile: 3,
    desktop: 4,
  },
  pb: {
    mobile: 3,
    desktop: 4,
  },
  minWidth: 0,
} as const

const settingsPanelSx = (theme: AppTheme) => ({
  backgroundColor: theme.palette.neutral.light,
  p: {
    mobile: 2.5,
    desktop: 3,
  },
  borderRadius: '0.3125rem',
  display: 'flex',
  flexDirection: 'column',
  gap: {
    mobile: 2,
    desktop: 2.25,
  },
  minWidth: 0,
})

const loadingStateSx = {
  flex: '1 1 auto',
  minHeight: {
    mobile: '20rem',
    desktop: '24rem',
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  py: {
    mobile: 4,
    desktop: 6,
  },
} as const

const loadingSpinnerFrameSx = (theme: AppTheme) => ({
  width: {
    mobile: '3.25rem',
    desktop: '3rem',
  },
  height: {
    mobile: '3.25rem',
    desktop: '3rem',
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '999px',
  backgroundColor: theme.palette.neutral.light,
  border: `1px solid ${theme.palette.primary.lighter}`,
  boxShadow: '0 1px 4px rgba(17, 17, 17, 0.05)',
})

const deleteActionSx = {
  alignSelf: 'flex-end',
  color: 'neutral.dark',
  maxWidth: '100%',
  minWidth: 0,
  minHeight: '2rem',
  justifyContent: 'flex-end',
} as const

const deleteActionIconSx = {
  width: '1.1rem',
  height: '1.1rem',
  flexShrink: 0,
} as const

const deleteActionTextSx = {
  typography: 'body2',
  lineHeight: 1.35,
  minWidth: 0,
  overflowWrap: 'anywhere',
} as const

const fieldSx = {
  mb: 0,
  minWidth: 0,
} as const

const colorPickerSx = {
  width: 'fit-content',
  minHeight: '34px',
  maxWidth: '100%',
  alignItems: 'center',
} as const

const colorPickerBoxSx = {
  width: 26,
  height: 26,
} as const

const compactSwitchSx = {
  width: 'fit-content',
  maxWidth: '100%',
  minHeight: '34px',
} as const

const wrappingSwitchSx = {
  width: '100%',
  minWidth: 0,
  alignItems: 'flex-start',
} as const

const switchControlSx = {
  flex: '0 0 44px',
} as const

const switchLabelSx = {
  minWidth: 0,
  lineHeight: 1.35,
  overflowWrap: 'anywhere',
} as const

const uploadButtonSx = {
  width: '100%',
  height: 'auto',
  minHeight: '60px',
  alignItems: 'center',
  gap: 2,
  py: 1.5,
  overflow: 'hidden',
} as const

const uploadButtonLabelSx = {
  minWidth: 0,
  flex: '1 1 auto',
  display: '-webkit-box',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  overflowWrap: 'anywhere',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: {
    mobile: 2,
    desktop: 1,
  },
  lineHeight: 1.35,
  textAlign: 'left',
} as const

const uploadIconSx = {
  width: '24px',
  height: '24px',
  flex: '0 0 auto',
} as const

const selectedUpdateStackSx = {
  display: 'flex',
  flexDirection: 'column',
  gap: {
    mobile: 2.5,
    desktop: 3,
  },
  minWidth: 0,
} as const

const saveFooterSx = (theme: AppTheme) => ({
  display: 'flex',
  flex: '0 0 auto',
  flexDirection: 'column',
  px: {
    mobile: `${MOBILE_SIDEBAR_PADDING_REM}rem`,
    desktop: `${SIDEBAR_PADDING_REM}rem`,
  },
  pt: {
    mobile: 1.5,
    desktop: 1.75,
  },
  pb: {
    mobile: '6rem',
    desktop: 1.75,
  },
  zIndex: theme.zIndex.drawer + 1,
  borderTop: 1,
  borderColor: 'primary.lighter',
  backgroundColor: theme.palette.neutral.light,
})

const saveButtonSx: AppSxProps = {
  display: 'inline-flex',
  width: '100%',
  minWidth: 0,
  minHeight: '36px',
  justifyContent: 'flex-start',
  alignSelf: 'flex-start',
  px: 0,
  py: 0.5,
  color: 'neutral.darker',
  typography: 'body1',
  fontWeight: 700,
  lineHeight: 1.35,
  gap: 1,
  textAlign: 'left',
  whiteSpace: 'normal',
  overflowWrap: 'anywhere',
  '&:hover': {
    backgroundColor: 'transparent',
    color: 'neutral.darker',
  },
  '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
    color: 'neutral.dark',
    backgroundColor: 'transparent',
    opacity: 0.75,
    cursor: 'not-allowed',
  },
}

const Page = () => {
  const [, setIsLoading] = useSidebarActivityLoader()
  const [fileType, setFileType] = useState<'shp'>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBuffer[]>()
  const [isUpdateValid, setIsUpdateValid] = useState<boolean>(true)
  const [deleteAreasNotUpdated, setDeleteAreasNotUpdated] =
    useState<boolean>(false)
  const shpRef = useRef<FolayerUpdateShpRef>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const params = useAppParams<{ folayerIdSlug: string }>()
  const router = useAppRouter()
  const buildAppRouteHref = useAppRouteHrefBuilder()
  const { t } = useTranslate('luonnonmetsakartat')

  const removeLayerGroup = useMapStore((state) => state.removeLayerGroup)
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
    useAdminFolayerPatchMutationOptions()
  )
  const localAdminFolayerDeleteMutation = useMutation(
    useAdminFolayerDeleteMutationOptions()
  )
  const isFolayerReady =
    adminFolayerConf?.state === FolayerConfState.Idle
  const isSaving =
    adminFolayerConf?.state === FolayerConfState.Saving ||
    localAdminFolayerPatchMutation.isPending

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
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
    if (!localAdminFolayerPatchMutation.isPending) {
      setIsLoading(false)
    } else {
      setIsLoading(true)
    }
  }, [localAdminFolayerPatchMutation.isPending, setIsLoading])

  const resetUpdateFileState = () => {
    setFileName(undefined)
    setFileType(undefined)
    setArrayBuffers(undefined)
    setDeleteAreasNotUpdated(false)
    setIsUpdateValid(true)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

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
    _e: SyntheticEvent<Element, Event>,
    checked: boolean
  ) => {
    updateAdminFolayerConf(params.folayerIdSlug, {
      isVisible: checked,
      unsyncedChanges: true,
    })
  }

  const handleSaveClick = async (event: MouseEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    if (adminFolayerConf) {
      // Gather shapefile colOptions and confirm validity
      const shpValues = await new Promise<FolayerUpdateValues>((resolve) => {
        if (!shpRef.current) return resolve(null)
        shpRef.current.getValues((vals) => resolve(vals))
      })

      // Build payload, include raw shapefile, deleteAreasNotUpdated, and pictures when provided
      const payload: FolayerPatchPayload = {
        ...adminFolayerConf,
      }
      if (fileType && arrayBuffers?.length) {
        if (shpValues && shpValues.colOptions) {
          payload.colOptions = shpValues.colOptions
        }
        payload.rawShapefile = shpValues?.rawShapefile || arrayBuffers[0]
        payload.deleteAreasNotUpdated = deleteAreasNotUpdated
      }
      localAdminFolayerPatchMutation.mutate(payload, {
        onSuccess: resetUpdateFileState,
      })
    }

    setIsLoading(true)
  }

  const handleDeleteClick = async () => {
    if (adminFolayerConf) {
      const handleDeleteConfirm = async () => {
        setIsLoading(true)
        localAdminFolayerDeleteMutation.mutate({
          folayerConf: adminFolayerConf,
          callbackFn: async () => {
            await removeLayerGroup(getFolayerGroupId(adminFolayerConf.id, true))
            router.push(
              buildAppRouteHref({
                routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN,
              }),
              { locale: false }
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

  const hasSelectedUpdate = fileType === 'shp' && Boolean(arrayBuffers?.length)
  const isSaveDisabledByUpdate = hasSelectedUpdate && !isUpdateValid
  const isSaveDisabled = isSaveDisabledByUpdate || isSaving
  const isDeleting = adminFolayerConf?.state === FolayerConfState.Deleting
  const shouldShowSaveFooter = Boolean(
    adminFolayerConf && (adminFolayerConf.unsyncedChanges || fileName)
  )

  return (
    <Box sx={settingsRootSx}>
      <SidebarContentBox sxOuter={settingsSidebarOuterSx}>
        {!isFolayerReady && !isDeleting && (
          <Box sx={loadingStateSx}>
            <Box sx={loadingSpinnerFrameSx}>
              <LoadingSpinner></LoadingSpinner>
            </Box>
          </Box>
        )}
        {isFolayerReady && adminFolayerConf && (
          <Box sx={settingsContentSx}>
            <IconWithText
              sx={deleteActionSx}
              icon={<Delete />}
              isIconOnRight={true}
              onClick={handleDeleteClick}
              iconSx={deleteActionIconSx}
              textSx={deleteActionTextSx}
              ariaLabel={t('sidebar.admin.folayer.settings.delete')}
            >
              <TText
                keyName={'sidebar.admin.folayer.settings.delete'}
                ns={'luonnonmetsakartat'}
              />
            </IconWithText>
            <Box
              sx={settingsPanelSx}
            >
              <TextFieldWithHeader
                headerText={t('sidebar.admin.folayer.settings.name.header')}
                value={adminFolayerConf.name}
                onChange={handleNameChange}
                placeholderText={adminFolayerConf.name}
                sx={fieldSx}
              />
              <ColorPickerWithPopover
                color={adminFolayerConf.colorCode}
                onChange={handleColorChange}
                sx={colorPickerSx}
                colorBoxSx={colorPickerBoxSx}
                labelSx={switchLabelSx}
                labelText={t('sidebar.admin.folayer.settings.color')}
                popoverProps={{
                  positionerProps: {
                    style: { zIndex: 1400 },
                  },
                }}
                popoverSx={(theme) => ({
                  position: 'relative',
                  zIndex: theme.zIndex.modal + 1,
                })}
              />
              <SwitchWithLabel
                checked={adminFolayerConf.isVisible}
                onChange={handleIsVisibleChange}
                sx={compactSwitchSx}
                controlSx={switchControlSx}
                labelSx={switchLabelSx}
                ariaLabel={t('sidebar.admin.folayer.settings.is_visible')}
              >
                <TText
                  ns={'luonnonmetsakartat'}
                  keyName={'sidebar.admin.folayer.settings.is_visible'}
                />
              </SwitchWithLabel>
            </Box>
            {/* Import/update shapefile */}
            <Box
              sx={settingsPanelSx}
            >
              <BigMenuButton
                variant="outlined"
                component="label"
                sx={uploadButtonSx}
                aria-label={
                  fileName ??
                  t('sidebar.admin.folayer.settings.update_with_file')
                }
              >
                <Box component="span" sx={uploadButtonLabelSx}>
                  {fileName ||
                    t('sidebar.admin.folayer.settings.update_with_file')}
                </Box>
                <input
                  hidden
                  accept=".zip"
                  multiple={false}
                  type="file"
                  onChange={handleFileInput}
                  ref={inputRef}
                />
                <Upload aria-hidden="true" sx={uploadIconSx} />
              </BigMenuButton>

              {fileType === 'shp' &&
                arrayBuffers &&
                arrayBuffers.length > 0 && (
                  <Box sx={selectedUpdateStackSx}>
                    <SwitchWithLabel
                      checked={deleteAreasNotUpdated}
                      onChange={(_e, checked) =>
                        setDeleteAreasNotUpdated(checked)
                      }
                      sx={wrappingSwitchSx}
                      controlSx={switchControlSx}
                      labelSx={switchLabelSx}
                      ariaLabel={t(
                        'sidebar.admin.folayer.settings.delete_areas_not_updated'
                      )}
                    >
                      <TText
                        ns={'luonnonmetsakartat'}
                        keyName={
                          'sidebar.admin.folayer.settings.delete_areas_not_updated'
                        }
                      />
                    </SwitchWithLabel>
                    <FolayerUpdateShp
                      fileBuffers={arrayBuffers}
                      adminFolayerConf={adminFolayerConf}
                      onValidationChange={setIsUpdateValid}
                      ref={shpRef}
                    />
                  </Box>
                )}
            </Box>
          </Box>
        )}
      </SidebarContentBox>
      {shouldShowSaveFooter && (
        <Box sx={saveFooterSx}>
          <Button
            type="button"
            variant="text"
            color="neutral"
            disabled={isSaveDisabled}
            aria-label={t('sidebar.admin.folayer.settings.save')}
            onClick={handleSaveClick}
            startIcon={
              <SaveOutlined sx={{ width: '1.25rem', height: '1.25rem' }} />
            }
            sx={saveButtonSx}
          >
            <TText
              keyName={'sidebar.admin.folayer.settings.save'}
              ns={'luonnonmetsakartat'}
            />
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default Page
