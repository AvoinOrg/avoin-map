'use client'

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react'
import { useTranslate } from '@tolgee/react'
import axios from 'axios'
import { useParams } from 'next/navigation'

import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { useMapStore, useUIStore } from '#/common/store'
import {
  Box,
  type AppSxProps,
  type AppTheme,
} from '#/common/style/theme/system'
import { IconButton } from '#/components/common/Button'
import { Cross, Search } from '#/components/icons'
import {
  boundsFromNominatim,
  defaultFeatureDisplayPattern,
  defaultPointZoom,
  getFeatureCenterCoordinates,
  zoomFromPlaceOptions,
} from '#/common/utils/map'
import { MapMenuState } from '#/common/types/state'
import { MAP_BUTTON_SIZE, MapButton } from './MapButton'

const mapMenuState: MapMenuState = 'search'

export const MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH = 40
export const MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH = 300
const SEARCH_DEBOUNCE_MS = 300
const MIN_REMOTE_QUERY_LENGTH = 3
const MAX_LOCAL_RESULTS = 25
const MAX_REMOTE_RESULTS = 5
const MAX_REMOTE_CACHE_SIZE = 50

type SearchableFeature = {
  id?: string | number
  properties?: Record<string, unknown> | null
  geometry?: unknown
  bbox?: [number, number, number, number]
}

type GeoJsonGeometryLike = {
  coordinates?: unknown
  geometries?: unknown
}

type LocalSearchIndexEntry = {
  feature: SearchableFeature
  searchText: string
  displayNameArr: string[]
  datasetName: string
  appendDatasetName: boolean
  getCoordinates: (feature: SearchableFeature) => [number, number] | null
  place_id: string
}

export type LocalMapSearchResult = {
  isLocal: true
  lon: number
  lat: number
  bbox: [number, number, number, number] | null
  displayNameArr: string[]
  datasetName: string
  place_id: string
}

export type RemoteMapSearchResult = {
  isLocal?: false
  place_id?: string | number
  display_name?: string
  name?: string
  address?: Record<string, string | undefined>
  boundingbox?: string[] | [string, string, string, string]
  bbox?: [number, number, number, number]
  lon?: string | number
  lng?: string | number
  lat?: string | number
  latitude?: string | number
  place_rank?: number | string
  importance?: number | string
  class?: string
  type?: string
}

export type MapSearchResult = LocalMapSearchResult | RemoteMapSearchResult

type MapSearchBarSurfaceProps = {
  isVertical: boolean
  isActive: boolean
  isFocused: boolean
  isLoading: boolean
  inputValue: string
  searchResults: MapSearchResult[]
  placeholder: string
  clearButtonAriaLabel: string
  noResultsLabel: string
  onOpen: () => void
  onClose: () => void
  onFocusChange: (isFocused: boolean) => void
  onInputValueChange: (value: string) => void
  onClear: () => void
  onSelect: (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    result: MapSearchResult
  ) => void
  inputRef?: React.Ref<HTMLInputElement>
  defaultPopupOpen?: boolean
}

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  sx?: AppSxProps
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ sx, ...props }, ref) {
    return (
      <Box
        component="input"
        ref={ref as React.Ref<HTMLElement>}
        sx={sx}
        {...props}
      />
    )
  }
)

const assignRef = <TElement,>(
  ref: React.Ref<TElement> | undefined,
  value: TElement | null
) => {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ;(ref as React.MutableRefObject<TElement | null>).current = value
}

const getSearchResultKey = (result: MapSearchResult, index: number) =>
  String(result.place_id ?? getSearchResultLabel(result) ?? index)

const getSearchResultLabel = (result: MapSearchResult) => {
  if (result.isLocal) {
    return result.displayNameArr.join(' - ') || ''
  }

  return result.display_name || result.name || ''
}

const extendBoundsFromCoordinates = (
  coordinates: unknown,
  bounds: [number, number, number, number]
) => {
  if (!Array.isArray(coordinates)) {
    return
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === 'number' &&
    typeof coordinates[1] === 'number'
  ) {
    bounds[0] = Math.min(bounds[0], coordinates[0])
    bounds[1] = Math.min(bounds[1], coordinates[1])
    bounds[2] = Math.max(bounds[2], coordinates[0])
    bounds[3] = Math.max(bounds[3], coordinates[1])
    return
  }

  coordinates.forEach((coordinateSet) => {
    extendBoundsFromCoordinates(coordinateSet, bounds)
  })
}

