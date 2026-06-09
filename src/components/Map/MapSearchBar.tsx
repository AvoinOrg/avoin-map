'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css, cx } from 'styled-system/css'
import { useTranslate } from '@tolgee/react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import type { BBox, Feature, Geometry } from 'geojson'

import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { useMapStore, useUIStore } from '#/common/store'
import { Box } from '#/components/common/PandaBox'
import { LoadingSpinner } from '#/components/Loading'
import { Cross, Search } from '#/components/icons'
import {
  boundsFromNominatim,
  defaultFeatureDisplayPattern,
  defaultPointZoom,
  getFeatureCenterCoordinates,
  zoomFromPlaceOptions,
} from '#/common/utils/map'
import { MapMenuState } from '#/common/types/state'

const mapMenuState: MapMenuState = 'search'

export const MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH = 40
export const MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH = 300
const SEARCH_DEBOUNCE_MS = 300
const MIN_REMOTE_QUERY_LENGTH = 3
const MAX_LOCAL_RESULTS = 25
const MAX_REMOTE_RESULTS = 5
const MAX_REMOTE_CACHE_SIZE = 50

type LocalSearchIndexEntry = {
  feature: Feature
  searchText: string
  displayNameArr: string[]
  datasetName: string
  appendDatasetName: boolean
  getCoordinates: (feature: Feature) => [number, number] | null
  place_id: string | number
}

type LocalSearchResult = {
  isLocal: true
  lon: number
  lat: number
  bbox: [number, number, number, number] | null
  displayNameArr: string[]
  datasetName: string
  place_id: string | number
}

type RemoteSearchResult = {
  isLocal?: false
  place_id?: string | number
  display_name?: string
  lon?: string | number
  lat?: string | number
  lng?: string | number
  latitude?: string | number
  boundingbox?: [string, string, string, string]
  address?: Record<string, string | undefined>
  name?: string
  place_rank?: number
  importance?: number
  class?: string
  type?: string
}

type SearchResult = LocalSearchResult | RemoteSearchResult

const isFourNumberBbox = (
  bbox: BBox | undefined
): bbox is [number, number, number, number] =>
  Array.isArray(bbox) &&
  bbox.length === 4 &&
  bbox.every((value) => typeof value === 'number')

const isRemoteSearchResult = (
  option: SearchResult
): option is RemoteSearchResult => option.isLocal !== true

const extendBboxFromCoordinates = (
  coordinates: unknown,
  bbox: [number, number, number, number]
) => {
  if (!Array.isArray(coordinates)) {
    return
  }

  const [x, y] = coordinates
  if (typeof x === 'number' && typeof y === 'number') {
    bbox[0] = Math.min(bbox[0], x)
    bbox[1] = Math.min(bbox[1], y)
    bbox[2] = Math.max(bbox[2], x)
    bbox[3] = Math.max(bbox[3], y)
    return
  }

  coordinates.forEach((child) => {
    extendBboxFromCoordinates(child, bbox)
  })
}

const extendBboxFromGeometry = (
  geometry: Geometry,
  bbox: [number, number, number, number]
) => {
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach((childGeometry) => {
      extendBboxFromGeometry(childGeometry, bbox)
    })
    return
  }

  extendBboxFromCoordinates(geometry.coordinates, bbox)
}

const getFeatureBbox = (
  feature: Feature
): [number, number, number, number] | null => {
  if (isFourNumberBbox(feature.bbox)) {
    return feature.bbox
  }

  if (!feature.geometry) {
    return null
  }

  const bbox: [number, number, number, number] = [
    Infinity,
    Infinity,
    -Infinity,
    -Infinity,
  ]
  extendBboxFromGeometry(feature.geometry, bbox)

  return bbox.every(Number.isFinite) ? bbox : null
}

