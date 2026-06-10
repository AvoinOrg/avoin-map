'use client'

import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import { getRoute } from '#/common/routing/routing-client'
import BigMenuButton from '#/components/common/BigMenuButton'
import { SidebarContentBox } from '#/components/Sidebar'
import { Upload } from '#/components/icons'

import { IndexingStrategy } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { routeTree } from '#/common/routing/routes/luonnonmetsakartat'
import FolayerImportShp from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/FolayerImportShp'
import { adminFolayerPostMutation } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/queries/adminFolayerPostMutation'
import { useMutation } from '@tanstack/react-query'
import { useSidebarActivityLoader } from '#/common/hooks/ui/useSidebarActivityLoader'

const Page = () => {
  const [fileType, setFileType] = useState<'shp'>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBuffer[]>()
  const [, setIsLoading] = useSidebarActivityLoader()
  const isInitializingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useTranslate('luonnonmetsakartat')
  const localFolayerPostMutation = useMutation(adminFolayerPostMutation())

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
      const route = getRoute({
        routeNode: routeTree.admin.folayer,
        routeTree: routeTree,
        params: {
          routeParams: {
            folayerId: id,
          },
        },
      })
      router.push(route)
      return
    }

    if (localFolayerPostMutation.isError) {
      setIsLoading(false)
    }

    if (localFolayerPostMutation.isPending) {
      setIsLoading(true)
    }
  }, [localFolayerPostMutation])

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
      // if (id) {
      //   const route = getRoute(routeTree.plans.plan, routeTree, {
      //     routeParams: {
      //       planId: id,
      //     },
      //   })
      //   router.push(route)
      // }
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
