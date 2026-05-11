import {
  ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY,
  ENERGYMAP_BUILDING_KEY_PROPERTY,
  ENERGYMAP_BUILDING_MATCH_ALL_FILTER,
  ENERGYMAP_BUILDING_TYPE_CODES,
  ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
  ENERGYMAP_BUILDING_TYPE_PROPERTY,
  combineMapFilters,
  getConstructionDecadeOptions,
  getEnergymapBuildingFilter,
} from './buildingPolygonsLayerConf'

describe('Energiakartta building polygon filters', () => {
  it('uses documented building field names and RYTJ main purpose codes', () => {
    expect(ENERGYMAP_BUILDING_KEY_PROPERTY).toBe('building_key')
    expect(ENERGYMAP_BUILDING_TYPE_PROPERTY).toBe('main_purpose')
    expect(ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY).toBe('completion_date')
    expect(ENERGYMAP_BUILDING_TYPE_CODES).toEqual([
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
    ])
  })

  it('creates decade bins including the Figma-selected 1970s decade', () => {
    expect(getConstructionDecadeOptions(2026)).toContainEqual({
      value: '1970',
      label: '1970 - 1979',
      startYear: 1970,
      endYear: 1979,
    })
    expect(getConstructionDecadeOptions(2026).at(-1)).toEqual({
      value: '2020',
      label: '2020 - 2029',
      startYear: 2020,
      endYear: 2029,
    })
  })

  it('returns the match-all building filter without active constraints', () => {
    expect(
      getEnergymapBuildingFilter({
        buildingTypeFilter: ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
        selectedConstructionDecade: 1970,
        showBuildingsFromSelectedDecade: false,
        showOnlySelectedDecade: false,
      })
    ).toEqual(ENERGYMAP_BUILDING_MATCH_ALL_FILTER)
  })

  it('filters a specific building type code', () => {
    expect(
      getEnergymapBuildingFilter({
        buildingTypeFilter: '06',
        selectedConstructionDecade: 1970,
        showBuildingsFromSelectedDecade: false,
        showOnlySelectedDecade: false,
      })
    ).toEqual(['==', ['get', ENERGYMAP_BUILDING_TYPE_PROPERTY], '06'])
  })

  it('filters buildings from the selected decade onward', () => {
    expect(
      getEnergymapBuildingFilter({
        buildingTypeFilter: ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
        selectedConstructionDecade: 1970,
        showBuildingsFromSelectedDecade: true,
        showOnlySelectedDecade: false,
      })
    ).toEqual([
      '>=',
      [
        'to-number',
        [
          'slice',
          ['to-string', ['get', ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY]],
          0,
          4,
        ],
        -1,
      ],
      1970,
    ])
  })

  it('lets selected-decade-only mode win when both year switches are enabled', () => {
    expect(
      getEnergymapBuildingFilter({
        buildingTypeFilter: ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
        selectedConstructionDecade: 1970,
        showBuildingsFromSelectedDecade: true,
        showOnlySelectedDecade: true,
      })
    ).toEqual([
      'all',
      [
        '>=',
        [
          'to-number',
          [
            'slice',
            ['to-string', ['get', ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY]],
            0,
            4,
          ],
          -1,
        ],
        1970,
      ],
      [
        '<',
        [
          'to-number',
          [
            'slice',
            ['to-string', ['get', ENERGYMAP_BUILDING_COMPLETION_DATE_PROPERTY]],
            0,
            4,
          ],
          -1,
        ],
        1980,
      ],
    ])
  })

  it('combines building and heating filters with an all expression', () => {
    expect(
      combineMapFilters([
        ['==', ['get', ENERGYMAP_BUILDING_TYPE_PROPERTY], '05'],
        ['==', ['get', 'heating_energy_source'], '01'],
      ])
    ).toEqual([
      'all',
      ['==', ['get', ENERGYMAP_BUILDING_TYPE_PROPERTY], '05'],
      ['==', ['get', 'heating_energy_source'], '01'],
    ])
  })
})
