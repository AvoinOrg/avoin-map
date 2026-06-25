'use client'

import { useRef, useEffect, useState, type ChangeEvent } from 'react'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { Box } from '#/common/style/theme'
import { useAppRouteHrefBuilder } from '#/common/navigation/appRouteLinks'
import { useAppRouter } from '#/common/navigation/navigation'
import BigMenuButton from '#/components/common/BigMenuButton'
import { SidebarContentBox } from '#/components/Sidebar'
import { Upload } from '#/components/icons'

import type { IndexingStrategy } from 'applets/luonnonmetsakartat/common/types'
import { APP_ROUTE_KEYS } from '#/common/routing/routeMetadata'
import FolayerImportShp from 'applets/luonnonmetsakartat/components/FolayerImportShp'
import { useAdminFolayerPostMutationOptions } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPostMutation'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'

const Page = () => {
  const [fileType, setFileType] = useState<'shp'>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBuffer[]>()
  const [, setIsLoading] = useSidebarActivityLoader()
  const isInitializingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useAppRouter()
  const buildAppRouteHref = useAppRouteHrefBuilder()
  const { t } = useTranslate('luonnonmetsakartat')
  const dialogOpenedRef = useRef(false)
  const localFolayerPostMutation = useMutation(
    useAdminFolayerPostMutationOptions()
  )

  useEffect(() => {
    if (inputRef.current && !dialogOpenedRef.current) {
      dialogOpenedRef.current = true
      inputRef.current.click()
    }
  }, [])

  const initializePlan = async (params: {
    indexingStrategy: IndexingStrategy
    nameCol: string
    municipalityCol: string
    name: string
    colorCode: string
    isVisible: boolean
    idCol?: string
    regionCol?: string
    descriptionCol?: string
    areaCol?: string
  }) => {
    if (!arrayBuffers || arrayBuffers.length === 0) {
      return
    }

    const {
      indexingStrategy,
      nameCol,
      municipalityCol,
      name,
      colorCode,
      isVisible,
      idCol,
      regionCol,
      descriptionCol,
      areaCol,
    } = params

    localFolayerPostMutation.mutate({
      colOptions: {
        indexingStrategy: indexingStrategy,
        nameCol: nameCol,
        municipalityCol: municipalityCol,
        regionCol: regionCol,
        descriptionCol: descriptionCol,
        areaCol: areaCol,
        idCol: idCol,
      },
      name,
      isHidden: !isVisible,
      colorCode: colorCode,
      rawShapefile: arrayBuffers[0],
    })
  }

  useEffect(() => {
    if (localFolayerPostMutation.isSuccess) {
      const id = localFolayerPostMutation.data.id
      const route = buildAppRouteHref({
        routeKey: APP_ROUTE_KEYS.LUONNONMETSAKARTAT_ADMIN_FOLAYER,
        routeParams: {
          folayerIdSlug: id,
        },
      })
      router.push(route, { locale: false })
      return
    }

    if (localFolayerPostMutation.isError) {
      setIsLoading(false)
    }

    if (localFolayerPostMutation.isPending) {
      setIsLoading(true)
    }
  }, [
    localFolayerPostMutation.data,
    localFolayerPostMutation.isError,
    localFolayerPostMutation.isPending,
    localFolayerPostMutation.isSuccess,
    buildAppRouteHref,
    router,
    setIsLoading,
  ])

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const f = e.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(f)

    const newArrayBuffers: ArrayBuffer[] = []

    reader.onloadend = async () => {
      // TODO: add error handling. An error message popup if file is invalid?
      if (reader.result != null) {
        setFileName(f.name)
        if (typeof reader.result !== 'string') {
          if (f.name.split('.').pop() === 'zip') {
            setFileType('shp')
            newArrayBuffers.push(reader.result)
          } else if (f.name.split('.').pop() === 'shp') {
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

  const handleFinish = async ({
    indexingStrategy,
    idCol,
    nameCol,
    municipalityCol,
    regionCol,
    descriptionCol,
    areaCol,
    name,
    colorCode,
    isVisible,
  }: {
    indexingStrategy: IndexingStrategy
    idCol?: string
    nameCol: string
    municipalityCol: string
    regionCol?: string
    descriptionCol?: string
    areaCol?: string
    name?: string
    colorCode?: string
    isVisible?: boolean
  }) => {
    if (isInitializingRef.current) {
      return
    }
    if (
      nameCol == null ||
      municipalityCol == null ||
      name == null ||
      colorCode == null ||
      isVisible == null
    ) {
      console.error(
        'nameCol, municipalityCol, name, color code and isiVisible are required'
      )
      return
    }
    if (indexingStrategy === 'id' && !idCol) {
      console.error('idCol is required when indexingStrategy is "id"')
      return
    }

    try {
      await initializePlan({
        indexingStrategy,
        nameCol,
        municipalityCol,
        name,
        colorCode,
        isVisible,
        idCol,
        regionCol,
        descriptionCol,
        areaCol,
      })
    } catch (e) {
      console.error(e)
    }
    // TODO: throw error if id is null, i.e. if file is invalid

    isInitializingRef.current = false
  }

  return (
    <SidebarContentBox>
      <BigMenuButton
        variant="outlined"
        component="label"
        aria-label={fileName ?? t('sidebar.admin.create.select_file')}
        sx={{
          width: '100%',
          minHeight: '60px',
        }}
      >
        {fileName ? fileName : t('sidebar.admin.create.select_file')}
        <input
          hidden
          accept=".zip"
          multiple
          type="file"
          onChange={handleFileInput}
          ref={inputRef}
        />
        <Upload sx={{ width: '24px' }} />
      </BigMenuButton>

      {fileType === 'shp' && arrayBuffers && arrayBuffers?.length > 0 && (
        <Box sx={{ mt: 5 }}>
          <FolayerImportShp
            fileBuffers={arrayBuffers}
            onFinish={handleFinish}
            isInitializing={localFolayerPostMutation.isPending}
          ></FolayerImportShp>
        </Box>
      )}
    </SidebarContentBox>
  )
}

export default Page
