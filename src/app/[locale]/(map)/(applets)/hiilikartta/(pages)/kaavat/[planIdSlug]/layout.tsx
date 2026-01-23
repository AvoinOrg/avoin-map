'use client'
import React, { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { FeatureCollection } from 'geojson'

// import { useAppStore } from 'applets/hiilikartta/state/appStore'
import { useMapStore } from '#/common/store'
import { Feature } from 'geojson'
import { getGeoJsonArea } from '#/common/utils/gis'
import { generateUUID } from '#/common/utils/general'
import useStore from '#/common/hooks/useStore'
import { useDoesLayerGroupExist } from '#/common/hooks/map/useDoesLayerGroupExist'
import { SerializableLayerGroupAddOptions } from '#/common/types/map'

import {
  createLayerConf,
  getPlanLayerGroupId,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import {
  FeatureProperties,
  GlobalState,
  PlanConfState,
  PlanData,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ planIdSlug: string }>()
  // const planConf = useStore(useAppStore, (state) => state.planConfs)
  const addSerializableLayerGroup = useMapStore(
    (state) => state.addSerializableLayerGroup
  )
  const enableSerializableLayerGroup = useMapStore(
    (state) => state.enableSerializableLayerGroup
  )
  const disableSerializableLayerGroup = useMapStore(
    (state) => state.disableSerializableLayerGroup
  )

  const updateSourceData = useMapStore((state) => state.updateSourceData)

  const globalState = useStore(useAppletStore, (state) => state.globalState)
  const planConf = useStore(
    useAppletStore,
    (state) => state.planConfs[params.planIdSlug]
  )
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const doesLayerGroupExist = useDoesLayerGroupExist(
    getPlanLayerGroupId(params.planIdSlug)
  )
  const isLoaded = useRef(false)

  // const setIsDrawEnabled = useMapStore((state) => state.setIsDrawEnabled)

  useEffect(() => {
    const init = async () => {
      if (planConf && !isLoaded.current && doesLayerGroupExist != null) {
        const layerGroupId = getPlanLayerGroupId(params.planIdSlug)
        const layerGroupAddOptions: SerializableLayerGroupAddOptions = {
          zoomToExtent: !doesLayerGroupExist,
          dataUpdateMutator: async (data: FeatureCollection) => {
            if (updatePlanConf != null) {
              updatePlanConf(params.planIdSlug, { data: data as PlanData })
            } else {
              console.error('Unable to add dataUpdateMutator')
            }
          },
          drawOptions: {
            polygonEnabled: true,
            editEnabled: true,
            corridorEnabled: true,
            deleteOptions: {
              enabled: true,
              deleteOutsideDrawMode: true,
            },
            featureAddMutator: (feature: Feature) => {
              const { mode } = feature.properties || {}
              const properties: FeatureProperties = {
                id: generateUUID(),
                area_ha: getGeoJsonArea(feature) / 10000,
                name: '',
                zoning_code: '',
                extras: { hasValidZoningCode: false },
              }

              if (mode != null) {
                properties.geometry_mode = mode
              }

              feature.id = properties.id
              feature.properties = properties

              return feature
            },
            featureUpdateMutator: (feature: Feature) => {
              const { mode, ...rest } = feature.properties || {}
              const properties = rest as FeatureProperties

              const newProperties: FeatureProperties = {
                ...properties,
                area_ha: getGeoJsonArea(feature) / 10000,
              }

              if (mode != null) {
                newProperties.geometry_mode = mode
              }

              feature.properties = newProperties

              return feature
            },
          },
        }

        const layerConf = await createLayerConf(
          planConf.data,
          planConf.id,
          ZONING_CODE_COL
        )
        if (doesLayerGroupExist) {
          await enableSerializableLayerGroup(layerGroupId, layerGroupAddOptions)
          // await removeSerializableLayerGroup(layerGroupId)
        } else {
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
      disableSerializableLayerGroup(
        getPlanLayerGroupId(params.planIdSlug)
      ).catch(() => {})
    } else if (planConf && planConf.isHidden && doesLayerGroupExist) {
      disableSerializableLayerGroup(
        getPlanLayerGroupId(params.planIdSlug)
      ).catch(() => {})
    } else if (
      planConf &&
      planConf.state != null &&
      planConf.state === PlanConfState.FETCHING
    ) {
      disableSerializableLayerGroup(
        getPlanLayerGroupId(params.planIdSlug)
      ).catch(() => {})
      isLoaded.current = false
    }
  }, [planConf, isLoaded, doesLayerGroupExist, globalState])

  useEffect(() => {
    if (planConf?.data != null && isLoaded.current) {
      const layerGroupId = getPlanLayerGroupId(planConf?.id)
      updateSourceData(layerGroupId, planConf?.data)
    }
  }, [planConf?.data, isLoaded.current])

  useEffect(() => {
    return () => {
      const layerGroupId = getPlanLayerGroupId(params.planIdSlug)

      const cleanup = async () => {
        try {
          await disableSerializableLayerGroup(layerGroupId)
        } catch (e) {
          // if it fails, the layer is (most likely) already disabled/removed
          // console.error(
          //   "Couldn't disable layer group when unmounting plan Layout.tsx"
          // )
        }
      }

      cleanup() // Invoke the async function, but don't await it here
    }
  }, [])

  // useEffect(() => {
  //   setMapLibraryMode('maplibre')
  // }, [])
  return <>{children}</>
}

export default Layout
