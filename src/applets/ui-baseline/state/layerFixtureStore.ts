import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from 'geojson'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const UI_BASELINE_DATASET_IDS = [
  'all-mock-data',
  'sample-points',
  'imaginary-routes',
  'sample-zones',
] as const

export type UiBaselineDatasetId = (typeof UI_BASELINE_DATASET_IDS)[number]

export const UI_BASELINE_YEAR_IDS = ['any-year', '2024', '2032', '2040'] as const

export type UiBaselineYearId = (typeof UI_BASELINE_YEAR_IDS)[number]

type FixtureKind = Exclude<UiBaselineDatasetId, 'all-mock-data'>
type FixtureStatus = 'published' | 'draft'

type FixtureProperties = GeoJsonProperties & {
  fixtureKind: FixtureKind
  fixtureYear: number
  status: FixtureStatus
  label: string
  displayLabel: string
}

type LayerFixtureFilters = {
  datasetId: UiBaselineDatasetId
  yearId: UiBaselineYearId
  includeDraftRecords: boolean
  showMockLabels: boolean
}

export type LayerFixtureState = LayerFixtureFilters & {
  data: FeatureCollection<Geometry, FixtureProperties>
  setDatasetId: (datasetId: UiBaselineDatasetId) => void
  setYearId: (yearId: UiBaselineYearId) => void
  setIncludeDraftRecords: (includeDraftRecords: boolean) => void
  setShowMockLabels: (showMockLabels: boolean) => void
  reset: () => void
}

const MOCK_FEATURES: Feature<Geometry, FixtureProperties>[] = [
  {
    type: 'Feature',
    id: 'sample-point-2024',
    properties: {
      fixtureKind: 'sample-points',
      fixtureYear: 2024,
      status: 'published',
      label: 'Sample point Alpha',
      displayLabel: '',
    },
    geometry: {
      type: 'Point',
      coordinates: [24.9355, 60.1715],
    },
  },
  {
    type: 'Feature',
    id: 'sample-point-2032-draft',
    properties: {
      fixtureKind: 'sample-points',
      fixtureYear: 2032,
      status: 'draft',
      label: 'Draft point Beta',
      displayLabel: '',
    },
    geometry: {
      type: 'Point',
      coordinates: [24.9525, 60.1745],
    },
  },
  {
    type: 'Feature',
    id: 'imaginary-route-2040',
    properties: {
      fixtureKind: 'imaginary-routes',
      fixtureYear: 2040,
      status: 'published',
      label: 'Imaginary route Gamma',
      displayLabel: '',
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [24.921, 60.166],
        [24.938, 60.178],
        [24.965, 60.165],
      ],
    },
  },
  {
    type: 'Feature',
    id: 'sample-zone-2032',
    properties: {
      fixtureKind: 'sample-zones',
      fixtureYear: 2032,
      status: 'published',
      label: 'Sample zone Delta',
      displayLabel: '',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [24.928, 60.158],
          [24.948, 60.158],
          [24.948, 60.166],
          [24.928, 60.166],
          [24.928, 60.158],
        ],
      ],
    },
  },
]

export const INITIAL_LAYER_FIXTURE_FILTERS: LayerFixtureFilters = {
  datasetId: 'all-mock-data',
  yearId: 'any-year',
  includeDraftRecords: true,
  showMockLabels: true,
}

export const getLayerFixtureData = ({
  datasetId,
  yearId,
  includeDraftRecords,
  showMockLabels,
}: LayerFixtureFilters): FeatureCollection<Geometry, FixtureProperties> => {
  const selectedYear = yearId === 'any-year' ? null : Number(yearId)

  return {
    type: 'FeatureCollection',
    features: MOCK_FEATURES.filter((feature) => {
      const properties = feature.properties

      return (
        (datasetId === 'all-mock-data' ||
          properties.fixtureKind === datasetId) &&
        (selectedYear == null || properties.fixtureYear === selectedYear) &&
        (includeDraftRecords || properties.status !== 'draft')
      )
    }).map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        displayLabel: showMockLabels ? feature.properties.label : '',
      },
    })),
  }
}

const createStateWithData = (filters: LayerFixtureFilters) => ({
  ...filters,
  data: getLayerFixtureData(filters),
})

export const useLayerFixtureStore = create<LayerFixtureState>()(
  subscribeWithSelector((set) => ({
    ...createStateWithData(INITIAL_LAYER_FIXTURE_FILTERS),
    setDatasetId: (datasetId) => {
      set((state) =>
        createStateWithData({
          datasetId,
          yearId: state.yearId,
          includeDraftRecords: state.includeDraftRecords,
          showMockLabels: state.showMockLabels,
        })
      )
    },
    setYearId: (yearId) => {
      set((state) =>
        createStateWithData({
          datasetId: state.datasetId,
          yearId,
          includeDraftRecords: state.includeDraftRecords,
          showMockLabels: state.showMockLabels,
        })
      )
    },
    setIncludeDraftRecords: (includeDraftRecords) => {
      set((state) =>
        createStateWithData({
          datasetId: state.datasetId,
          yearId: state.yearId,
          includeDraftRecords,
          showMockLabels: state.showMockLabels,
        })
      )
    },
    setShowMockLabels: (showMockLabels) => {
      set((state) =>
        createStateWithData({
          datasetId: state.datasetId,
          yearId: state.yearId,
          includeDraftRecords: state.includeDraftRecords,
          showMockLabels,
        })
      )
    },
    reset: () => set(createStateWithData(INITIAL_LAYER_FIXTURE_FILTERS)),
  }))
)
