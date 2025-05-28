'use client'

import React, { useRef, useEffect, useState, ChangeEvent, use } from 'react'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { buffer } from '@turf/turf'
import booleanValid from '@turf/boolean-valid'
import { flattenDeep } from 'lodash-es'
import { useTranslate } from '@tolgee/react'
import { Feature, FeatureCollection } from 'geojson'

import { getRoute } from '#/common/utils/routing-client'
import { getGeoJsonArea } from '#/common/utils/gis'
import { generateUUID } from '#/common/utils/general'
import BigMenuButton from '#/components/common/BigMenuButton'
import { SidebarContentBox } from '#/components/Sidebar'
import { Upload } from '#/components/icons'

import { FeatureProperties } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { routeTree } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/routes'
import FolayerImportShp from 'applets/luonnonmetsakartat/components/FolayerImportShp'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { adminFolayerPostMutation } from 'applets/luonnonmetsakartat/common/queries/adminFolayerPostMutation'
import { useMutation } from '@tanstack/react-query'

const Page = () => {
  const [fileType, setFileType] = useState<'shp'>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffers, setArrayBuffers] = useState<ArrayBuffer[]>()
  const isInitializingRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useTranslate('luonnonmetsakartat')
  const dialogOpenedRef = useRef(false)
  const localFolayerPostMutation = useMutation(adminFolayerPostMutation())

  useEffect(() => {
    if (inputRef.current && !dialogOpenedRef.current) {
      dialogOpenedRef.current = true
      inputRef.current.click()
    }
  }, [])

  const initializePlan = async (name: string, isVisible: boolean) => {
    if (!arrayBuffers || arrayBuffers.length === 0) {
      return
    }

    localFolayerPostMutation.mutate({
      name,
      isHidden: !isVisible,
      colorCode: 'C7C9B8',
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

  const handleFinish = async (
    json: FeatureCollection,
    name: string,
    isVisible: boolean
  ) => {
    if (isInitializingRef.current) {
      return
    }
    try {
      const id = await initializePlan(name, isVisible)
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
        sx={(theme) => ({
          width: '100%',
          minHeight: '60px',
          mb: 6,
        })}
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
        <FolayerImportShp
          fileBuffers={arrayBuffers}
          onFinish={handleFinish}
          isInitializing={localFolayerPostMutation.isPending}
        ></FolayerImportShp>
      )}
    </SidebarContentBox>
  )
}

export default Page