export const MapSearchBar = ({ isVertical }: { isVertical: boolean }) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const fetchCounter = React.useRef(0)
  const remoteCacheRef = useRef<Map<string, RemoteSearchResult[]>>(new Map())
  const remoteRequestRef = useRef<AbortController | null>(null)
  const { locale } = useParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const activeMapMenu = useUIStore((state) => state.activeMapMenu)
  const setMapMenuState = useUIStore((state) => state.setMapMenuState)

  const { t } = useTranslate('avoin-map')
  const map = useMapInstanceStore((state) => state._map)
  const searchableDatas = useMapStore((state) => state.searchableDatas)
  const searchCountryCodes = useUIStore((state) => state.searchCountryCodes)
  const fitBounds = useMapStore((state) => state.fitBounds)
  const flyTo = useMapStore((state) => state.flyTo)

  const isActive = useMemo(() => {
    return activeMapMenu === mapMenuState
  }, [activeMapMenu])

  useEffect(() => {
    if (isActive && isVertical) {
      searchInputRef.current?.focus()
    }
  }, [isActive, isVertical])

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
        const properties = feature.properties
        if (!properties) return

        const values = (
          fields && fields.length > 0
            ? fields.map((field) => properties[field])
            : Object.values(properties)
        ).filter((value) => value != null && value !== '')

        if (values.length === 0) return

        const searchText = values
          .map((value) => String(value).toLowerCase())
          .join(' ')
        const displayNameArr = displayPattern(feature, fields)

        const propertyId = properties.id

        entries.push({
          feature,
          searchText,
          displayNameArr,
          datasetName,
          appendDatasetName,
          getCoordinates,
          place_id:
            feature.id ||
            (typeof propertyId === 'string' || typeof propertyId === 'number'
              ? propertyId
              : undefined) ||
            `${datasetName}-${displayNameArr.join('-')}`,
        })
      })
    })

    return entries
  }, [enabledSearchableDatas])

  const performLocalSearch = useCallback(
    (query: string) => {
      if (!query) return []
      const lowerCaseQuery = query.toLowerCase()
      const localResults: LocalSearchResult[] = []

      for (const entry of localSearchIndex) {
        if (!entry.searchText.includes(lowerCaseQuery)) {
          continue
        }

        const coords = entry.getCoordinates(entry.feature)
        if (!coords) {
          continue
        }

        const bbox = getFeatureBbox(entry.feature)

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
        setIsLoading(false)
        return
      }
      const currentFetchId = ++fetchCounter.current

      const localResults = performLocalSearch(query)

      if (currentFetchId === fetchCounter.current) {
        setSearchResults(localResults)
      }

      if (query.length < MIN_REMOTE_QUERY_LENGTH) {
        if (currentFetchId === fetchCounter.current) {
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
        const res = await axios.get<RemoteSearchResult[]>(url, {
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
    [locale, performLocalSearch, searchCountryCodes]
  )

  useEffect(() => {
    const query = inputValue.trim()

    if (!query) {
      remoteRequestRef.current?.abort()
      const clearSearchTimeout = window.setTimeout(() => {
        setSearchResults([])
        setIsLoading(false)
      }, 0)

      return () => {
        window.clearTimeout(clearSearchTimeout)
      }
    }

    const searchTimeout = window.setTimeout(() => {
      void handleSearch(query)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(searchTimeout)
    }
  }, [inputValue, handleSearch])

  const handleSelect = (option: SearchResult) => {
    if (!option || !map) return

    // try to build a bbox
    let bbox: [number, number, number, number] | null = null

    if (option.isLocal) {
      bbox = option.bbox || null
    } else if (isRemoteSearchResult(option)) {
      bbox = boundsFromNominatim(option)
    }

    if (bbox) {
      // Use your store fitBounds (handles sidebar padding)
      // Small extras are fine horizontally; keep latExtra 0 to avoid Mercator bias
      fitBounds({
        bbox: [bbox[2], bbox[0], bbox[3], bbox[1]],
        options: {
          // your order: [lonMax, lonMin, latMax, latMin]
          duration: 1200,
          lonExtra: 0.05,
          latExtra: 0, // keep 0; rely on padding for vertical margin
        },
      })
      return
    }

    // point fallback
    const lon = option.isLocal
      ? option.lon
      : Number.parseFloat(String(option.lon ?? option.lng ?? ''))
    const lat = option.isLocal
      ? option.lat
      : Number.parseFloat(String(option.lat ?? option.latitude ?? ''))
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      let z = defaultPointZoom(option)

      if (isRemoteSearchResult(option) && option.place_rank != null) {
        z = zoomFromPlaceOptions(option.place_rank, {
          importance: option.importance,
          cls: option.class,
          type: option.type,
        })
      }

      flyTo({ options: { center: [lon, lat], zoom: z, duration: 900 } })
    }
  }

  const getOptionLabel = (option: SearchResult | string) => {
    if (typeof option === 'string') return option
    if (option.isLocal) {
      return option.displayNameArr.join(' - ') || ''
    }
    return option.display_name || ''
  }

  const selectOption = (option: SearchResult) => {
    const nextValue = getOptionLabel(option)
    setInputValue(nextValue)
    setHighlightedIndex(-1)
    handleSelect(option)
  }

  const expanded = !isVertical || isActive
  const showPopup = expanded && searchResults.length > 0 && isFocused

  const handleInputBlur = () => {
    setIsFocused(false)
    setTimeout(() => {
      if (
        isVertical &&
        !inputValue &&
        !popupRef.current?.contains(document.activeElement)
      ) {
        setMapMenuState(mapMenuState, false)
      }
    }, 200)
  }

  const clearOrClose = () => {
    if (isVertical && !inputValue.trim()) {
      setInputValue('')
      setSearchResults([])
      setMapMenuState(mapMenuState, false)
      searchInputRef.current?.blur()
      return
    }

    setInputValue('')
    setSearchResults([])
    setHighlightedIndex(-1)
    searchInputRef.current?.focus()
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightedIndex((current) =>
        searchResults.length === 0
          ? -1
          : Math.min(current + 1, searchResults.length - 1)
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightedIndex((current) =>
        searchResults.length === 0 ? -1 : Math.max(current - 1, 0)
      )
      return
    }

    if (event.key === 'Enter' && highlightedIndex >= 0) {
      event.preventDefault()
      selectOption(searchResults[highlightedIndex])
      return
    }

    if (event.key === 'Escape') {
      if (isVertical && !inputValue.trim()) {
        setMapMenuState(mapMenuState, false)
      }
      setHighlightedIndex(-1)
    }
  }

  const renderOptionContent = (option: SearchResult) => {
    if (option.isLocal) {
      const [mainText, ...otherParts] = option.displayNameArr
      const secondaryText = otherParts.join(' - ')

      return (
        <span>
          <span className={css({ display: 'block', textStyle: 'body1' })}>
            {mainText}
          </span>
          <span
            className={css({
              display: 'block',
              textStyle: 'body2',
              color: 'neutral.dark',
            })}
          >
            {secondaryText}
          </span>
        </span>
      )
    }

    const { address, name } = option
    const addressParts = [
      address?.road,
      address?.neighbourhood,
      address?.suburb,
      address?.city_district,
      address?.city,
      address?.state,
      address?.country,
    ].filter(Boolean)
    const uniqueAddressParts = [...new Set(addressParts)]
    const nameIndex = uniqueAddressParts.indexOf(name)

    if (nameIndex > -1) {
      uniqueAddressParts.splice(nameIndex, 1)
    }

    return (
      <span>
        <span className={css({ display: 'block', textStyle: 'body1' })}>
          {name}
        </span>
        <span
          className={css({
            display: 'block',
            textStyle: 'body2',
            color: 'neutral.dark',
          })}
        >
          {uniqueAddressParts.join(', ')}
        </span>
      </span>
    )
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width:
          isVertical && !isActive
            ? MAP_SEARCH_BAR_VERTICAL_MODE_WIDTH
            : MAP_SEARCH_BAR_HORIZONTAL_MODE_WIDTH,
        height: '40px',
        // transition: `width ${isActive ? '0.2s' : '0.2s'} ease-in-out`,
        zIndex: isFocused ? 'calc(var(--z-index-drawer) + 5)' : 'auto',
        right: 0,
        backgroundColor: 'neutral.light',
        marginLeft: 'auto',
        borderRadius: '0.3125rem',
        pointerEvents: 'auto',
        overflow: expanded ? 'visible' : 'hidden',
        '&:hover': {
          opacity: 1,
        },
      }}
    >
      {expanded && (
        <Box
          sx={{
            width: '300px',
            ...(isVertical && {
              position: 'absolute',
              top: 0,
              right: 0,
            }),
          }}
        >
          <Box
            sx={{
              width: '300px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              px: '0.5rem',
              backgroundColor: 'neutral.light',
              opacity: 0.9,
              borderRadius: '0.3125rem',
              boxSizing: 'border-box',
            }}
          >
            <Box
              component="span"
              sx={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'neutral.dark',
                flexShrink: 0,
              }}
            >
              {isLoading ? (
                <LoadingSpinner size="18px" sx={{ color: 'neutral.dark' }} />
              ) : (
                <Search sx={{ width: '24px', height: '24px' }} />
              )}
            </Box>
            <input
              ref={searchInputRef}
              aria-label={t('map.search.placeholder')}
              placeholder={t('map.search.placeholder')}
              value={inputValue}
              onFocus={() => setIsFocused(true)}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              onChange={(event) => {
                setInputValue(event.target.value)
                setHighlightedIndex(-1)
              }}
              className={css({
                flex: 1,
                minWidth: 0,
                height: '100%',
                border: 0,
                outline: 0,
                backgroundColor: 'transparent',
                color: 'neutral.darker',
                textStyle: 'body2',
                '&::placeholder': {
                  color: 'neutral.dark',
                  opacity: 1,
                },
              })}
            />
            <BaseButton
              type="button"
              aria-label={inputValue.trim() ? 'Clear search' : 'Close search'}
              onMouseDown={(event) => {
                event.preventDefault()
              }}
              onClick={clearOrClose}
              className={css({
                width: '1.75rem',
                height: '1.75rem',
                border: 0,
                borderRadius: '50%',
                p: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                color: 'neutral.dark',
                cursor: 'pointer',
                opacity: inputValue.trim() || isVertical ? 1 : 0,
                pointerEvents: inputValue.trim() || isVertical ? 'auto' : 'none',
                '&:hover': {
                  backgroundColor: 'neutral.main',
                },
                '&:focus-visible': {
                  outline: '2px solid var(--colors-secondary-dark)',
                  outlineOffset: '2px',
                },
              })}
            >
              <Cross sx={{ width: '0.75rem', height: '0.75rem' }} />
            </BaseButton>
          </Box>
          {showPopup && (
            <Box
              ref={popupRef}
              role="listbox"
              sx={{
                position: 'absolute',
                top: '40px',
                left: 0,
                right: 0,
                zIndex: 'calc(var(--z-index-drawer) + 4)',
                mt: '-0.3125rem',
                borderRadius: '0 0 0.3125rem 0.3125rem',
                backgroundColor: 'neutral.light',
                opacity: isVertical ? 1 : 0.9,
                boxShadow: '0 8px 20px rgba(17, 17, 17, 0.16)',
                overflow: 'hidden',
              }}
            >
              {searchResults.map((option, index) => (
                <BaseButton
                  key={
                    option.place_id ||
                    (isRemoteSearchResult(option)
                      ? option.display_name
                      : undefined) ||
                    index
                  }
                  type="button"
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onMouseDown={(event) => {
                    event.preventDefault()
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectOption(option)}
                  className={cx(
                    css({
                      width: '100%',
                      border: 0,
                      p: '0.625rem 0.75rem',
                      display: 'block',
                      backgroundColor:
                        highlightedIndex === index
                          ? 'neutral.main'
                          : 'transparent',
                      color: 'neutral.darker',
                      textAlign: 'left',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'neutral.main',
                      },
                      '&:focus-visible': {
                        outline: '2px solid var(--colors-secondary-dark)',
                        outlineOffset: '-2px',
                      },
                    })
                  )}
                >
                  {renderOptionContent(option)}
                </BaseButton>
              ))}
            </Box>
          )}
        </Box>
      )}
      {isVertical && !isActive && (
        <BaseButton
          type="button"
          onClick={() => setMapMenuState(mapMenuState, true)}
          aria-label="Open search"
          className={css({
            backgroundColor: 'transparent',
            width: '40px',
            height: '40px',
            border: 0,
            p: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 0,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'var(--colors-neutral-main)',
            },
            '&:focus-visible': {
              outline: '2px solid var(--colors-secondary-dark)',
              outlineOffset: '2px',
            },
          })}
        >
          <Search sx={{ color: 'neutral.dark' }} />
        </BaseButton>
      )}
    </Box>
  )
}
