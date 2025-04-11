'use client'

import React, {
  useRef,
  useEffect,
  useState,
  ChangeEvent,
  use,
  useMemo,
} from 'react'
import { Box, Button, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'
import { buffer } from '@turf/turf'
import booleanValid from '@turf/boolean-valid'
import { flattenDeep } from 'lodash-es'
import { T, useTranslate } from '@tolgee/react'
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
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import CheckBoxWithText from '#/components/common/CheckBoxWithText'

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

  const isEditingDisabled = useMemo(() => {
    if (adminLayerConf.state === LayerConfState.Idle) {
      return false
    }
    return true
  }, [adminLayerConf?.state])

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    updateAdminLayerConf(params.layerIdSlug, {
      name: newName,
      unsyncedChanges: true,
    })
  }

  const handleIsVisibleChange = (
    _e: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    updateAdminLayerConf(params.layerIdSlug, {
      isVisible: checked,
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
            <TextFieldWithHeader
              headerText={t('sidebar.admin.layer.name.header')}
              value={adminLayerConf.name}
              onChange={handleNameChange}
              placeholderText={adminLayerConf.name}
              sx={{ mt: 2.5 }}
              disabled={isEditingDisabled}
            ></TextFieldWithHeader>
            <CheckBoxWithText
              checked={adminLayerConf.isVisible}
              onChange={handleIsVisibleChange}
              sx={{ mt: 2.5 }}
              disabled={isEditingDisabled}
            >
              <T
                ns={'luonnonmetsakartat'}
                keyName={'sidebar.admin.layer.is_visible'}
              ></T>
            </CheckBoxWithText>
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