const extendBoundsFromGeometry = (
  geometry: unknown,
  bounds: [number, number, number, number]
) => {
  if (!geometry || typeof geometry !== 'object') {
    return
  }

  const geometryLike = geometry as GeoJsonGeometryLike
  extendBoundsFromCoordinates(geometryLike.coordinates, bounds)

  if (Array.isArray(geometryLike.geometries)) {
    geometryLike.geometries.forEach((childGeometry) => {
      extendBoundsFromGeometry(childGeometry, bounds)
    })
  }
}

const getGeometryBbox = (
  geometry: unknown
): [number, number, number, number] | null => {
  const bounds: [number, number, number, number] = [
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
  ]

  extendBoundsFromGeometry(geometry, bounds)

  return bounds.every(Number.isFinite) ? bounds : null
}

const getRemoteAddressParts = (result: RemoteMapSearchResult) => {
  const { address, name } = result

  if (!address) {
    return []
  }

  const addressParts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.city,
    address.state,
    address.country,
  ].filter(Boolean) as string[]

  const uniqueAddressParts = [...new Set(addressParts)]
  const nameIndex = name ? uniqueAddressParts.indexOf(name) : -1

  if (nameIndex > -1) {
    uniqueAddressParts.splice(nameIndex, 1)
  }

  return uniqueAddressParts
}

const getSearchResultText = (result: MapSearchResult) => {
  if (result.isLocal) {
    const [primaryText = '', ...secondaryParts] = result.displayNameArr

    return {
      primaryText,
      secondaryText: secondaryParts.join(' - '),
    }
  }

  const label = getSearchResultLabel(result)

  return {
    primaryText: result.name || label,
    secondaryText: getRemoteAddressParts(result).join(', '),
  }
}

const mapSearchSurfaceSx = {
  position: 'relative',
  height: `${MAP_BUTTON_SIZE}px`,
  backgroundColor: 'neutral.light',
  marginLeft: 'auto',
  borderRadius: '0.3125rem',
  pointerEvents: 'auto',
  overflow: 'visible',
  '&:hover': {
    opacity: 1,
  },
}

const mapSearchInputRootSx = {
  width: `${MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH}px`,
  height: `${MAP_BUTTON_SIZE}px`,
  display: 'flex',
  alignItems: 'center',
  gap: 0.75,
  pl: 1,
  pr: 4.5,
  backgroundColor: 'neutral.light',
  opacity: 0.9,
  borderRadius: '0.3125rem',
  boxSizing: 'border-box',
  '&:focus-within': {
    boxShadow: 'none',
  },
}

const mapSearchInputSx = {
  minWidth: 0,
  flex: 1,
  height: '100%',
  p: 0,
  border: 0,
  outline: 0,
  backgroundColor: 'transparent',
  color: 'text.primary',
  typography: 'body2',
  font: 'inherit',
  '&::placeholder': {
    color: 'text.secondary',
    opacity: 1,
  },
}

