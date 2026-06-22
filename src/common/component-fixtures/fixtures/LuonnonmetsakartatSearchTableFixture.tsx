'use client'

import React from 'react'
import type { MapGeoJSONFeature } from 'maplibre-gl'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import { useMapStore } from '#/common/store'
import SearchTable from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/SearchTable'
import type { FolayerFeature } from '#/app/[locale]/(map)/(applets)/luonnonmetsakartat/common/types'

const fixtureSource = {
  source: 'luonnonmetsakartat-search-table-fixture-source',
}

const createFeature = ({
  id,
  name,
  region,
  municipality,
  coordinates,
}: {
  id: string
  name: string
  region: string
  municipality: string
  coordinates: [number, number]
}): FolayerFeature =>
  ({
    id,
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates,
    },
    properties: {
      id,
      name,
      region,
      municipality,
      created_ts: '2026-01-01T00:00:00.000Z',
      updated_ts: '2026-01-01T00:00:00.000Z',
      area_ha: 14.2,
      date: '2026-01-01',
    },
  }) as unknown as FolayerFeature

const populatedFeatures = [
  createFeature({
    id: 'forest-1',
    name: 'North Ridge Forest',
    region: 'Uusimaa',
    municipality: 'Helsinki',
    coordinates: [24.93, 60.17],
  }),
  createFeature({
    id: 'forest-2',
    name: 'Lake Edge Grove',
    region: 'Pirkanmaa',
    municipality: 'Tampere',
    coordinates: [23.76, 61.5],
  }),
  createFeature({
    id: 'forest-3',
    name: 'Selected Natural Forest',
    region: 'Central Finland',
    municipality: 'Jyvaskyla',
    coordinates: [25.74, 62.24],
  }),
  createFeature({
    id: 'forest-4',
    name: 'Eastern Spruce Stand',
    region: 'North Karelia',
    municipality: 'Joensuu',
    coordinates: [29.76, 62.6],
  }),
  createFeature({
    id: 'forest-5',
    name: 'Old Pine Hollow',
    region: 'Lapland',
    municipality: 'Rovaniemi',
    coordinates: [25.73, 66.5],
  }),
]

const manyRowsFeatures = Array.from({ length: 26 }, (_, index) =>
  createFeature({
    id: `forest-many-${index + 1}`,
    name: `Fixture Forest ${String(index + 1).padStart(2, '0')}`,
    region: index % 2 === 0 ? 'Uusimaa' : 'Pirkanmaa',
    municipality: index % 2 === 0 ? 'Helsinki' : 'Tampere',
    coordinates: [24.9 + index / 100, 60.1 + index / 100],
  })
)

const SearchTableFixtureShell = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 420,
      maxWidth: '100%',
      p: 2,
      backgroundColor: '#ffffff',
      border: '1px solid #d7ddd6',
      borderRadius: 1,
    }}
  >
    {children}
  </Box>
)

const SearchTableFixtureState = ({
  data,
  selectedFeatureId,
}: {
  data: FolayerFeature[]
  selectedFeatureId?: string
}) => {
  React.useLayoutEffect(() => {
    const previousSelectedFeatures = useMapStore.getState().selectedFeatures
    const selectedFeature = data.find(
      (feature) => feature.properties.id === selectedFeatureId
    )

    useMapStore.setState({
      selectedFeatures: selectedFeature
        ? ([
            {
              ...selectedFeature,
              source: fixtureSource.source,
            },
          ] as unknown as MapGeoJSONFeature[])
        : [],
    })

    return () => {
      useMapStore.setState({ selectedFeatures: previousSelectedFeatures })
    }
  }, [data, selectedFeatureId])

  return (
    <SearchTable
      data={data}
      source={fixtureSource}
      keysToSearch={[
        'properties.name',
        'properties.region',
        'properties.municipality',
      ]}
      sortKeys={[
        { key: 'name', label: 'Name' },
        { key: 'region', label: 'Region' },
        { key: 'municipality', label: 'Municipality' },
      ]}
      searchPlaceholder="Search areas"
    />
  )
}

export const luonnonmetsakartatSearchTableFixture: ComponentFixture = {
  id: 'luonnonmetsakartat-search-table',
  label: 'Luonnonmetsakartat SearchTable',
  locale: 'fi',
  description:
    'Admin natural forest area search table states for F047 remigration coverage.',
  sourceGlobs: [
    'src/app/[locale]/(map)/(applets)/luonnonmetsakartat/components/SearchTable.tsx',
    'src/common/component-fixtures/fixtures/LuonnonmetsakartatSearchTableFixture.tsx',
  ],
  wrapper: SearchTableFixtureShell,
  states: [
    {
      id: 'populated',
      label: 'Populated',
      description:
        'Default populated search table with compact search and sort controls.',
      waitFor: 'text=North Ridge Forest',
      render: () => <SearchTableFixtureState data={populatedFeatures} />,
    },
    {
      id: 'selected-row',
      label: 'Selected row',
      description:
        'Search table with map-store selection seeded for selected-row styling.',
      waitFor: '[data-testid="search-table-row-selected"]',
      render: () => (
        <SearchTableFixtureState
          data={populatedFeatures}
          selectedFeatureId="forest-3"
        />
      ),
    },
    {
      id: 'many-rows',
      label: 'Many rows',
      description:
        'Enough rows to exercise the virtualized list height and scroll container.',
      waitFor: 'text=Fixture Forest 01',
      render: () => <SearchTableFixtureState data={manyRowsFeatures} />,
    },
  ],
}
