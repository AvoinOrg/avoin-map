'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import { debounce } from 'lodash-es'
import { useTranslate } from '@tolgee/react'
import axios from 'axios'
import { useParams } from 'next/navigation'

import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import { useMapStore } from '#/common/store'
import Search from '#/components/icons/Search'
import {
  defaultFeatureDisplayPattern,
  getFeatureCenterCoordinates,
} from '#/common/utils/map'

export const MapSearchBar = () => {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const fetchCounter = React.useRef(0)
  const { locale } = useParams()

  const { t } = useTranslate('avoin-map')
  const map = useMapInstanceStore((state) => state._map)
  const searchableDatas = useMapStore((state) => state.searchableDatas)

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

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        handleSearch(query)
      }, 300),
    [enabledSearchableDatas]
  )

  useEffect(() => {
    if (inputValue) {
      debouncedSearch(inputValue)
    } else {
      setSearchResults([])
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [inputValue, debouncedSearch])

  const performLocalSearch = (query: string) => {
    if (!query || !enabledSearchableDatas) return []
    const lowerCaseQuery = query.toLowerCase()
    const localResults: any[] = []

    Object.values(enabledSearchableDatas).forEach((source) => {
      const {
        data,
        name: datasetName,
        fields,
        appendDatasetName = true,
        getCoordinates = getFeatureCenterCoordinates,
        displayPattern = defaultFeatureDisplayPattern,
      } = source
      if (data?.features) {
        data.features.forEach((feature) => {
          const properties = feature.properties
          if (!properties) return

          const isMatch = fields
            ? fields.some(
                (field) =>
                  properties[field] &&
                  String(properties[field])
                    .toLowerCase()
                    .includes(lowerCaseQuery)
              )
            : Object.values(properties).some(
                (value) =>
                  value && String(value).toLowerCase().includes(lowerCaseQuery)
              )

          if (isMatch) {
            const coords = getCoordinates(feature)
            const displayNameArr = displayPattern(feature, fields)
            if (appendDatasetName) {
              displayNameArr.push(`(${datasetName})`)
            }

            if (coords) {
              localResults.push({
                // ...feature,
                isLocal: true,
                lon: coords[0],
                lat: coords[1],
                displayNameArr: displayNameArr,
                datasetName: datasetName,
                place_id:
                  feature.id ||
                  feature.properties?.id ||
                  `${datasetName}-${displayNameArr.join('-')}`,
              })
            }
          }
        })
      }
    })
    return localResults
  }

  const handleSearch = async (query: string) => {
    if (!query) return
    const currentFetchId = ++fetchCounter.current

    const localResults = performLocalSearch(query)

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`
      const res = await axios.get(url, {
        headers: { 'Accept-Language': locale || 'en' },
      })
      if (currentFetchId === fetchCounter.current) {
        setSearchResults([...localResults, ...res.data])
      }
    } catch (e) {
      if (currentFetchId === fetchCounter.current) {
        setSearchResults(localResults)
      }
    }
  }

  const handleSelect = (event: any, option: any) => {
    if (option && map) {
      const { lon, lat } = option
      map.flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 13 })
    }
  }

  return (
    <Box sx={{ width: '300px', maxWidth: '300px' }}>
      <Autocomplete
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
              opacity: 0.9,
              mt: '-0.3125rem',
              borderRadius: '0.3125rem',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              backgroundColor: 'neutral.light',
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
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
                    <Search sx={{ color: 'action.active' }} />
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
    </Box>
  )
}