const mapSearchIconButtonSx = {
  width: 24,
  minWidth: 24,
  height: 24,
  m: 0,
  p: 0,
  border: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  color: 'action.active',
  cursor: 'pointer',
  borderRadius: '0.125rem',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
  '&:focus-visible': {
    outline: (theme: AppTheme) => `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: 1,
  },
}

const mapSearchPopupSx = {
  width: `${MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH}px`,
  mt: '-0.3125rem',
  borderRadius: '0.3125rem',
  borderTopLeftRadius: 0,
  borderTopRightRadius: 0,
  backgroundColor: 'neutral.light',
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.18)',
  overflow: 'hidden',
  outline: 0,
}

const mapSearchOptionSx = {
  px: 1.5,
  py: 1,
  cursor: 'pointer',
  outline: 0,
  '&:hover': {
    backgroundColor: 'neutral.main',
  },
  '&[aria-selected="true"]': {
    backgroundColor: 'primary.light',
  },
}

const mapSearchPrimaryTextSx = {
  m: 0,
  color: 'text.primary',
  typography: 'body1',
}

const mapSearchSecondaryTextSx = {
  m: 0,
  color: 'text.secondary',
  typography: 'body2',
}

const mapSearchSpinnerSx = {
  width: 18,
  height: 18,
  borderRadius: '50%',
  border: '2px solid',
  borderColor: 'action.disabledBackground',
  borderTopColor: 'action.active',
  animation: 'map-search-spin 0.8s linear infinite',
  '@keyframes map-search-spin': {
    to: {
      transform: 'rotate(360deg)',
    },
  },
}

export const MapSearchBarSurface = ({
  isVertical,
  isActive,
  isFocused,
  isLoading,
  inputValue,
  searchResults,
  placeholder,
  clearButtonAriaLabel,
  noResultsLabel,
  onOpen,
  onClose,
  onFocusChange,
  onInputValueChange,
  onClear,
  onSelect,
  inputRef,
  defaultPopupOpen = false,
}: MapSearchBarSurfaceProps) => {
  const rootRef = useRef<HTMLElement | null>(null)
  const popupRef = useRef<HTMLElement | null>(null)
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const listboxId = React.useId()
  const [popupOpen, setPopupOpen] = useState(defaultPopupOpen)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const isInputVisible = !isVertical || isActive
  const trimmedInputValue = inputValue.trim()
  const showNoResults =
    trimmedInputValue.length > 0 && !isLoading && searchResults.length === 0
  const shouldShowPopup =
    isInputVisible && popupOpen && (searchResults.length > 0 || showNoResults)

  const setInputRefs = useCallback(
    (node: HTMLInputElement | null) => {
      localInputRef.current = node
      assignRef(inputRef, node)
    },
    [inputRef]
  )

  const closeIfFocusLeft = useCallback(() => {
    window.setTimeout(() => {
      const activeElement = document.activeElement
      const focusInRoot =
        activeElement instanceof Element &&
        (rootRef.current?.contains(activeElement) ||
          popupRef.current?.contains(activeElement))

      if (focusInRoot) {
        return
      }

      onFocusChange(false)

      if (isVertical && !inputValue.trim()) {
        onClose()
      }
    }, 200)
  }, [inputValue, isVertical, onClose, onFocusChange])

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setPopupOpen(true)
      setHighlightedIndex((previous) =>
        searchResults.length === 0
          ? 0
          : Math.min(previous + 1, searchResults.length - 1)
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setPopupOpen(true)
      setHighlightedIndex((previous) => Math.max(previous - 1, 0))
      return
    }

    if (event.key === 'Enter' && shouldShowPopup && searchResults.length > 0) {
      event.preventDefault()
      const selectedResult =
        searchResults[Math.min(highlightedIndex, searchResults.length - 1)]
      if (selectedResult) {
        onSelect(event, selectedResult)
        setPopupOpen(false)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setPopupOpen(false)
    }
  }

  if (!isInputVisible) {
    return (
      <Box
        ref={rootRef}
        sx={[
          mapSearchSurfaceSx,
          {
            width: MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH,
            overflow: 'hidden',
            zIndex: 'auto',
          },
        ]}
      >
        <MapButton
          onClick={onOpen}
          aria-label={placeholder}
          sx={{
            backgroundColor: 'transparent',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'neutral.main',
            },
          }}
        >
          <Search sx={{ color: 'action.active' }} aria-hidden="true" />
        </MapButton>
      </Box>
    )
  }

  return (
    <Box
      ref={rootRef}
      sx={[
        mapSearchSurfaceSx,
        {
          width: MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH,
          zIndex: isFocused ? (theme: AppTheme) => theme.zIndex.drawer + 5 : 'auto',
        },
      ]}
    >
      <Box sx={mapSearchInputRootSx}>
        <Box
          component="span"
          role={isLoading ? 'status' : undefined}
          aria-label={isLoading ? placeholder : undefined}
          sx={{
            width: 24,
            minWidth: 24,
            height: 24,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'action.active',
          }}
        >
          {isLoading ? (
            <Box component="span" aria-hidden="true" sx={mapSearchSpinnerSx} />
          ) : (
            <Search
              sx={{ width: 24, height: 24, display: 'block' }}
              aria-hidden="true"
            />
          )}
        </Box>

        <SearchInput
          ref={setInputRefs}
          role="combobox"
          aria-label={placeholder}
          aria-expanded={shouldShowPopup ? 'true' : 'false'}
          aria-haspopup="listbox"
          aria-controls={shouldShowPopup ? listboxId : undefined}
          aria-activedescendant={
            shouldShowPopup && searchResults[highlightedIndex]
              ? `${listboxId}-option-${highlightedIndex}`
              : undefined
          }
          aria-autocomplete="list"
          placeholder={placeholder}
          value={inputValue}
          autoComplete="off"
          spellCheck={false}
          onFocus={() => {
            onFocusChange(true)
            setPopupOpen(true)
          }}
          onBlur={closeIfFocusLeft}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onInputValueChange(event.target.value)
            setHighlightedIndex(0)
            setPopupOpen(true)
          }}
          onKeyDown={handleInputKeyDown}
          sx={mapSearchInputSx}
        />
      </Box>

      {shouldShowPopup && (
        <Box
          ref={popupRef}
          id={listboxId}
          role="listbox"
          sx={[
            mapSearchPopupSx,
            {
              position: 'absolute',
              top: MAP_BUTTON_SIZE,
              right: 0,
              zIndex: (theme: AppTheme) => theme.zIndex.drawer + 4,
            },
          ]}
        >
          {searchResults.map((result, index) => {
            const { primaryText, secondaryText } = getSearchResultText(result)
            const isHighlighted = index === highlightedIndex

            return (
              <Box
                key={getSearchResultKey(result, index)}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isHighlighted ? 'true' : 'false'}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
                  event.preventDefault()
                }}
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  onSelect(event, result)
                  setPopupOpen(false)
                }}
                sx={[
                  mapSearchOptionSx,
                  ...(isHighlighted
                    ? [
                        {
                          backgroundColor: 'neutral.main',
                        },
                      ]
                    : []),
                ]}
              >
                <Box>
                  <Box component="p" sx={mapSearchPrimaryTextSx}>
                    {primaryText}
                  </Box>
                  {secondaryText && (
                    <Box component="p" sx={mapSearchSecondaryTextSx}>
                      {secondaryText}
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })}

          {showNoResults && (
            <Box
              role="status"
              sx={{
                px: 1.5,
                py: 1,
                color: 'text.secondary',
                typography: 'body2',
              }}
            >
              {noResultsLabel}
            </Box>
          )}
        </Box>
      )}

      <IconButton
        type="button"
        aria-label={clearButtonAriaLabel}
        onMouseDown={(event: React.MouseEvent<HTMLElement>) => {
          event.preventDefault()
        }}
        onClick={() => {
          onClear()
          setPopupOpen(false)
          if (isVertical && !inputValue.trim()) {
            localInputRef.current?.blur()
          } else {
            localInputRef.current?.focus()
          }
        }}
        sx={[
          mapSearchIconButtonSx,
          {
            position: 'absolute',
            top: 8,
            right: 8,
            visibility:
              inputValue || (isVertical && isActive) ? 'visible' : 'hidden',
          },
        ]}
      >
        <Cross sx={{ width: 14, height: 14 }} aria-hidden="true" />
      </IconButton>
    </Box>
  )
}

export const MapSearchBar = ({ isVertical }: { isVertical: boolean }) => {
  const [searchResults, setSearchResults] = useState<MapSearchResult[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fetchCounter = useRef(0)
  const remoteCacheRef = useRef<Map<string, RemoteMapSearchResult[]>>(new Map())
  const remoteRequestRef = useRef<AbortController | null>(null)
  const { locale } = useParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const setMapMenuState = useUIStore((state) => state.setMapMenuState)

  const { t } = useTranslate('avoin-map')
  const map = useMapInstanceStore((state) => state._map)
  const searchableDatas = useMapStore((state) => state.searchableDatas)
  const searchCountryCodes = useUIStore((state) => state.searchCountryCodes)
  const fitBounds = useMapStore((state) => state.fitBounds)
  const flyTo = useMapStore((state) => state.flyTo)

  const abortRemoteSearch = useCallback(() => {
    remoteRequestRef.current?.abort()
    remoteRequestRef.current = null
  }, [])

  const invalidateRemoteSearch = useCallback(() => {
    fetchCounter.current += 1
    abortRemoteSearch()
  }, [abortRemoteSearch])

  const resetSearchResults = useCallback(() => {
    invalidateRemoteSearch()
    setSearchResults([])
    setIsLoading(false)
  }, [invalidateRemoteSearch])

  const isActive = useMemo(() => {
    return activeMapMenu === mapMenuState
  }, [activeMapMenu])

  useEffect(() => {
    if (isActive && isVertical) {
      searchInputRef.current?.focus()
    }
  }, [isActive, isVertical])

  useEffect(() => {
    return () => {
      remoteRequestRef.current?.abort()
    }
  }, [])

  const enabledSearchableDatas = useMemo(
    () =>
      Object.values(searchableDatas).filter(
        (searchableData) =>
          searchableData.enabled &&
          searchableData.data &&
          searchableData.data.features &&
          searchableData.data.features.length > 0
      ),
    [searchableDatas]
  )

  const localSearchIndex = useMemo(() => {
    const entries: LocalSearchIndexEntry[] = []

    enabledSearchableDatas.forEach((source) => {
      const {
        data,
        name: datasetName,
        fields,
        appendDatasetName = true,
        getCoordinates = getFeatureCenterCoordinates,
        displayPattern = defaultFeatureDisplayPattern,
      } = source

      if (!data?.features) return

      data.features.forEach((feature) => {
        const searchableFeature = feature as SearchableFeature
        const properties = searchableFeature.properties
        if (!properties) return

        const values = (
          fields && fields.length > 0
            ? fields.map((field) => properties[field])
            : Object.values(properties)
        ).filter((entryValue) => entryValue != null && entryValue !== '')

        if (values.length === 0) return

        const searchText = values
          .map((entryValue) => String(entryValue).toLowerCase())
          .join(' ')
        const displayNameArr = displayPattern(feature, fields)

        entries.push({
          feature: searchableFeature,
          searchText,
          displayNameArr,
          datasetName,
          appendDatasetName,
          getCoordinates: getCoordinates as LocalSearchIndexEntry['getCoordinates'],
          place_id: String(
            searchableFeature.id ||
              searchableFeature.properties?.id ||
              `${datasetName}-${displayNameArr.join('-')}`
          ),
        })
      })
    })

    return entries
  }, [enabledSearchableDatas])

  const performLocalSearch = useCallback(
    (query: string) => {
      if (!query) return []
      const lowerCaseQuery = query.toLowerCase()
      const localResults: LocalMapSearchResult[] = []

      for (const entry of localSearchIndex) {
        if (!entry.searchText.includes(lowerCaseQuery)) {
          continue
        }

        const coords = entry.getCoordinates(entry.feature)
        if (!coords) {
          continue
        }

        const bbox = entry.feature.bbox
          ? entry.feature.bbox
          : entry.feature.geometry
            ? getGeometryBbox(entry.feature.geometry)
            : null

        const displayNameArr = entry.appendDatasetName
          ? [...entry.displayNameArr, `(${entry.datasetName})`]
          : entry.displayNameArr

        localResults.push({
          isLocal: true,
          lon: coords[0],
          lat: coords[1],
          bbox,
          displayNameArr,
          datasetName: entry.datasetName,
          place_id: entry.place_id,
        })

        if (localResults.length >= MAX_LOCAL_RESULTS) {
          break
        }
      }

      return localResults
    },
    [localSearchIndex]
  )

  const handleSearch = useCallback(
    async (rawQuery: string) => {
      const query = rawQuery.trim()
      if (!query) {
        resetSearchResults()
        return
      }
      const currentFetchId = ++fetchCounter.current

      const localResults = performLocalSearch(query)

      if (currentFetchId === fetchCounter.current) {
        setSearchResults(localResults)
      }

      if (query.length < MIN_REMOTE_QUERY_LENGTH) {
        if (currentFetchId === fetchCounter.current) {
          abortRemoteSearch()
          setIsLoading(false)
        }
        return
      }

      const cacheKey = `${locale || 'en'}|${searchCountryCodes.join(
        ','
      )}|${query}`
      const cachedResults = remoteCacheRef.current.get(cacheKey)
      if (cachedResults) {
        if (currentFetchId === fetchCounter.current) {
          abortRemoteSearch()
          setSearchResults([...localResults, ...cachedResults])
          setIsLoading(false)
        }
        return
      }

      remoteRequestRef.current?.abort()
      const controller = new AbortController()
      remoteRequestRef.current = controller
      if (currentFetchId === fetchCounter.current) {
        setIsLoading(true)
      }

      try {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&addressdetails=1&limit=${MAX_REMOTE_RESULTS}`
        if (searchCountryCodes.length > 0) {
          url += `&countrycodes=${searchCountryCodes.join(',')}`
        }
        const res = await axios.get<RemoteMapSearchResult[]>(url, {
          headers: { 'Accept-Language': locale || 'en' },
          signal: controller.signal,
        })
        if (controller.signal.aborted) return

        remoteCacheRef.current.set(cacheKey, res.data)
        if (remoteCacheRef.current.size > MAX_REMOTE_CACHE_SIZE) {
          const oldestKey = remoteCacheRef.current.keys().next().value
          if (oldestKey) {
            remoteCacheRef.current.delete(oldestKey)
          }
        }

        if (currentFetchId === fetchCounter.current) {
          setSearchResults([...localResults, ...res.data])
          setIsLoading(false)
        }
      } catch {
        if (controller.signal.aborted) return
        if (currentFetchId === fetchCounter.current) {
          setSearchResults(localResults)
          setIsLoading(false)
        }
      }
    },
    [
      abortRemoteSearch,
      locale,
      performLocalSearch,
      resetSearchResults,
      searchCountryCodes,
    ]
  )

  useEffect(() => {
    const query = inputValue.trim()
    if (!query) {
      invalidateRemoteSearch()
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      handleSearch(query)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [inputValue, handleSearch, invalidateRemoteSearch])

  const handleSelect = (
    _event:
      | React.MouseEvent<HTMLElement>
      | React.KeyboardEvent<HTMLElement>
      | React.SyntheticEvent<Element, Event>,
    option: MapSearchResult | null
  ) => {
    if (!option || !map) return

    let bbox: [number, number, number, number] | null = null

    if (option.isLocal) {
      bbox = option.bbox || null
    } else {
      bbox = boundsFromNominatim(option)
    }

    if (bbox) {
      fitBounds({
        bbox: [bbox[2], bbox[0], bbox[3], bbox[1]],
        options: {
          duration: 1200,
          lonExtra: 0.05,
          latExtra: 0,
        },
      })
      return
    }

    const lonValue = option.isLocal ? option.lon : option.lon ?? option.lng
    const latValue = option.isLocal ? option.lat : option.lat ?? option.latitude
    const lon = parseFloat(String(lonValue))
    const lat = parseFloat(String(latValue))
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      let z = defaultPointZoom(option)

      const placeRank = option.isLocal ? undefined : Number(option.place_rank)
      if (!option.isLocal && placeRank != null && Number.isFinite(placeRank)) {
        z = zoomFromPlaceOptions(placeRank, {
          importance:
            option.importance != null ? Number(option.importance) : undefined,
          cls: option.class,
          type: option.type,
        })
      }

      flyTo({ options: { center: [lon, lat], zoom: z, duration: 900 } })
    }
  }

  const handleInputValueChange = (nextInputValue: string) => {
    setInputValue(nextInputValue)

    if (!nextInputValue.trim()) {
      resetSearchResults()
    }
  }

  const handleClear = () => {
    resetSearchResults()

    if (isVertical && !inputValue.trim()) {
      setInputValue('')
      setMapMenuState(mapMenuState, false)
      searchInputRef.current?.blur()
      return
    }

    setInputValue('')
    searchInputRef.current?.focus()
  }

  const handleResultSelect = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
    result: MapSearchResult
  ) => {
    const label = getSearchResultLabel(result)
    setInputValue(label)
    handleSelect(event, result)
  }

  return (
    <MapSearchBarSurface
      isVertical={isVertical}
      isActive={isActive}
      isFocused={isFocused}
      isLoading={isLoading}
      inputValue={inputValue}
      searchResults={searchResults}
      placeholder={t('map.search.placeholder')}
      clearButtonAriaLabel={t('map.search.clear_or_close')}
      noResultsLabel={t('components.autocomplete.no_results')}
      onOpen={() => setMapMenuState(mapMenuState, true)}
      onClose={() => setMapMenuState(mapMenuState, false)}
      onFocusChange={setIsFocused}
      onInputValueChange={handleInputValueChange}
      onClear={handleClear}
      onSelect={handleResultSelect}
      inputRef={searchInputRef}
    />
  )
}
