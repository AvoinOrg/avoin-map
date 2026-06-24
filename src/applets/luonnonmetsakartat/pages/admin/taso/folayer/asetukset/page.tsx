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

import { Box } from '#/common/style/theme'
import { SIDEBAR_PADDING_REM } from '#/common/style/theme/constants'
import { Button } from '#/components/common/Button'
import ColorPickerWithPopover from '#/components/common/ColorPickerWithPopover'
import { useMapStore, useUIStore } from '#/common/store'
import { Delete, SaveOutlined, Upload } from '#/components/icons'
import { getRoute } from '#/common/routing/routing-client'
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
  useAppPathname,
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
import {
  APPLET_NAMESPACE,
  routeTree,
} from '#/common/routing/routes/luonnonmetsakartat'
import { mainRouteTree } from '#/common/routing/routes/main'
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
  const pathname = useAppPathname()
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

  const getLocalizedAdminRoute = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const locale = pathSegments[0]
    const hasAppletSegment = pathSegments[1] === APPLET_NAMESPACE
    const adminRoute = hasAppletSegment
      ? {
          routeNode: mainRouteTree.luonnonmetsakartat.admin,
          routeTree: mainRouteTree,
        }
      : {
          routeNode: routeTree.admin,
          routeTree,
        }
    const route = getRoute(adminRoute)

    return locale != null && locale.length === 2 && route.startsWith('/')
      ? `/${locale}${route}`
      : route
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
            router.push(getLocalizedAdminRoute())
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
  const isDeleting = adminFolayerConf?.state === FolayerConfState.Deleting
  const shouldShowSaveFooter = Boolean(
    adminFolayerConf && (adminFolayerConf.unsyncedChanges || fileName)
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <SidebarContentBox sxOuter={{ position: 'relative' }}>
        {!isFolayerReady && !isDeleting && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isFolayerReady && adminFolayerConf && (
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
              ariaLabel={t('sidebar.admin.folayer.settings.delete')}
            >
              <TText
                keyName={'sidebar.admin.folayer.settings.delete'}
                ns={'luonnonmetsakartat'}
              />
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
                sx={{ mt: 4 }}
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
                aria-label={
                  fileName ??
                  t('sidebar.admin.folayer.settings.update_with_file')
                }
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
                    <SwitchWithLabel
                      checked={deleteAreasNotUpdated}
                      onChange={(_e, checked) =>
                        setDeleteAreasNotUpdated(checked)
                      }
                      sx={{ mt: 5 }}
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
      {shouldShowSaveFooter && (
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
            disabled={isSaveDisabledByUpdate}
            aria-label={t('sidebar.admin.folayer.settings.save')}
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
              '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
                color: 'neutral.dark',
                backgroundColor: 'transparent',
                opacity: 0.5,
                cursor: 'not-allowed',
                pointerEvents: 'auto',
              },
            }}
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
