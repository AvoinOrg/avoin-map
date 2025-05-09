'use client'

import React, { useEffect, useRef, useState } from 'react'
import { T } from '@tolgee/react'
import { Box, Typography } from '@mui/material'
import { Feature } from 'geojson'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import useStore from '#/common/hooks/useStore'
import { getGeoJsonArea } from '#/common/utils/gis'
import { LoadingSpinner } from '#/components/Loading'
import { SidebarContentBox } from '#/components/Sidebar'
import { useMapStore } from '#/common/store/mapStore'
import { useDoesLayerGroupExist } from '#/common/hooks/map/useDoesLayerGroupExist'
import { LayerGroupAddOptions } from '#/common/types/map'

import { useAppletStore } from 'applets/luonnonmetsakartat/state/appletStore'
import { adminFolayerQuery } from 'applets/luonnonmetsakartat/common/queries/adminFolayerQuery'
import { adminFolayerAreaQuery } from 'applets/luonnonmetsakartat/common/queries/adminFolayerAreaQuery'
import {
  createAdminFolayerConf,
  getFolayerGroupId,
} from 'applets/luonnonmetsakartat/common/utils'
import {
  FeatureProperties,
  FolayerConfState,
} from 'applets/luonnonmetsakartat/common/types'
import LoadingBlocker from 'applets/luonnonmetsakartat/components/LoadingBlocker'

const layoutClient = ({ children }: { children: React.ReactNode }) => {
  const params = useParams<{ folayerIdSlug: string }>()
  const enableLayerGroup = useMapStore((state) => state.enableLayerGroup)
  const addLayerGroup = useMapStore((state) => state.addLayerGroup)
  const disableLayerGroup = useMapStore((state) => state.disableLayerGroup)
  const adminFolayerConf = useStore(
    useAppletStore,
    (state) => state.adminFolayerConfs[params.folayerIdSlug]
  )
  const folayerAreaCollection = useStore(
    useAppletStore,
    (state) => state.folayerAreaCollections[params.folayerIdSlug]
  )
  const adminApiKey = useStore(useAppletStore, (state) => state.adminApiKey)

  const { status: folayerStatus, refetch: folayerRefetch } = useQuery({
    ...adminFolayerQuery(params.folayerIdSlug),
    enabled: false, // This prevents the query from running automatically
  })

  const { status: areaStatus, refetch: areasRefetch } = useQuery({
    ...adminFolayerAreaQuery(params.folayerIdSlug),
    enabled: false, // This prevents the query from running automatically
  })

  // const updateSourceData = useMapStore((state) => state.updateSourceData)

  const doesLayerGroupExist = useDoesLayerGroupExist(
    getFolayerGroupId(params.folayerIdSlug)
  )

  const isLoaded = useRef(false)

  useEffect(() => {
    const init = async () => {
      if (
        adminFolayerConf &&
        !isLoaded.current &&
        doesLayerGroupExist != null
      ) {
        const folayerGroupId = getFolayerGroupId(params.folayerIdSlug)
        const folayerGroupAddOptions: LayerGroupAddOptions = {
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

        if (doesLayerGroupExist) {
          await enableLayerGroup(folayerGroupId, folayerGroupAddOptions)
        } else {
          const layerConf = await createAdminFolayerConf(
            adminApiKey as string,
            // folayerAreaCollection,
            adminFolayerConf.id,
            adminFolayerConf.colorCode
          )

          await addLayerGroup(folayerGroupId, {
            ...folayerGroupAddOptions,
            layerConf: layerConf,
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
      doesLayerGroupExist != null
    ) {
      init()
      // return () => {
      //   try {
      //     disableLayerGroup(folayerGroupId)
      //   } catch (e) {
      //     // if it fails, the folayer is (most likely) already disabled/removed
      //   }
      // }
    } else if (!adminFolayerConf && doesLayerGroupExist) {
      disableLayerGroup(getFolayerGroupId(params.folayerIdSlug)).catch(() => {})
      // } else if (adminFolayerConf && adminFolayerConf.isHidden && doesLayerGroupExist) {
      //   disableLayerGroup(getLayerGroupId(params.folayerIdSlug)).catch(() => {})
    } else if (
      adminFolayerConf &&
      adminFolayerConf.state != null &&
      adminFolayerConf.state === FolayerConfState.Fetching
    ) {
      disableLayerGroup(getFolayerGroupId(params.folayerIdSlug)).catch(() => {})
      isLoaded.current = false
    }
  }, [adminFolayerConf, isLoaded, doesLayerGroupExist])

  useEffect(() => {
    if (adminFolayerConf) {
      document.title = adminFolayerConf.name
    }
  }, [adminFolayerConf])

  useEffect(() => {
    folayerRefetch()
    areasRefetch()
  }, [])

  return (
    <>
      {folayerStatus === 'success' && children}
      {folayerStatus === 'pending' && <LoadingBlocker></LoadingBlocker>}
      {folayerStatus === 'error' && (
        <SidebarContentBox>
          <Typography
            sx={{
              display: 'inline-flex',
              typography: 'body2',
              mt: 0.5,
            }}
          >
            <T
              keyName={'sidebar.admin.folayer.error_fetching'}
              ns={'luonnonmetsakartat'}
            ></T>
          </Typography>
        </SidebarContentBox>
      )}
    </>
  )
}

export default layoutClient
