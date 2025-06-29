'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Box,
  TextField,
  Theme,
  SxProps,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import { useTranslate } from '@tolgee/react'
import Fuse from 'fuse.js'
import { debounce } from 'lodash-es'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

import { SortKey } from '#/common/types/general'
import { Search, Ascending, Descending } from '#/components/icons'
import { SelectionSource } from '#/common/types/map'

import { FolayerFeature, FolayerFeatureProperties } from '../common/types'
import { useMapStore } from '#/common/store'
import useSelectedFeaturesFilteredBySource from '#/common/hooks/map/useSelectedFeaturesFilteredBySource'

interface Props {
  data: FolayerFeature[] | undefined
  keysToSearch: string[]
  source: SelectionSource
  sortKeys?: SortKey[]
  searchPlaceholder?: string
  sx?: SxProps<Theme>
}

const columns: ColumnDef<FolayerFeature>[] = [
  {
    accessorFn: (row) => row.properties.name,
    id: 'name',
    cell: (info) => info.getValue(),
    header: () => 'Name',
  },
]

const SearchTable = ({
  data = [],
  keysToSearch,
  searchPlaceholder,
  source,
  sortKeys = [],
  sx,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const addSelectedFeaturesByIds = useMapStore(
    (state) => state.addSelectedFeaturesByIds
  )
  const removeSelectedFeaturesByIds = useMapStore(
    (state) => state.removeSelectedFeaturesByIds
  )
  const selectedFeatures = useSelectedFeaturesFilteredBySource([source])

  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('')
  const [isAscending, setIsAscending] = React.useState(false)

  const relevancySortKey: SortKey = {
    key: 'relevancy',
    label: t('components.search_table.sort_relevancy'),
  }
  const [sortKey, setSortKey] = React.useState<SortKey>(relevancySortKey)

  // Debounce the search term update
  const debouncedSetSearchTerm = React.useMemo(
    () => debounce((value: string) => setDebouncedSearchTerm(value), 300),
    []
  )

  React.useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel()
    }
  }, [debouncedSetSearchTerm])

  // Initialize Fuse.js for fuzzy searching
  const fuse = React.useMemo(
    () =>
      new Fuse(data, {
        keys: keysToSearch,
        threshold: 0.3,
      }),
    [data, keysToSearch]
  )

  // Filter data using Fuse.js
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []

    let result = data
    if (debouncedSearchTerm) {
      result = fuse.search(debouncedSearchTerm).map((result) => result.item)
    }

    if (!sortKey) {
      return result
    }
    if (sortKey.key === relevancySortKey.key) {
      if (isAscending) {
        return [...result].reverse()
      }
      return result
    }

    return [...result].sort((a, b) => {
      // @ts-ignore
      const keyA = a.properties[sortKey.key].toLowerCase()
      // @ts-ignore
      const keyB = b.properties[sortKey.key].toLowerCase()
      if (keyA < keyB) return isAscending ? -1 : 1
      if (keyA > keyB) return isAscending ? 1 : -1
      return 0
    })
  }, [debouncedSearchTerm, fuse, isAscending, sortKey, data])

  const allSortKeys = React.useMemo(
    () => [relevancySortKey, ...sortKeys],
    [sortKeys]
  )

  const handleSortKeyChange = (event: SelectChangeEvent<string>) => {
    const selectedKey = allSortKeys.find(
      (key) => key.key === event.target.value
    )
    if (selectedKey) {
      setSortKey(selectedKey)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    debouncedSetSearchTerm(e.target.value)
  }

  const toggleSortOrder = () => {
    setIsAscending((prev) => !prev)
  }

  const handleClick = (feature: FolayerFeature) => {
    console.log('Clicked on feature with properties:', feature.properties)
    const isSelected = selectedFeatures.some(
      (f) => f.properties && f.properties.id === feature.properties.id
    )

    if (isSelected) {
      removeSelectedFeaturesByIds({
        featureIds: [feature.properties.id],
        idField: 'id',
        source: source,
      })
    } else {
      addSelectedFeaturesByIds({
        featureIds: [feature.properties.id],
        idField: 'id',
        source: source,
        removeOtherFeatures: true,
      })
    }
  }

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const rowHeight = 50 // Height of each row
  const maxHeight = 400 // Maximum height of the list
  const listHeight = Math.min(
    table.getRowModel().rows.length * rowHeight,
    maxHeight
  )

  if (!data || data.length === 0) {
    return null
  }

  // Render each item as a Box that *looks* like a table row
  // without nesting <div> under actual table elements.
  const Row = ({ index, style }: ListChildComponentProps) => {
    const row = table.getRowModel().rows[index]

    const isSelected = selectedFeatures.some(
      (f) => f.properties?.id === row.original.properties.id
    )
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center', // Center text vertically
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { backgroundColor: 'action.hover' },
          typography: 'body7',
        }}
        style={style}
      >
        {row.getVisibleCells().map((cell) => (
          <Box
            key={cell.id}
            onClick={() => handleClick(cell.row.original)}
            sx={{
              flex: 1,
              p: 1,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              '&': { cursor: 'pointer' },
              backgroundColor: isSelected ? 'action.selected' : 'transparent',
              '&:hover': {
                backgroundColor: isSelected
                  ? 'action.selected'
                  : 'action.hover',
              },
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Box sx={[...(Array.isArray(sx) ? sx : [sx])]}>
      {/* sorting button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Select
          value={sortKey.key}
          onChange={handleSortKeyChange}
          variant="standard"
          disableUnderline
          sx={{
            typography: 'body7',
            textAlign: 'right',
            '& .MuiSelect-icon': {
              display: 'none', // Hides the triangle (caret)
            },
            '& .MuiSelect-select': {
              padding: '0 !important',
              paddingRight: '0 !important',
              minWidth: '0 !important',
            },
            '& .MuiInputBase-input': {
              padding: '0 !important',
            },
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {allSortKeys.map((key) => (
            <MenuItem
              sx={{
                textAlign: 'right',
                typography: 'body7',
                fontWeight: 500,
              }}
              key={key.key}
              value={key.key}
            >
              {key.label}
            </MenuItem>
          ))}
        </Select>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            ml: 1,
          }}
          onClick={toggleSortOrder}
        >
          {isAscending ? (
            <Ascending sx={{ height: 18 }} />
          ) : (
            <Descending sx={{ height: 18 }} />
          )}
        </Box>
      </Box>
      {/* Search input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1,
          backgroundColor: 'background.paper',
        }}
      >
        <TextField
          placeholder={searchPlaceholder || t('components.search_table.search')}
          variant="standard" // Use the standard variant for the underline style
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ typography: 'body2', fontSize: '30px' }}
          slotProps={{
            input: {
              sx: {
                typography: 'body2',
              },
              startAdornment: (
                <Search sx={{ mr: 1, height: 20, color: 'neutral.dark' }} />
              ),
            },
          }}
        />
      </Box>

      {/* Separate Box for the scrollable, virtualized rows */}
      <Box
        sx={{
          width: '100%',
          overflow: 'auto',
          borderRadius: 1,
        }}
      >
        <FixedSizeList
          height={listHeight}
          itemCount={table.getRowModel().rows.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </FixedSizeList>
      </Box>
    </Box>
  )
}

export default SearchTable
