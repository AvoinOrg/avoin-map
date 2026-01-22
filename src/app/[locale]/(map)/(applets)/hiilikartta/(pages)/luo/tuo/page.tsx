'use client'

import React, { useRef, useEffect, useState, ChangeEvent } from 'react'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import { buffer } from '@turf/turf'
import booleanValid from '@turf/boolean-valid'
import { flattenDeep } from 'lodash-es'
import { useTranslate } from '@tolgee/react'

import { getRoute } from '#/common/routing/routing-client'
import {
  FeatureProperties,
  FileType,
  NewPlanConf,
  ZoningClass,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import { getGeoJsonArea } from '#/common/utils/gis'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Upload } from '#/components/icons'

import { routeTree } from '#/common/routing/routes/hiilikartta'
import PlanImportGpkg from './_components/PlanImportGpkg'
import PlanImportShp from './_components/PlanImportShp'
import { useAppletStore } from '#/app/[locale]/(map)/(applets)/hiilikartta/state/appletStore'
import { Feature, FeatureCollection } from 'geojson'
import { generateUUID } from '#/common/utils/general'
import {
  normalizeZoningCode,
  getZoningClassLandUseDefaults,
  getZoningClasses,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/zoningClasses'

const Page = () => {
  const addPlanConf = useAppletStore((state) => state.addPlanConf)
  const [fileType, setFileType] = useState<FileType>()
  const [fileName, setFileName] = useState<string>()
  const [arrayBuffer, setArrayBuffer] = useState<ArrayBuffer>()
  const isInitializing = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { t } = useTranslate('hiilikartta')

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  const formatGeojson: any = ({
    json,
    zoningColName,
    nameColName,
    zoningClasses,
  }: {
    json: FeatureCollection
    zoningColName: string
    nameColName: string | undefined
    zoningClasses: ZoningClass[]
  }): FeatureCollection => {
    const features = json.features
      .map((feature: Feature, index) => {
        if (
          !feature.geometry ||
          // @ts-ignore
          !feature.geometry.coordinates ||
          !['MultiPolygon', 'Polygon'].includes(feature.geometry.type)
        ) {
          return null // Remove features without geometry
        }

        if (
          // @ts-ignore
          feature.geometry.coordinates &&
          // @ts-ignore
          (feature.geometry.coordinates.length === 0 ||
            // @ts-ignore
            flattenDeep(feature.geometry.coordinates).length === 0)
        ) {
          return null
        }

        if (!booleanValid(feature)) {
          try {
            // Attempt to fix invalid geometry by applying a buffer
            const fixedGeometry = buffer(feature, 0).geometry
            if (booleanValid(fixedGeometry)) {
              // If the fixed geometry is valid, update the feature's geometry
              feature.geometry = fixedGeometry
            } else {
              // If the geometry is still invalid, discard the feature
              return null
            }
          } catch (error) {
            console.error('Error fixing geometry:', error)
            return null // Discard features with geometry that cannot be fixed
          }
        }

        // Get the value of the property using colName and remove other properties
        let zoningCode = feature.properties?.[zoningColName]

        if (!zoningCode) {
          zoningCode = null
        } else if (typeof zoningCode !== 'string') {
          zoningCode = String(zoningCode)
        }

        let name: string | number = index + 1
        if (nameColName != null) {
          const nameColVal = feature.properties?.[nameColName]
          if (
            (nameColVal != null && typeof nameColVal === 'string') ||
            typeof nameColVal === 'number'
          ) {
            name = feature.properties?.[nameColName]
          }
        }

        // If the desired property is not found, don't modify the feature

        const featureAreaHa = getGeoJsonArea(feature) / 10000

        const baseProperties = {
          id: generateUUID(),
          name: name,
          [ZONING_CODE_COL]: zoningCode,
          area_ha: featureAreaHa,
          old_id: feature.id != null ? feature.id : undefined,
        }

        let properties: FeatureProperties = {
          ...baseProperties,
          hasValidZoningCode: false,
        }

        if (zoningCode != null) {
          const trimmedZoningCode = normalizeZoningCode(zoningCode)

          const zoningClass = zoningClasses.find((zoningClass) => {
            const codes = zoningClass.code
              .split(',')
              .map((code) => normalizeZoningCode(code))
            return codes.includes(trimmedZoningCode)
          })

          if (zoningClass) {
            properties = {
              ...baseProperties,
              [ZONING_CODE_COL]: zoningClass.code,
              old_zoning_code: zoningCode,
              hasValidZoningCode: true,
              ...getZoningClassLandUseDefaults(zoningClass),
            }
          }
        }

        // Return the new feature with only zoning_code and area in hectares in its properties
        return {
          ...feature,
          properties: properties,
        }
      })
      .filter((feature) => feature !== null)

    return {
      type: 'FeatureCollection',
      features: features as Feature[],
    }
  }

  const initializePlan = async (
    json: FeatureCollection,
    zoningColName: string,
    nameColName?: string
  ) => {
    if (!fileName) {
      return null
    }

    let zoningClasses: ZoningClass[] = []
    try {
      zoningClasses = await getZoningClasses()
    } catch (error) {
      console.error('Failed to load zoning classes', error)
    }

    const formatedJson = formatGeojson({
      json,
      zoningColName,
      nameColName,
      zoningClasses,
    })

    const areaHa = getGeoJsonArea(formatedJson) / 10000
    const newPlanConf: NewPlanConf = {
      data: formatedJson,
      name: fileName,
      areaHa: areaHa,
    }

    const planConf = await addPlanConf(newPlanConf)

    // try {
    //   const layerConf = createLayerConf(
    //     formatedJson,
    //     planConf.id,
    //     ZONING_CODE_COL
    //   )

    //   // Testing if the file works, then removing the layers.
    //   await addSerializableLayerGroup(layerConf.id, {
    //     layerConf,
    //     persist: false,
    //     isHidden: true,
    //   })
    //   await removeSerializableLayerGroup(layerConf.id)
    // } catch (e) {
    //   deletePlanConf(planConf.id)
    //   console.error(e)
    //   // TODO: show error to user, invalid file
    //   return null
    // }

    return planConf.id
  }

  const handleFileInput = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }

    const f = e.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(f)

    reader.onloadend = async () => {
      // TODO: add error handling. An error message popup if file is invalid?
      if (reader.result != null) {
        setFileName(f.name)
        if (typeof reader.result !== 'string') {
          if (f.name.split('.').pop() === 'gpkg') {
            if (typeof reader.result !== 'string') {
              setFileType('gpkg')
              setArrayBuffer(reader.result)
            }
          } else if (f.name.split('.').pop() === 'zip') {
            setFileType('shp')
            setArrayBuffer(reader.result)
            // initializePlan(json)
          }
        } else {
          console.error('reader.result is a string, not an ArrayBuffer')
        }
      }
      e.target.value = ''
    }
  }

  const handleFinish = async (
    json: FeatureCollection,
    zoningColName: string,
    nameColName?: string
  ) => {
    if (isInitializing.current) {
      return
    }
    isInitializing.current = true
    try {
      const id = await initializePlan(json, zoningColName, nameColName)
      if (id) {
        const route = getRoute({
          routeNode: routeTree.plans.plan,
          routeTree: routeTree,
          params: {
            routeParams: {
              planId: id,
            },
          },
        })
        router.push(route)
      }
    } catch (e) {
      console.error(e)
    }
    // TODO: throw error if id is null, i.e. if file is invalid

    isInitializing.current = false
  }

  return (
    <>
      <BigMenuButton
        variant="outlined"
        component="label"
        sx={(theme) => ({
          width: '100%',
          height: '60px',
          mb: 6,
        })}
      >
        {fileName ? fileName : t('sidebar.create.select_file')}
        <input
          hidden
          accept=".zip, .gpkg"
          multiple
          type="file"
          onChange={handleFileInput}
          ref={inputRef}
        />
        <Upload />
      </BigMenuButton>
      {fileType === 'gpkg' && arrayBuffer && (
        <PlanImportGpkg
          fileBuffer={arrayBuffer}
          onFinish={handleFinish}
        ></PlanImportGpkg>
      )}
      {fileType === 'shp' && arrayBuffer && (
        <PlanImportShp
          fileBuffer={arrayBuffer}
          onFinish={handleFinish}
        ></PlanImportShp>
      )}
    </>
  )
}

export default Page
