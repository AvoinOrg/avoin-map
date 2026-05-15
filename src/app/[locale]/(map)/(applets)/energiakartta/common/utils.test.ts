import type { MapGeoJSONFeature } from 'maplibre-gl'

import {
  ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
} from '../layers/buildingPolygonsLayerConf'
import {
  areEnergymapSelectedBuildingsEqual,
  isEnergymapBuildingFeature,
  toEnergymapSelectedBuilding,
} from './utils'

const buildingKey = '9da63bcd-bb54-447c-b991-8eec8f8c5666'

const createFeature = (
  overrides: Partial<MapGeoJSONFeature> = {}
): MapGeoJSONFeature =>
  ({
    id: buildingKey,
    source: ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
    sourceLayer: ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
    layer: {
      id: ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID,
    },
    properties: {
      building_key: buildingKey,
      permanent_building_identifier: '101614422K',
      main_purpose: '05',
    },
    ...overrides,
  }) as MapGeoJSONFeature

describe('Energiakartta selected building helpers', () => {
  it('recognizes features from the shared Energiakartta building source-layer', () => {
    expect(isEnergymapBuildingFeature(createFeature())).toBe(true)
    expect(isEnergymapBuildingFeature(createFeature({ source: 'other' }))).toBe(
      false
    )
    expect(
      isEnergymapBuildingFeature(createFeature({ sourceLayer: 'other' }))
    ).toBe(false)
  })

  it('converts a selected map feature into the applet selected-building contract', () => {
    expect(toEnergymapSelectedBuilding(createFeature())).toEqual({
      id: buildingKey,
      buildingKey,
      source: ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
      sourceLayer: ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
      layerId: ENERGYMAP_BUILDING_POLYGONS_FILL_LAYER_ID,
      properties: {
        building_key: buildingKey,
        permanent_building_identifier: '101614422K',
        main_purpose: '05',
      },
    })
  })

  it('uses building_key as the stable id fallback and rejects unidentified features', () => {
    expect(
      toEnergymapSelectedBuilding(createFeature({ id: undefined }))?.id
    ).toBe(buildingKey)
    expect(
      toEnergymapSelectedBuilding(
        createFeature({ id: undefined, properties: {} })
      )
    ).toBeNull()
  })

  it('compares selected-building contracts by identity fields and raw properties', () => {
    const selectedBuilding = toEnergymapSelectedBuilding(createFeature())
    const sameSelectedBuilding = toEnergymapSelectedBuilding(createFeature())
    const changedSelectedBuilding = toEnergymapSelectedBuilding(
      createFeature({
        properties: {
          building_key: buildingKey,
          permanent_building_identifier: '101614422K',
          main_purpose: '06',
        },
      })
    )

    expect(
      areEnergymapSelectedBuildingsEqual(
        selectedBuilding,
        sameSelectedBuilding
      )
    ).toBe(true)
    expect(
      areEnergymapSelectedBuildingsEqual(
        selectedBuilding,
        changedSelectedBuilding
      )
    ).toBe(false)
  })
})
