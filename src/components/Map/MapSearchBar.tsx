'use client'

import React, { useState } from 'react'
import { Autocomplete, Box, TextField, Typography } from '@mui/material'
import { debounce } from 'lodash-es'
import { useTranslate } from '@tolgee/react'
import axios from 'axios'
import { useParams } from 'next/navigation'

import { useMapInstanceStore } from '#/common/store/mapStore/mapInstanceStore'
import Search from '#/components/icons/Search'

export const MapSearchBar = () => {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const fetchCounter = React.useRef(0)
  const { locale } = useParams()

  const { t } = useTranslate('avoin-map')
  const map = useMapInstanceStore((state) => state._map)

  const debouncedSearch = React.useMemo(
    () =>
      debounce((query: string) => {
        handleSearch(query)
      }, 300),
    []
  )

  React.useEffect(() => {
    if (inputValue) {
      debouncedSearch(inputValue)
    } else {
      setSearchResults([])
    }
    return () => {
      debouncedSearch.cancel()
    }
  }, [inputValue, debouncedSearch])

  const handleSearch = async (query: string) => {
    if (!query) return
    const currentFetchId = ++fetchCounter.current
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`
      const res = await axios.get(url, {
        headers: { 'Accept-Language': locale || 'en' },
      })
      if (currentFetchId === fetchCounter.current) {
        setSearchResults(res.data)
      }
    } catch (e) {
      if (currentFetchId === fetchCounter.current) {
        setSearchResults([])
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
    <Box sx={{ width: 250 }}>
      <Autocomplete
        freeSolo
        options={searchResults}
        getOptionLabel={(option) =>
          typeof option === 'string'
            ? option
            : option.display_name || option.name || ''
        }
        filterOptions={(x) => x} // disable built-in filtering
        inputValue={inputValue}
        onInputChange={(_e, newInputValue) => setInputValue(newInputValue)}
        value={value}
        onChange={(_e, newValue) => {
          setValue(
            typeof newValue === 'string'
              ? newValue
              : newValue?.display_name || ''
          )
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
