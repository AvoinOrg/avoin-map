import {
  HEATING_ENERGY_SOURCE_CODES,
  HEATING_ENERGY_SOURCE_EXPLICIT_CODES,
  HEATING_ENERGY_SOURCE_PROPERTY,
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
})
