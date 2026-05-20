import * as heatingLayerConfModule from './heatingLayerConf'
import {
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
} from './buildingPolygonsLayerConf'
import {
  ENERGYMAP_HEATING_FILL_LAYER_ID,
  ENERGYMAP_HEATING_FILL_OPACITY,
  HEATING_ENERGY_SOURCE_CODES,
  HEATING_ENERGY_SOURCE_EXPLICIT_CODES,
  HEATING_ENERGY_SOURCE_PROPERTY,
  createEnergymapHeatingLayers,
  getHeatingEnergySourceFilter,
} from './heatingLayerConf'

describe('getHeatingEnergySourceFilter', () => {
  it('includes explicit codes and the other complement when all categories are active', () => {
    expect(
      getHeatingEnergySourceFilter([
        'geothermal',
        'districtHeating',
        'electricity',
        'solar',
        'other',
      ])
    ).toEqual([
      'any',
      [
        'in',
        ['get', HEATING_ENERGY_SOURCE_PROPERTY],
        [
          'literal',
          [
            HEATING_ENERGY_SOURCE_CODES.geothermal,
            HEATING_ENERGY_SOURCE_CODES.districtHeating,
            HEATING_ENERGY_SOURCE_CODES.electricity,
            HEATING_ENERGY_SOURCE_CODES.solar,
          ],
        ],
      ],
      [
        '!',
        [
          'in',
          ['get', HEATING_ENERGY_SOURCE_PROPERTY],
          ['literal', HEATING_ENERGY_SOURCE_EXPLICIT_CODES],
        ],
      ],
    ])
  })

  it('includes only district heating and electricity for those explicit categories', () => {
    expect(
      getHeatingEnergySourceFilter(['districtHeating', 'electricity'])
    ).toEqual([
      'in',
      ['get', HEATING_ENERGY_SOURCE_PROPERTY],
      [
        'literal',
        [
          HEATING_ENERGY_SOURCE_CODES.districtHeating,
          HEATING_ENERGY_SOURCE_CODES.electricity,
        ],
      ],
    ])
  })

  it('uses the complement of explicit heating source codes for other', () => {
    expect(getHeatingEnergySourceFilter(['other'])).toEqual([
      '!',
      [
        'in',
        ['get', HEATING_ENERGY_SOURCE_PROPERTY],
        ['literal', HEATING_ENERGY_SOURCE_EXPLICIT_CODES],
      ],
    ])
  })

  it('uses a no-match filter when no heating categories are active', () => {
    expect(getHeatingEnergySourceFilter([])).toEqual([
      '==',
      ['get', HEATING_ENERGY_SOURCE_PROPERTY],
      '__avoin_no_matching_heating_energy_source__',
    ])
  })

  it('keeps geothermal heat pump code 1101 out of the explicit geothermal bucket', () => {
    expect(HEATING_ENERGY_SOURCE_CODES.geothermal).toBe('09')
    expect(HEATING_ENERGY_SOURCE_EXPLICIT_CODES).not.toContain('1101')
  })

  it('exposes shared-layer helpers instead of an independent layer config', () => {
    expect('default' in heatingLayerConfModule).toBe(false)

    const layers = createEnergymapHeatingLayers({
      sourceId: ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
      sourceLayer: ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
    })
    const fillLayer = layers.find(
      (layer) => layer.id === ENERGYMAP_HEATING_FILL_LAYER_ID
    ) as any

    expect(layers).toHaveLength(2)
    expect(
      layers.every(
        (layer) =>
          layer.source === ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID &&
          layer['source-layer'] === ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER
      )
    ).toBe(true)
    expect(fillLayer?.paint?.['fill-opacity']).toBe(0)
    expect(ENERGYMAP_HEATING_FILL_OPACITY).toBe(0.6)
  })
})
