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
import { getLayerGroupId } from 'applets/luonnonmetsakartat/common/utils'
import { SerializableLayerGroupAddOptions } from '#/common/types/map'
import { Feature } from 'geojson'
import { FeatureProperties } from 'applets/luonnonmetsakartat/common/types'
import { getGeoJsonArea } from '#/common/utils/gis'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ layerIdSlug: string }>()
  const enableSerializableLayerGroup = useMapStore(
    (state) => state.enableSerializableLayerGroup
  )
  const addSerializableLayerGroup = useMapStore(
    (state) => state.addSerializableLayerGroup
  )
  const disableSerializableLayerGroup = useMapStore(
    (state) => state.disableSerializableLayerGroup
  )
  const adminLayerConf = useStore(
    useAppletStore,
    (state) => state.adminLayerConfs[params.layerIdSlug]
  )
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
        const layerGroupAddOptions: SerializableLayerGroupAddOptions = {
          zoomToExtent: true,
          // dataUpdateMutator: async (data: FeatureCollection) => {
          //   if (updatePlanConf != null) {
          //     updatePlanConf(params.layerIdSlug, { data: data as PlanData })
          //   } else {
          //     console.error('Unable to add dataUpdateMutator')
          //   }
          // },
          drawOptions: {
            idField: 'id',
            polygonEnabled: true,
            editEnabled: true,
            deleteEnabled: true,
            // featureAddMutator: (feature: Feature) => {
            //   const properties: FeatureProperties = {
            //     id: generateUUID(),
            //     name: '',
            //     area_ha: getGeoJsonArea(feature) / 10000,
            //     zoning_code: '',
            //   }

            //   feature.properties = properties

            //   return feature
            // },
            featureUpdateMutator: (feature: Feature) => {
              const properties = feature.properties as FeatureProperties
              const newProperties: FeatureProperties = {
                ...properties,
                areaHa: getGeoJsonArea(feature) / 10000,
              }

              feature.properties = newProperties

              return feature
            },
          },
        }

        if (doesLayerGroupExist) {
          await enableSerializableLayerGroup(layerGroupId, layerGroupAddOptions)
        } else {
          const layerConf = createLayerConf(
            planConf.data,
            planConf.id,
            ZONING_CODE_COL
          )

          await addSerializableLayerGroup(layerGroupId, {
            ...layerGroupAddOptions,
            layerConf: layerConf,
          })
        }

        isLoaded.current = true
      }
    }

    if (
      planConf &&
      !planConf.isHidden &&
      ![PlanConfState.FETCHING, PlanConfState.DELETING].includes(
        planConf.state || PlanConfState.IDLE
      ) &&
      !isLoaded.current &&
      globalState === GlobalState.IDLE &&
      doesLayerGroupExist != null
    ) {
      init()
      // return () => {
      //   try {
      //     disableSerializableLayerGroup(layerGroupId)
      //   } catch (e) {
      //     // if it fails, the layer is (most likely) already disabled/removed
      //   }
      // }
    } else if (!planConf && doesLayerGroupExist) {
      disableSerializableLayerGroup(getLayerGroupId(params.layerIdSlug)).catch(
        () => {}
      )
    } else if (planConf && planConf.isHidden && doesLayerGroupExist) {
      disableSerializableLayerGroup(getLayerGroupId(params.layerIdSlug)).catch(
        () => {}
      )
    } else if (
      planConf &&
      planConf.state != null &&
      planConf.state === PlanConfState.FETCHING
    ) {
      disableSerializableLayerGroup(getLayerGroupId(params.layerIdSlug)).catch(
        () => {}
      )
      isLoaded.current = false
    }
  }, [planConf, isLoaded, doesLayerGroupExist, globalState])

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
