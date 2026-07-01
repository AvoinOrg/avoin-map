import type { Polygon } from 'geojson'

import type {
  ColOptions,
  FolayerAreaCollection,
  FolayerFeature,
} from './types'

export type LuonnonmetsakartatMockLayerRecord = {
  id: string
  name: string
  description: string
  color_code: string
  is_hidden: boolean
  created_ts: number
  updated_ts: number
  col_options: ColOptions
  areas: FolayerAreaCollection
}

export const LUONNONMETSAKARTAT_MOCK_LAYER_CREATED_TS = 1_735_689_600
export const LUONNONMETSAKARTAT_MOCK_LAYER_UPDATED_TS = 1_735_776_000

const createPolygon = ({
  offsetX,
  offsetY,
}: {
  offsetX: number
  offsetY: number
}): Polygon => ({
  type: 'Polygon',
  coordinates: [
    [
      [24.85 + offsetX, 60.22 + offsetY],
      [24.856 + offsetX, 60.22 + offsetY],
      [24.856 + offsetX, 60.225 + offsetY],
      [24.85 + offsetX, 60.225 + offsetY],
      [24.85 + offsetX, 60.22 + offsetY],
    ],
  ],
})

export const createLuonnonmetsakartatMockAreaFeature = ({
  areaHa,
  date,
  description,
  id,
  layerId,
  municipality,
  name,
  offsetX,
  offsetY,
  pictures,
  region,
  createdTs = '2025-01-01T00:00:00.000Z',
  updatedTs = '2025-01-02T00:00:00.000Z',
}: {
  areaHa: number
  date: string
  description: string
  id: string
  layerId: string
  municipality: string
  name: string
  offsetX: number
  offsetY: number
  pictures?: string[]
  region: string
  createdTs?: string
  updatedTs?: string
}): FolayerFeature => {
  const properties = {
    id,
    name,
    area_ha: areaHa,
    municipality,
    region,
    description,
    date,
    created_ts: createdTs,
    updated_ts: updatedTs,
    layer_id: layerId,
    ...(pictures ? { pictures: JSON.stringify(pictures) } : {}),
  } as unknown as FolayerFeature['properties']

  return {
    id,
    type: 'Feature',
    geometry: createPolygon({ offsetX, offsetY }),
    properties,
  }
}

export const createLuonnonmetsakartatMockDefaultColOptions = (): ColOptions => ({
  indexingStrategy: 'name_municipality',
  idCol: 'id',
  nameCol: 'name',
  municipalityCol: 'municipality',
  regionCol: 'region',
  descriptionCol: 'description',
  areaCol: 'area_ha',
})

export const createLuonnonmetsakartatMockAreaCollection = (
  features: FolayerFeature[] = []
): FolayerAreaCollection => ({
  type: 'FeatureCollection',
  features,
})

export const createLuonnonmetsakartatMockSeedLayers =
  (): LuonnonmetsakartatMockLayerRecord[] => [
    {
      id: 'mock-visible-layer',
      name: 'Mock visible forest layer',
      description: 'Deterministic visible luonnonmetsa mock layer.',
      color_code: '#2f855a',
      is_hidden: false,
      created_ts: LUONNONMETSAKARTAT_MOCK_LAYER_CREATED_TS,
      updated_ts: LUONNONMETSAKARTAT_MOCK_LAYER_UPDATED_TS,
      col_options: createLuonnonmetsakartatMockDefaultColOptions(),
      areas: createLuonnonmetsakartatMockAreaCollection([
        createLuonnonmetsakartatMockAreaFeature({
          id: 'mock-visible-area-picture',
          layerId: 'mock-visible-layer',
          name: 'Mock Ridge Forest',
          municipality: 'Espoo',
          region: 'Uusimaa',
          description: 'Old spruce stand with a small wetland edge.',
          date: '2025-05-10',
          areaHa: 12.34,
          offsetX: 0,
          offsetY: 0,
          pictures: [
            'https://example.org/mock/forest-ridge-1.jpg',
            'https://example.org/mock/forest-ridge-2.jpg',
          ],
        }),
        createLuonnonmetsakartatMockAreaFeature({
          id: 'mock-visible-area-no-picture',
          layerId: 'mock-visible-layer',
          name: 'Mock Lakeside Grove',
          municipality: 'Lohja',
          region: 'Uusimaa',
          description: 'Mixed forest by a lakeside conservation corridor.',
          date: '2024-09-18',
          areaHa: 7.89,
          offsetX: 0.018,
          offsetY: 0.006,
        }),
      ]),
    },
    {
      id: 'mock-hidden-layer',
      name: 'Mock hidden review layer',
      description: 'Deterministic hidden luonnonmetsa mock layer.',
      color_code: '#805ad5',
      is_hidden: true,
      created_ts: LUONNONMETSAKARTAT_MOCK_LAYER_CREATED_TS + 60,
      updated_ts: LUONNONMETSAKARTAT_MOCK_LAYER_UPDATED_TS + 60,
      col_options: {
        ...createLuonnonmetsakartatMockDefaultColOptions(),
        indexingStrategy: 'id',
      },
      areas: createLuonnonmetsakartatMockAreaCollection([
        createLuonnonmetsakartatMockAreaFeature({
          id: 'mock-hidden-area',
          layerId: 'mock-hidden-layer',
          name: 'Mock Hidden Ravine',
          municipality: 'Sipoo',
          region: 'Uusimaa',
          description: 'Hidden admin-only ravine forest candidate.',
          date: '2023-08-22',
          areaHa: 4.56,
          offsetX: 0.036,
          offsetY: 0.012,
        }),
      ]),
    },
    {
      id: 'mock-empty-layer',
      name: 'Mock empty visible layer',
      description: 'Visible mock layer without area features.',
      color_code: '#dd6b20',
      is_hidden: false,
      created_ts: LUONNONMETSAKARTAT_MOCK_LAYER_CREATED_TS + 120,
      updated_ts: LUONNONMETSAKARTAT_MOCK_LAYER_UPDATED_TS + 120,
      col_options: createLuonnonmetsakartatMockDefaultColOptions(),
      areas: createLuonnonmetsakartatMockAreaCollection(),
    },
  ]
