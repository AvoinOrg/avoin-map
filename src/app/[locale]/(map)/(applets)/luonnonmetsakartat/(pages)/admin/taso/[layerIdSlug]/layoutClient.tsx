'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import useStore from '#/common/hooks/useStore'
import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { useQuery } from '@tanstack/react-query'
import { adminFolayerQuery } from 'applets/luonnonmetsakartat/common/queries/adminFolayerQuery'
import { adminFolayerAreaQuery } from 'applets/luonnonmetsakartat/common/queries/adminFolayerAreaQuery'
import { useMapStore } from '#/common/store/mapStore'
import { useDoesFolayerGroupExist } from '#/common/hooks/map/useDoesFolayerGroupExist'
import {
  createAdminFolayerConf,
  getFolayerGroupId,
} from 'applets/luonnonmetsakartat/common/utils'
import { FolayerGroupAddOptions } from '#/common/types/map'
import { Feature } from 'geojson'
import {
  FeatureProperties,
  FolayerConfState,
} from 'applets/luonnonmetsakartat/common/types'
import { getGeoJsonArea } from '#/common/utils/gis'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ folayerIdSlug: string }>()
  const enableFolayerGroup = useMapStore((state) => state.enableFolayerGroup)
  const addFolayerGroup = useMapStore((state) => state.addFolayerGroup)
  const disableFolayerGroup = useMapStore((state) => state.disableFolayerGroup)
  const adminFolayerConf = useStore(
    useAppletStore,
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )
  const folayerAreaCollection = useStore(
    useAppletStore,
    (state) => state.folayerAreaCollections[params.folayerIdSlug]
  )
  const adminApiKey = useStore(useAppletStore, (state) => state.adminApiKey)

  const { refetch: folayerRefetch } = useQuery({
    ...adminFolayerQuery(params.folayerIdSlug),
    enabled: false, // This prevents the query from running automatically
  })

  const { refetch: areasRefetch } = useQuery({
    ...adminFolayerAreaQuery(params.folayerIdSlug),
    enabled: false, // This prevents the query from running automatically
  })

  // const updateSourceData = useMapStore((state) => state.updateSourceData)

  const doesFolayerGroupExist = useDoesFolayerGroupExist(
    getFolayerGroupId(params.folayerIdSlug)
  )

  const isLoaded = useRef(false)

  useEffect(() => {
    const init = async () => {
      if (adminFolayerConf && !isLoaded.current && doesFolayerGroupExist != null) {
        const folayerGroupId = getFolayerGroupId(params.folayerIdSlug)
        const folayerGroupAddOptions: FolayerGroupAddOptions = {
          zoomToExtent: true,
          // dataUpdateMutator: async (data: FeatureCollection) => {
          //   if (updatePlanConf != null) {
          //     updatePlanConf(params.folayerIdSlug, { data: data as PlanData })
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

        if (doesFolayerGroupExist) {
          await enableFolayerGroup(folayerGroupId, folayerGroupAddOptions)
        } else {
          const folayerConf = createAdminFolayerConf(
            adminApiKey as string,
            // folayerAreaCollection,
            adminFolayerConf.id,
            adminFolayerConf.colorCode
          )

          await addFolayerGroup(folayerGroupId, {
            ...folayerGroupAddOptions,
            folayerConf: folayerConf,
          })
        }

        isLoaded.current = true
      }
    }

    if (
      adminFolayerConf &&
      ![FolayerConfState.Fetching, FolayerConfState.Deleting].includes(
        adminFolayerConf.state
      ) &&
      !isLoaded.current &&
      doesFolayerGroupExist != null
    ) {
      init()
      // return () => {
      //   try {
      //     disableFolayerGroup(folayerGroupId)
      //   } catch (e) {
      //     // if it fails, the folayer is (most likely) already disabled/removed
      //   }
      // }
    } else if (!adminFolayerConf && doesFolayerGroupExist) {
      disableFolayerGroup(getFolayerGroupId(params.folayerIdSlug)).catch(() => {})
      // } else if (adminFolayerConf && adminFolayerConf.isHidden && doesFolayerGroupExist) {
      //   disableFolayerGroup(getFolayerGroupId(params.folayerIdSlug)).catch(() => {})
    } else if (
      adminFolayerConf &&
      adminFolayerConf.state != null &&
      adminFolayerConf.state === FolayerConfState.Fetching
    ) {
      disableFolayerGroup(getFolayerGroupId(params.folayerIdSlug)).catch(() => {})
      isLoaded.current = false
    }
  }, [adminFolayerConf, isLoaded, doesFolayerGroupExist])

  useEffect(() => {
    if (adminFolayerConf) {
      document.title = adminFolayerConf.name
    }
  }, [adminFolayerConf])

  useEffect(() => {
    folayerRefetch()
    areasRefetch()
  }, [])

  return children
}

export default layoutClient
