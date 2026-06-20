'use client'

import React from 'react'

import { Box } from '#/common/style/theme/system'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import {
  MapSearchBarSurface,
  type MapSearchResult,
} from '#/components/Map/MapSearchBar'
import { MAP_BUTTON_SIZE } from '#/components/Map/MapButton'

const noop = () => {}

const localResults: MapSearchResult[] = [
  {
    isLocal: true,
    lon: 24.9384,
    lat: 60.1699,
    bbox: [24.92, 60.16, 24.95, 60.18],
    displayNameArr: ['Helsinki', 'Keskusta', '(Buildings)'],
    datasetName: 'Buildings',
    place_id: 'fixture-local-helsinki',
  },
  {
    isLocal: true,
    lon: 24.941,
    lat: 60.173,
    bbox: null,
    displayNameArr: ['Helsinki City Hall', 'Fixture addresses'],
    datasetName: 'Addresses',
    place_id: 'fixture-local-city-hall',
  },
]

const remoteResults: MapSearchResult[] = [
  {
    place_id: 'fixture-remote-berlin',
    display_name: 'Berlin, Germany',
    name: 'Berlin',
    address: {
      city: 'Berlin',
      state: 'Berlin',
      country: 'Germany',
    },
    boundingbox: ['52.3382', '52.6755', '13.0884', '13.7611'],
    lon: '13.4050',
    lat: '52.5200',
    place_rank: 12,
    importance: 0.84,
    class: 'boundary',
    type: 'administrative',
  },
]

const MapFixtureSurface = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      minWidth: 360,
      minHeight: 190,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      p: 3,
      background:
        'linear-gradient(90deg, rgba(220, 226, 220, 0.9) 1px, transparent 1px), linear-gradient(rgba(220, 226, 220, 0.9) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      backgroundColor: '#eef2ed',
      color: '#111111',
      overflow: 'visible',
    }}
  >
    {children}
  </Box>
)

const SearchFixtureState = ({
  isVertical = true,
  isActive = true,
  isFocused = false,
  isLoading = false,
  inputValue = '',
  searchResults = [],
  defaultPopupOpen = false,
}: {
  isVertical?: boolean
  isActive?: boolean
  isFocused?: boolean
  isLoading?: boolean
  inputValue?: string
  searchResults?: MapSearchResult[]
  defaultPopupOpen?: boolean
}) => {
  const [value, setValue] = React.useState(inputValue)

  return (
    <MapSearchBarSurface
      isVertical={isVertical}
      isActive={isActive}
      isFocused={isFocused}
      isLoading={isLoading}
      inputValue={value}
      searchResults={searchResults}
      placeholder="Search"
      clearButtonAriaLabel="Clear or close search"
      noResultsLabel="No results"
      onOpen={noop}
      onClose={noop}
      onFocusChange={noop}
      onInputValueChange={setValue}
      onClear={() => setValue('')}
      onSelect={(_event, result) =>
        setValue(
          result.isLocal
            ? result.displayNameArr.join(' - ')
            : result.display_name || ''
        )
      }
      defaultPopupOpen={defaultPopupOpen}
    />
  )
}

const SearchToolbarStackFixture = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0.5rem',
        alignItems: 'flex-end',
        pointerEvents: 'auto',
      }}
    >
      <SearchFixtureState isFocused inputValue="hel" />
    </Box>
    <Box
      aria-label="Representative toolbar button"
      role="button"
      tabIndex={0}
      sx={{
        width: MAP_BUTTON_SIZE,
        height: MAP_BUTTON_SIZE,
        borderRadius: '0.3125rem',
        backgroundColor: 'neutral.light',
        color: 'text.primary',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        typography: 'body2',
        pointerEvents: 'auto',
      }}
    >
      UI
    </Box>
  </Box>
)

export const mapSearchBarFixture: ComponentFixture = {
  id: 'map-search-bar',
  label: 'Map search bar',
  description: 'Map search control open, loading, result, and empty states.',
  sourceGlobs: [
    'src/components/Map/MapSearchBar.tsx',
    'src/components/Map/MapActionsWrapper.tsx',
    'src/common/component-fixtures/fixtures/MapSearchBarFixture.tsx',
  ],
  wrapper: MapFixtureSurface,
  states: [
    {
      id: 'collapsed',
      label: 'Closed',
      description: 'Vertical search reduced to the 40px map button.',
      render: () => <SearchFixtureState isActive={false} />,
    },
    {
      id: 'open-focused',
      label: 'Open focused',
      description: 'Vertical search expanded with a focused input state.',
      render: () => <SearchFixtureState isFocused />,
    },
    {
      id: 'loading',
      label: 'Loading',
      description: 'Search input showing the remote-loading spinner.',
      render: () => <SearchFixtureState isFocused isLoading inputValue="hel" />,
    },
    {
      id: 'local-results',
      label: 'Local results',
      description: 'Local searchable data results rendered before remote data.',
      waitFor: 'text=Helsinki City Hall',
      render: () => (
        <SearchFixtureState
          isFocused
          inputValue="hel"
          searchResults={localResults}
          defaultPopupOpen
        />
      ),
    },
    {
      id: 'remote-result',
      label: 'Remote result',
      description: 'Remote Nominatim-shaped result rendering.',
      waitFor: 'text=Berlin',
      render: () => (
        <SearchFixtureState
          isFocused
          inputValue="ber"
          searchResults={remoteResults}
          defaultPopupOpen
        />
      ),
    },
    {
      id: 'selected',
      label: 'Selected',
      description: 'Selected result label remains in the input.',
      render: () => (
        <SearchFixtureState inputValue="Helsinki - Keskusta - (Buildings)" />
      ),
    },
    {
      id: 'no-results',
      label: 'No results',
      description: 'Empty search state after a non-empty query.',
      waitFor: 'text=No results',
      render: () => (
        <SearchFixtureState isFocused inputValue="zzzz" defaultPopupOpen />
      ),
    },
    {
      id: 'horizontal-results',
      label: 'Horizontal results',
      description: 'Horizontal search mode renders inline with its listbox.',
      waitFor: 'text=Helsinki City Hall',
      render: () => (
        <SearchFixtureState
          isVertical={false}
          isFocused
          inputValue="hel"
          searchResults={localResults}
          defaultPopupOpen
        />
      ),
    },
    {
      id: 'vertical-stack-open',
      label: 'Vertical stack open',
      description:
        'Expanded vertical search reserves layout space above toolbar buttons.',
      render: () => <SearchToolbarStackFixture />,
    },
  ],
}
