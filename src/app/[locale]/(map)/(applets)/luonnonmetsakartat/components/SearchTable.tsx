'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslate } from '@tolgee/react'
import Fuse from 'fuse.js'
import { debounce } from 'lodash-es'
import { FixedSizeList, ListChildComponentProps } from 'react-window'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'
import { SortKey } from '#/common/types/general'
import { Search, Ascending, Descending } from '#/components/icons'
import { SelectionSource } from '#/common/types/map'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'

import { FolayerFeature, FolayerFeatureProperties } from '../common/types'
import { useMapStore } from '#/common/store'
import useSelectedFeaturesFilteredBySource from '#/common/hooks/map/useSelectedFeaturesFilteredBySource'

type FixedSizeListProps = {
  height: number
  itemCount: number
  itemSize: number
  width: string | number
  children: (props: ListChildComponentProps) => React.ReactNode
}

const TypedFixedSizeList =
  FixedSizeList as unknown as React.ComponentType<FixedSizeListProps>

interface Props {
  data: FolayerFeature[] | undefined
  keysToSearch: string[]
  source: SelectionSource
  sortKeys?: SortKey[]
  searchPlaceholder?: string
  styleProps?: PandaStyleProp
}

const columns: ColumnDef<FolayerFeature>[] = [
  {
    accessorFn: (row) => row.properties.name,
    id: 'name',
    cell: (info) => info.getValue(),
    header: () => 'Name',
  },
]

const getSortableProperty = (
  feature: FolayerFeature,
  key: string
): string => {
  const value = feature.properties[key as keyof FolayerFeatureProperties]
  return String(value ?? '').toLowerCase()
}

const SearchTable = ({
  data = [],
  keysToSearch,
  searchPlaceholder,
  source,
  sortKeys = [],
  styleProps,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const addSelectedFeaturesByIds = useMapStore(
    (state) => state.addSelectedFeaturesByIds
  )
  const removeSelectedFeaturesByIds = useMapStore(
    (state) => state.removeSelectedFeaturesByIds
  )
  const flyTo = useMapStore((state) => state.flyTo)
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
      const keyA = getSortableProperty(a, sortKey.key)
      const keyB = getSortableProperty(b, sortKey.key)
      if (keyA < keyB) return isAscending ? -1 : 1
      if (keyA > keyB) return isAscending ? 1 : -1
      return 0
    })
  }, [debouncedSearchTerm, fuse, isAscending, sortKey, data])

  const allSortKeys = React.useMemo(
    () => [relevancySortKey, ...sortKeys],
    [sortKeys]
  )

  const handleSortKeyChange = (event: FormSelectionEvent<string>) => {
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
      if ('coordinates' in feature.geometry) {
        flyTo({
          options: {
            center: {
              lng: feature.geometry.coordinates[0] as number,
              lat: feature.geometry.coordinates[1] as number,
            },
            zoom: 12,
          },
        })
      }
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
        styleProps={{
          display: 'flex',
          alignItems: 'center', // Center text vertically
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': { backgroundColor: 'action.hover' },
          typography: 'body7',
        }}
        style={style as React.CSSProperties}
      >
        {row.getVisibleCells().map((cell) => (
          <Box
            key={cell.id}
            onClick={() => handleClick(cell.row.original)}
            styleProps={{
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
    <Box styleProps={[...(Array.isArray(styleProps) ? styleProps : [styleProps])]}>
      {/* sorting button */}
      <Box
        styleProps={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          mb: 1,
        }}
      >
        <DropDownSelectMinimal
          value={sortKey.key}
          onChange={handleSortKeyChange}
          ariaLabel={t('components.search_table.sort_field_aria_label')}
          options={allSortKeys.map((key) => ({
            value: key.key,
            label: key.label,
          }))}
          styleProps={{
            typography: 'body7',
            textAlign: 'right',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          iconSx={{ display: 'none' }}
          optionSx={{ textAlign: 'right', typography: 'body7', fontWeight: 500 }}
        />
        <Box
          component="button"
          type="button"
          aria-label={
            isAscending
              ? t('components.search_table.sort_direction_ascending_aria_label')
              : t(
                  'components.search_table.sort_direction_descending_aria_label'
                )
          }
          styleProps={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            ml: 1,
            p: 0,
            border: 0,
            backgroundColor: 'transparent',
            color: 'inherit',
            borderRadius: '0.125rem',
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'secondary.main',
              outlineOffset: '2px',
            },
          }}
          onClick={toggleSortOrder}
        >
          {isAscending ? (
            <Ascending styleProps={{ height: 18 }} />
          ) : (
            <Descending styleProps={{ height: 18 }} />
          )}
        </Box>
      </Box>
      {/* Search input */}
      <Box
        styleProps={{
          display: 'flex',
          alignItems: 'center',
          mb: 1,
          backgroundColor: 'background.paper',
        }}
      >
        <Box
          component="label"
          styleProps={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            borderBottom: '1px solid',
            borderColor: 'neutral.main',
            typography: 'body2',
          }}
        >
          <Search styleProps={{ mr: 1, height: 20, color: 'neutral.dark' }} />
          <Box
            component="input"
            type="search"
            aria-label={searchPlaceholder || t('components.search_table.search')}
          placeholder={searchPlaceholder || t('components.search_table.search')}
            value={searchTerm}
            onChange={handleSearchChange}
            styleProps={{
              width: '100%',
              minWidth: 0,
              border: 0,
              outline: 0,
              backgroundColor: 'transparent',
              color: 'inherit',
              p: 0,
              py: 0.5,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              '&::placeholder': {
                color: 'neutral.dark',
                opacity: 1,
                fontFamily: 'var(--font-arimo)',
                fontSize: '0.875rem',
                fontWeight: 400,
                lineHeight: 'normal',
                letterSpacing: '0.0875rem',
              },
              '&:focus-visible': {
                outline: 'none',
              },
            }}
          />
        </Box>
      </Box>

      {/* Separate Box for the scrollable, virtualized rows */}
      <Box
        styleProps={{
          width: '100%',
          overflow: 'auto',
          borderRadius: 1,
        }}
      >
        <TypedFixedSizeList
          height={listHeight}
          itemCount={table.getRowModel().rows.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </TypedFixedSizeList>
      </Box>
    </Box>
  )
}

export default SearchTable
