'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import useStore from '#/common/hooks/useStore'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useQuery } from '@tanstack/react-query'
import { adminLayerQuery } from 'applets/luonnonmetsakartat/common/queries/adminLayerQuery'
import { adminLayerAreaQuery } from 'applets/luonnonmetsakartat/common/queries/adminLayerAreaQuery'
import { useMapStore } from '#/common/store/mapStore'
import { useDoesLayerGroupExist } from '#/common/hooks/map/useDoesLayerGroupExist'
import {
  createAdminLayerConf,
  getLayerGroupId,
} from 'applets/luonnonmetsakartat/common/utils'
import { LayerGroupAddOptions } from '#/common/types/map'
import { Feature } from 'geojson'
import {
  FeatureProperties,
  LayerConfState,
} from 'applets/luonnonmetsakartat/common/types'
import { getGeoJsonArea } from '#/common/utils/gis'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ layerIdSlug: string }>()
  const enableLayerGroup = useMapStore((state) => state.enableLayerGroup)
  const addLayerGroup = useMapStore((state) => state.addLayerGroup)
  const disableLayerGroup = useMapStore((state) => state.disableLayerGroup)
  const adminLayerConf = useStore(
    useAppletStore,
    (state) => state.adminLayerConfs[params.layerIdSlug]
  )
  const layerAreaCollection = useStore(
    useAppletStore,
    (state) => state.layerAreaCollections[params.layerIdSlug]
  )
  const adminApiKey = useStore(useAppletStore, (state) => state.adminApiKey)

  const { refetch: layerRefetch } = useQuery({
    ...adminLayerQuery(params.layerIdSlug),
    enabled: false, // This prevents the query from running automatically
  })

  const { refetch: areasRefetch } = useQuery({
    ...adminLayerAreaQuery(params.layerIdSlug),
    enabled: false, // This prevents the query from running automatically
  })

  // const updateSourceData = useMapStore((state) => state.updateSourceData)

  const doesLayerGroupExist = useDoesLayerGroupExist(
    getLayerGroupId(params.layerIdSlug)
  )

  const isLoaded = useRef(false)

  useEffect(() => {
    const init = async () => {
      if (adminLayerConf && !isLoaded.current && doesLayerGroupExist != null) {
        const layerGroupId = getLayerGroupId(params.layerIdSlug)
        const layerGroupAddOptions: LayerGroupAddOptions = {
          zoomToExtent: true,
          // dataUpdateMutator: async (data: FeatureCollection) => {
          //   if (updatePlanConf != null) {
          //     updatePlanConf(params.layerIdSlug, { data: data as PlanData })
          //   } else {
          //     console.error('Unable to add dataUpdateMutator')
          //   }
          // },
          // drawOptions: {
          //   idField: 'id',
          //   polygonEnabled: true,
          //   editEnabled: true,
          //   deleteEnabled: true,
          //   // featureAddMutator: (feature: Feature) => {
          //   //   const properties: FeatureProperties = {
          //   //     id: generateUUID(),
          //   //     name: '',
          //   //     area_ha: getGeoJsonArea(feature) / 10000,
          //   //     zoning_code: '',
          //   //   }

          //   //   feature.properties = properties

          //   //   return feature
          //   // },
          //   featureUpdateMutator: (feature: Feature) => {
          //     const properties = feature.properties as FeatureProperties
          //     const newProperties: FeatureProperties = {
          //       ...properties,
          //       areaHa: getGeoJsonArea(feature) / 10000,
          //     }

          //     feature.properties = newProperties

          //     return feature
          //   },
          // },
        }

        if (doesLayerGroupExist) {
          await enableLayerGroup(layerGroupId, layerGroupAddOptions)
        } else {
          const layerConf = createAdminLayerConf(
            adminApiKey as string,
            // layerAreaCollection,
            adminLayerConf.id,
            adminLayerConf.colorCode
          )

          await addLayerGroup(layerGroupId, {
            ...layerGroupAddOptions,
            layerConf: layerConf,
          })
        }

        isLoaded.current = true
      }
    }

    if (
      adminLayerConf &&
      ![LayerConfState.Fetching, LayerConfState.Deleting].includes(
        adminLayerConf.state
      ) &&
      !isLoaded.current &&
      doesLayerGroupExist != null
    ) {
      init()
      // return () => {
      //   try {
      //     disableLayerGroup(layerGroupId)
      //   } catch (e) {
      //     // if it fails, the layer is (most likely) already disabled/removed
      //   }
      // }
    } else if (!adminLayerConf && doesLayerGroupExist) {
      disableLayerGroup(getLayerGroupId(params.layerIdSlug)).catch(() => {})
      // } else if (adminLayerConf && adminLayerConf.isHidden && doesLayerGroupExist) {
      //   disableLayerGroup(getLayerGroupId(params.layerIdSlug)).catch(() => {})
    } else if (
      adminLayerConf &&
      adminLayerConf.state != null &&
      adminLayerConf.state === LayerConfState.Fetching
    ) {
      disableLayerGroup(getLayerGroupId(params.layerIdSlug)).catch(() => {})
      isLoaded.current = false
    }
  }, [adminLayerConf, isLoaded, doesLayerGroupExist])

  useEffect(() => {
    if (adminLayerConf) {
      document.title = adminLayerConf.name
    }
  }, [adminLayerConf])

  useEffect(() => {
    layerRefetch()
    areasRefetch()
  }, [])

  return children
}

export default layoutClient
