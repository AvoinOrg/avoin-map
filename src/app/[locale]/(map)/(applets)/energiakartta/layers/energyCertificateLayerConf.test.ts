import * as energyCertificateLayerConfModule from './energyCertificateLayerConf'
import {
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
} from './buildingPolygonsLayerConf'
import {
  ENERGY_CERTIFICATE_CLASS_CODES,
  ENERGY_CERTIFICATE_CLASS_COLORS,
  ENERGY_CERTIFICATE_CLASS_PROPERTY,
  ENERGY_CERTIFICATE_INACTIVE_COLOR,
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY,
  createEnergymapEnergyCertificateLayers,
  getEnergyCertificateFillColorExpression,
} from './energyCertificateLayerConf'

describe('Energiakartta energy certificate layer config', () => {
  it('uses the documented joined energy certificate field and A-G class values', () => {
    expect(ENERGY_CERTIFICATE_CLASS_PROPERTY).toBe(
      'energy_certificate_class'
    )
    expect(ENERGY_CERTIFICATE_CLASS_CODES).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ])
  })

  it('styles all active certificate classes with class colors and an inactive fallback', () => {
    expect(
      getEnergyCertificateFillColorExpression(ENERGY_CERTIFICATE_CLASS_CODES)
    ).toEqual([
      'match',
      ['get', ENERGY_CERTIFICATE_CLASS_PROPERTY],
      'A',
      ENERGY_CERTIFICATE_CLASS_COLORS.A,
      'B',
      ENERGY_CERTIFICATE_CLASS_COLORS.B,
      'C',
      ENERGY_CERTIFICATE_CLASS_COLORS.C,
      'D',
      ENERGY_CERTIFICATE_CLASS_COLORS.D,
      'E',
      ENERGY_CERTIFICATE_CLASS_COLORS.E,
      'F',
      ENERGY_CERTIFICATE_CLASS_COLORS.F,
      'G',
      ENERGY_CERTIFICATE_CLASS_COLORS.G,
      ENERGY_CERTIFICATE_INACTIVE_COLOR,
    ])
  })

  it('leaves toggled-off classes visible with the inactive color', () => {
    expect(getEnergyCertificateFillColorExpression(['A', 'C', 'G'])).toEqual([
      'match',
      ['get', ENERGY_CERTIFICATE_CLASS_PROPERTY],
      'A',
      ENERGY_CERTIFICATE_CLASS_COLORS.A,
      'C',
      ENERGY_CERTIFICATE_CLASS_COLORS.C,
      'G',
      ENERGY_CERTIFICATE_CLASS_COLORS.G,
      ENERGY_CERTIFICATE_INACTIVE_COLOR,
    ])
  })

  it('returns a constant inactive color when every class is toggled off', () => {
    expect(getEnergyCertificateFillColorExpression([])).toBe(
      ENERGY_CERTIFICATE_INACTIVE_COLOR
    )
  })

  it('falls back to inactive grey for missing or unknown class values', () => {
    const expression = getEnergyCertificateFillColorExpression(['B', 'D'])

    expect(Array.isArray(expression)).toBe(true)
    expect((expression as unknown[]).at(-1)).toBe(
      ENERGY_CERTIFICATE_INACTIVE_COLOR
    )
  })

  it('exposes shared-layer helpers instead of an independent layer config', () => {
    expect('default' in energyCertificateLayerConfModule).toBe(false)

    const layers = createEnergymapEnergyCertificateLayers({
      sourceId: ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
      sourceLayer: ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
    })
    const fillLayer = layers.find(
      (layer) => layer.id === ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID
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
    expect(ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY).toBe(0.62)
  })
})
