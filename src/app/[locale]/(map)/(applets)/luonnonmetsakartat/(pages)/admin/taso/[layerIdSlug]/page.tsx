'use client'

import React, { useRef, useEffect, useState, ChangeEvent, use } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { buffer } from '@turf/turf'
import booleanValid from '@turf/boolean-valid'
import { flattenDeep } from 'lodash-es'
import { useTranslate } from '@tolgee/react'
import { Feature, FeatureCollection } from 'geojson'

import { getRoute } from '#/common/utils/routing-client'
import { getGeoJsonArea } from '#/common/utils/gis'
import { generateUUID } from '#/common/utils/general'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Upload } from '#/components/icons'

import {
  FeatureProperties,
  LayerConfState,
} from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'
import { routeTree } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/routes'
import LayerImportShp from 'applets/luonnonmetsakartat/components/LayerImportShp'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/state/appletStore'
import { layerPostMutation } from 'applets/luonnonmetsakartat/common/queries/layerPostMutation'
import { useMutation } from '@tanstack/react-query'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import { set } from 'ol/transform'
import EditableText from '#/components/common/EditableText'

const Page = () => {
  const [isLayerReady, setIsLayerReady] = useState(false)
  const [isAreaCollectionReady, setIsAreaCollectionReady] = useState(false)
  const params = useParams<{ layerIdSlug: string }>()
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useTranslate('luonnonmetsakartat')

  const adminLayerConf = useAppletStore(
    (state) => state.adminLayerConfs[params.layerIdSlug]
  )
  const layerAreaCollection = useAppletStore(
    (state) => state.layerAreaCollections[params.layerIdSlug]
  )
  const updateAdminLayerConf = useAppletStore(
    (state) => state.updateAdminLayerConf
  )
  // const localAdminLayerPostMutation = useMutation(adminLayerPostMutation())

  useEffect(() => {
    if (adminLayerConf && adminLayerConf.state === LayerConfState.Idle) {
      setIsLayerReady(true)
    } else {
      setIsLayerReady(false)
    }
    console.log(adminLayerConf)
  }, [adminLayerConf])

  useEffect(() => {
    if (
      layerAreaCollection &&
      layerAreaCollection.state === LayerConfState.Idle
    ) {
      setIsAreaCollectionReady(true)
    } else {
      setIsAreaCollectionReady(false)
    }
    console.log(layerAreaCollection)
  }, [layerAreaCollection])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    updateAdminLayerConf(params.layerIdSlug, {
      name: newName,
      unsyncedChanges: true,
    })
  }

  return (
    <>
      <SidebarContentBox>
        {!isLayerReady && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner></LoadingSpinner>
          </Box>
        )}
        {isLayerReady && (
          <Box>
            <EditableText
              value={adminLayerConf.name}
              onChange={handleNameChange}
            ></EditableText>
          </Box>
        )}
      </SidebarContentBox>
    </>
  )
}

export default Page
