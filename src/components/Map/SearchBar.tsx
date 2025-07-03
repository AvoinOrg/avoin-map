'use client'

import React, { useState } from 'react'
import { Autocomplete, Box, InputAdornment, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { debounce } from 'lodash-es'

import { useTranslate } from '@tolgee/react'
import axios from 'axios'
import { useMapStore } from '#/common/store/mapStore'

export const SearchBar = () => {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [value, setValue] = useState('')
  const [inputValue, setInputValue] = useState('')

  const { t } = useTranslate('avoin-map')
  const flyTo = useMapStore((state) => state._map?.flyTo)

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
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&addressdetails=1&limit=5`
      const res = await axios.get(url, {
        headers: { 'Accept-Language': 'fi' },
      })
      setSearchResults(res.data)
    } catch (e) {
      setSearchResults([])
    }
  }

  const handleSelect = (event: any, option: any) => {
    if (option && flyTo) {
      const { lon, lat } = option
      flyTo({ center: [parseFloat(lon), parseFloat(lat)], zoom: 13 })
    }
  }

  return (
    <Box sx={{ minWidth: 250 }}>
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
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            variant="outlined"
            placeholder={t('map.search.placeholder')}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                  {params.InputProps.endAdornment}
                </InputAdornment>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.place_id || option.display_name}>
            {option.display_name || option.name}
          </li>
        )}
      />
    </Box>
  )
}
