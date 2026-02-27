'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  Autocomplete,
  Box,
  Collapse,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { debounce } from 'lodash-es'
import { useTranslate } from '@tolgee/react'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { bbox as turfBBox } from '@turf/turf'

import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { useMapStore, useUIStore } from '#/common/store'
import Search from '#/components/icons/Search'
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
  feature: any
  searchText: string
  displayNameArr: string[]
  datasetName: string
  appendDatasetName: boolean
  getCoordinates: (feature: any) => [number, number] | null
  place_id: string
}

export const MapSearchBar = ({ isVertical }: { isVertical: boolean }) => {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fetchCounter = React.useRef(0)
  const remoteCacheRef = useRef<Map<string, any[]>>(new Map())
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

        entries.push({
          feature,
          searchText,
          displayNameArr,
          datasetName,
          appendDatasetName,
          getCoordinates,
          place_id:
            feature.id ||
            feature.properties?.id ||
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
      const localResults: any[] = []

      for (const entry of localSearchIndex) {
        if (!entry.searchText.includes(lowerCaseQuery)) {
          continue
        }

        const coords = entry.getCoordinates(entry.feature)
        if (!coords) {
          continue
        }

        const bbox = (entry.feature as any).bbox
          ? ((entry.feature as any).bbox as [number, number, number, number])
          : entry.feature.geometry
            ? (turfBBox(entry.feature as any) as [
                number,
                number,
                number,
                number,
              ])
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
        const res = await axios.get(url, {
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
      } catch (e) {
        if (controller.signal.aborted) return
        if (currentFetchId === fetchCounter.current) {
          setSearchResults(localResults)
          setIsLoading(false)
        }
      }
    },
    [locale, performLocalSearch, searchCountryCodes]
  )

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        handleSearch(query)
      }, SEARCH_DEBOUNCE_MS),
    [handleSearch]
  )

  useEffect(() => {
    const query = inputValue.trim()
    if (query) {
      debouncedSearch(query)
    } else {
      setSearchResults([])
      setIsLoading(false)
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [inputValue, debouncedSearch])

  const handleSelect = (_event: any, option: any) => {
    if (!option || !map) return

    // try to build a bbox
    let bbox: [number, number, number, number] | null = null

    if (option.isLocal) {
      bbox = option.bbox || null
    } else {
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
    const lon = parseFloat(option.lon ?? option.lon ?? option.lng)
    const lat = parseFloat(option.lat ?? option.latitude)
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      let z = defaultPointZoom(option)

      if (option.place_rank != null) {
        z = zoomFromPlaceOptions(option.place_rank, {
          importance: option.importance,
          cls: option.class,
          type: option.type,
        })
      }

      flyTo({ options: { center: [lon, lat], zoom: z, duration: 900 } })
    }
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
        zIndex: isFocused ? (theme) => theme.zIndex.drawer + 5 : 'auto',
        right: 0,
        backgroundColor: 'neutral.light',
        marginLeft: 'auto',
        borderRadius: '0.3125rem',
        pointerEvents: 'auto',
        overflow: 'hidden',
        '&:hover': {
          opacity: 1,
        },
      }}
    >
      <Collapse
        in={!isVertical || isActive}
        orientation="horizontal"
        sx={{
          width: '300px',
          ...(isVertical && {
            position: 'absolute',
            top: 0,
            right: 0,
          }),
        }}
        timeout={{ appear: 0, enter: 0, exit: 0 }}
        easing={{
          enter: 'ease-in-out',
          exit: 'ease-in-out',
        }}
      >
        <Autocomplete
          sx={{ width: '300px' }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false)
            // Add a small delay to allow click on options before collapsing
            setTimeout(() => {
              if (
                isVertical &&
                !inputValue &&
                !document.activeElement?.closest('.MuiAutocomplete-popper')
              ) {
                setMapMenuState(mapMenuState, false)
              }
            }, 200)
          }}
          freeSolo
          options={searchResults}
          getOptionLabel={(option) => {
            if (typeof option === 'string') return option
            if (option.isLocal) {
              return option.displayNameArr.join(' - ') || ''
            }
            return option.display_name || ''
          }}
          filterOptions={(x) => x} // disable built-in filtering
          inputValue={inputValue}
          onInputChange={(_e, newInputValue) => setInputValue(newInputValue)}
          value={value}
          onChange={(_e, newValue) => {
            if (typeof newValue === 'object' && newValue !== null) {
              if (newValue.isLocal) {
                setValue(newValue.displayNameArr.join(' - ') || '')
              } else {
                setValue(newValue.display_name || '')
              }
            } else {
              setValue(newValue || '')
            }
            handleSelect(_e, newValue)
          }}
          slotProps={{
            paper: {
              sx: {
                opacity: isVertical ? 1 : 0.9,
                mt: '-0.3125rem',
                borderRadius: '0.3125rem',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                backgroundColor: 'neutral.light',
              },
            },
            popper: {
              sx: (theme) => ({
                zIndex: theme.zIndex.drawer + 4,
              }),
            },
            clearIndicator: {
              // If the input is already empty, treat the clear button as "close" in vertical mode.
              // Use capture so we don't override MUI's built-in clear handler when there's text.
              onMouseDownCapture: (e: React.MouseEvent<HTMLElement>) => {
                if (isVertical && !inputValue.trim()) {
                  e.preventDefault()
                  e.stopPropagation()
                  setValue('')
                  setInputValue('')
                  setSearchResults([])
                  setMapMenuState(mapMenuState, false)
                  searchInputRef.current?.blur()
                }
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              aria-label={t('map.search.placeholder')}
              inputRef={searchInputRef}
              size="small"
              variant="outlined"
              placeholder={t('map.search.placeholder')}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'neutral.light',
                  typography: 'body2',
                  opacity: 0.9,
                  borderRadius: '0.3125rem',
                  height: '40px',
                  '&.Mui-focused': {
                    boxShadow: 'none',
                  },
                  '& fieldset': {
                    border: 'none',
                  },
                },
              }}
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      {params.InputProps.startAdornment}
                      {isLoading ? (
                        <Box
                          sx={{
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CircularProgress
                            size={18}
                            sx={{
                              color: 'action.active',
                            }}
                          />
                        </Box>
                      ) : (
                        <Search
                          sx={{
                            color: 'action.active',
                            width: '24px',
                            height: '24px',
                          }}
                        />
                      )}
                    </>
                  ),
                },
              }}
            />
          )}
          renderOption={(props, option) => {
            if (option.isLocal) {
              const [mainText, ...otherParts] = option.displayNameArr
              const secondaryText = otherParts.join(' - ')
              return (
                <Box component="li" {...props} key={option.place_id}>
                  <div>
                    <Typography variant="body1">{mainText}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {secondaryText}
                    </Typography>
                  </div>
                </Box>
              )
            }

            // Nominatim result rendering
            const { address, name } = option
            const addressParts = [
              address.road,
              address.neighbourhood,
              address.suburb,
              address.city_district,
              address.city,
              address.state,
              address.country,
            ].filter(Boolean)

            // Create a set to keep unique parts, then convert back to array
            const uniqueAddressParts = [...new Set(addressParts)]

            // Remove the main name from address parts if it's present to avoid duplication
            const nameIndex = uniqueAddressParts.indexOf(name)
            if (nameIndex > -1) {
              uniqueAddressParts.splice(nameIndex, 1)
            }

            return (
              <Box
                component="li"
                {...props}
                key={option.place_id || option.display_name}
              >
                <div>
                  <Typography variant="body1">{name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {uniqueAddressParts.join(', ')}
                  </Typography>
                </div>
              </Box>
            )
          }}
        />
      </Collapse>
      {isVertical && !isActive && (
        <IconButton
          onClick={() => setMapMenuState(mapMenuState, true)}
          aria-label="Open search"
          sx={{
            backgroundColor: 'transparent',
            width: '40px',
            height: '40px',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'neutral.main',
            },
          }}
        >
          <Search sx={{ color: 'action.active' }} />
        </IconButton>
      )}
    </Box>
  )
}
