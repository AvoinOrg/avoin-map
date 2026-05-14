import {
  ENERGY_CERTIFICATE_CLASS_CODES,
  ENERGY_CERTIFICATE_CLASS_COLORS,
  ENERGY_CERTIFICATE_CLASS_PROPERTY,
  ENERGY_CERTIFICATE_INACTIVE_COLOR,
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
})
