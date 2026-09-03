import * as energyCertificateLayerConfModule from './energyCertificateLayerConf'
import {
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
  ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
} from './buildingPolygonsLayerConf'
import {
  ENERGY_CERTIFICATE_CLASS_CODES,
  ENERGY_CERTIFICATE_CLASS_COLORS,
  ENERGY_CLASS_PROPERTY,
  ENERGY_CERTIFICATE_INACTIVE_COLOR,
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID,
  ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY,
  ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID,
  createEnergymapEnergyCertificateLayers,
  getEnergyCertificateFillColorExpression,
} from './energyCertificateLayerConf'

const resolveMatchExpression = ({
  expression,
  properties,
}: {
  expression: ReturnType<typeof getEnergyCertificateFillColorExpression>
  properties: Record<string, unknown>
}) => {
  if (!Array.isArray(expression)) {
    return expression
  }

  const [, propertyExpression, ...matchStops] = expression as unknown[]

  if (
    !Array.isArray(propertyExpression) ||
    propertyExpression[0] !== 'get' ||
    typeof propertyExpression[1] !== 'string'
  ) {
    throw new Error('Expected a match expression with a get property input')
  }

  const featureValue = properties[propertyExpression[1]]

  for (let index = 0; index < matchStops.length - 1; index += 2) {
    if (matchStops[index] === featureValue) {
      return matchStops[index + 1]
    }
  }

  return matchStops.at(-1)
}

describe('Energiakartta energy certificate layer config', () => {
  it('uses the published effective energy class field and A-G class values', () => {
    expect(ENERGY_CLASS_PROPERTY).toBe('energy_class')
    expect(ENERGY_CERTIFICATE_CLASS_CODES).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
    ])

    const expression = getEnergyCertificateFillColorExpression(
      ENERGY_CERTIFICATE_CLASS_CODES
    )

    expect(expression).toContainEqual(['get', 'energy_class'])
    expect(expression).not.toContainEqual([
      'get',
      'energy_certificate_class',
    ])
  })

  it('styles all active certificate classes with class colors and an inactive fallback', () => {
    expect(
      getEnergyCertificateFillColorExpression(ENERGY_CERTIFICATE_CLASS_CODES)
    ).toEqual([
      'match',
      ['get', ENERGY_CLASS_PROPERTY],
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
      ['get', ENERGY_CLASS_PROPERTY],
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

  it.each([
    ['missing', {}],
    ['null', { energy_class: null }],
    ['empty', { energy_class: '' }],
    ['unknown', { energy_class: 'H' }],
  ])(
    'falls back to inactive grey for a %s effective class',
    (_case, properties) => {
      const expression = getEnergyCertificateFillColorExpression(['B', 'D'])

      expect(resolveMatchExpression({ expression, properties })).toBe(
        ENERGY_CERTIFICATE_INACTIVE_COLOR
      )
    }
  )

  it('colors a modeled-only feature by its effective class', () => {
    const modeledOnlyFeature = {
      energy_certificate_class: null,
      modeled_energy_class: 'C',
      energy_class: 'C',
      is_energy_class_modeled: true,
      energy_class_year: 2018,
    }
    const expression = getEnergyCertificateFillColorExpression(
      ENERGY_CERTIFICATE_CLASS_CODES
    )

    expect(
      resolveMatchExpression({ expression, properties: modeledOnlyFeature })
    ).toBe(ENERGY_CERTIFICATE_CLASS_COLORS.C)
  })

  it('applies effective-class toggles equally to official and modeled features', () => {
    const enabledExpression = getEnergyCertificateFillColorExpression(['C'])
    const disabledExpression = getEnergyCertificateFillColorExpression(['A'])
    const officialFeature = {
      energy_certificate_class: 'C',
      energy_class: 'C',
      is_energy_class_modeled: false,
    }
    const modeledFeature = {
      energy_certificate_class: null,
      modeled_energy_class: 'C',
      energy_class: 'C',
      is_energy_class_modeled: true,
    }

    for (const properties of [officialFeature, modeledFeature]) {
      expect(
        resolveMatchExpression({
          expression: enabledExpression,
          properties,
        })
      ).toBe(ENERGY_CERTIFICATE_CLASS_COLORS.C)
      expect(
        resolveMatchExpression({
          expression: disabledExpression,
          properties,
        })
      ).toBe(ENERGY_CERTIFICATE_INACTIVE_COLOR)
    }
  })

  it('exposes shared-layer helpers instead of an independent layer config', () => {
    expect('default' in energyCertificateLayerConfModule).toBe(false)

    const layers = createEnergymapEnergyCertificateLayers({
      sourceId: ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID,
      sourceLayer: ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER,
    })
    const fillLayer = layers.find(
      (layer) => layer.id === ENERGYMAP_ENERGY_CERTIFICATE_FILL_LAYER_ID
    )
    const outlineLayer = layers.find(
      (layer) => layer.id === ENERGYMAP_ENERGY_CERTIFICATE_OUTLINE_LAYER_ID
    )
    const expectedExpression = getEnergyCertificateFillColorExpression(
      ENERGY_CERTIFICATE_CLASS_CODES
    )

    if (fillLayer?.type !== 'fill' || outlineLayer?.type !== 'line') {
      throw new Error('Expected energy certificate fill and outline layers')
    }

    expect(layers).toHaveLength(2)
    expect(
      layers.every(
        (layer) =>
          layer.source === ENERGYMAP_BUILDING_POLYGONS_SOURCE_ID &&
          layer['source-layer'] === ENERGYMAP_BUILDING_POLYGONS_SOURCE_LAYER
      )
    ).toBe(true)
    expect(fillLayer?.paint?.['fill-color']).toEqual(expectedExpression)
    expect(outlineLayer?.paint?.['line-color']).toEqual(expectedExpression)
    expect(fillLayer?.paint?.['fill-opacity']).toBe(0)
    expect(ENERGYMAP_ENERGY_CERTIFICATE_FILL_OPACITY).toBe(0.62)
  })
})
