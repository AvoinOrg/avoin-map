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

import {
  Box,
  type AppSystemStyleObject,
  toSxArray,
} from '#/common/style/theme'
import type { SelectOption, SortKey } from '#/common/types/general'
import { Search, Ascending, Descending } from '#/components/icons'
import { SelectionSource } from '#/common/types/map'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'

import { FolayerFeature, FolayerFeatureProperties } from '../common/types'
import { useMapStore } from '#/common/store'
import useSelectedFeaturesFilteredBySource from '#/common/hooks/map/useSelectedFeaturesFilteredBySource'

interface Props {
  data: FolayerFeature[] | undefined
  keysToSearch: string[]
  source: SelectionSource
  sortKeys?: SortKey[]
  searchPlaceholder?: string
  sx?: AppSystemStyleObject
}

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  sx?: AppSystemStyleObject
}

type ButtonBoxProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  sx?: AppSystemStyleObject
}

type VirtualizedListProps = {
  height: number
  itemCount: number
  itemSize: number
  width: number | string
  children: (props: ListChildComponentProps) => React.ReactNode
}

const RELEVANCY_SORT_KEY = 'relevancy'
const ROW_HEIGHT = 50
const MAX_LIST_HEIGHT = 400
const SystemBox = Box as React.ElementType
const VirtualizedList =
  FixedSizeList as unknown as React.ComponentType<VirtualizedListProps>

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

const ButtonBox = React.forwardRef<HTMLButtonElement, ButtonBoxProps>(
  function ButtonBox({ sx, ...props }, ref) {
    return (
      <SystemBox
        component="button"
        ref={ref as React.Ref<HTMLElement>}
        sx={sx}
        {...props}
      />
    )
  }
)

const getSortableValue = (feature: FolayerFeature, key: string) => {
  const value = feature.properties[key as keyof FolayerFeatureProperties]

  return value == null ? '' : String(value).toLowerCase()
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
  const flyTo = useMapStore((state) => state.flyTo)
  const selectedFeatures = useSelectedFeaturesFilteredBySource([source])

  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('')
  const [isAscending, setIsAscending] = React.useState(false)

  const relevancySortKey = React.useMemo<SortKey>(
    () => ({
      key: RELEVANCY_SORT_KEY,
      label: t('components.search_table.sort_relevancy'),
    }),
    [t]
  )
  const [sortKey, setSortKey] = React.useState<SortKey>(relevancySortKey)
  const searchLabel =
    searchPlaceholder || t('components.search_table.search')
  const sortDirectionAriaLabel = t(
    isAscending
      ? 'components.search_table.sort_direction_ascending_aria_label'
      : 'components.search_table.sort_direction_descending_aria_label'
  )

  React.useEffect(() => {
    setSortKey((prev) =>
      prev.key === RELEVANCY_SORT_KEY ? relevancySortKey : prev
    )
  }, [relevancySortKey])

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
    if (sortKey.key === RELEVANCY_SORT_KEY) {
      if (isAscending) {
        return [...result].reverse()
      }
      return result
    }

    return [...result].sort((a, b) => {
      const keyA = getSortableValue(a, sortKey.key)
      const keyB = getSortableValue(b, sortKey.key)
      if (keyA < keyB) return isAscending ? -1 : 1
      if (keyA > keyB) return isAscending ? 1 : -1
      return 0
    })
  }, [debouncedSearchTerm, fuse, isAscending, sortKey, data])

  const allSortKeys = React.useMemo(
    () => [relevancySortKey, ...sortKeys],
    [relevancySortKey, sortKeys]
  )

  const sortOptions = React.useMemo<SelectOption[]>(
    () =>
      allSortKeys.map((key) => ({
        value: key.key,
        label: key.label,
      })),
    [allSortKeys]
  )

  const handleSortKeyChange = (event: { target: { value: string } }) => {
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
      if (feature.geometry.type === 'Point') {
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

  const listHeight = Math.min(
    table.getRowModel().rows.length * ROW_HEIGHT,
    MAX_LIST_HEIGHT
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
      <div style={style as unknown as React.CSSProperties}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
            borderLeft: '3px solid',
            borderLeftColor: isSelected ? 'secondary.dark' : 'transparent',
            backgroundColor: isSelected ? 'primary.lighter' : 'transparent',
            '&:hover': {
              backgroundColor: isSelected ? 'primary.light' : 'action.hover',
            },
            typography: 'body7',
            height: '100%',
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {row.getVisibleCells().map((cell) => (
            <ButtonBox
              key={cell.id}
              type="button"
              aria-pressed={isSelected}
              data-testid={
                isSelected ? 'search-table-row-selected' : undefined
              }
              onClick={() => handleClick(cell.row.original)}
              sx={{
                flex: 1,
                minWidth: 0,
                p: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                border: 0,
                color: 'inherit',
                cursor: 'pointer',
                font: 'inherit',
                lineHeight: 1.35,
                overflow: 'hidden',
                textAlign: 'left',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'transparent',
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'secondary.dark',
                  outlineOffset: -2,
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: 'block',
                  minWidth: 0,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Box>
            </ButtonBox>
          ))}
        </Box>
      </div>
    )
  }

  return (
    <Box sx={[{ width: '100%', minWidth: 0 }, ...toSxArray(sx)]}>
      {/* sorting button */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          minWidth: 0,
          mb: 1,
        }}
      >
        <DropDownSelectMinimal
          value={sortKey.key}
          options={sortOptions}
          onChange={handleSortKeyChange}
          ariaLabel={t('components.search_table.sort_field_aria_label')}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'transparent',
          }}
          selectedValueSx={{
            typography: 'body7',
            textAlign: 'right',
            fontWeight: 500,
            p: 0,
            pr: 0,
            minWidth: 0,
          }}
          optionSx={{
            textAlign: 'right',
            typography: 'body7',
            fontWeight: 500,
          }}
          iconSx={{ display: 'none' }}
        />
        <ButtonBox
          type="button"
          aria-label={sortDirectionAriaLabel}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            p: 0,
            border: 0,
            borderRadius: 0.5,
            backgroundColor: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0,
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'secondary.dark',
              outlineOffset: 2,
            },
          }}
          onClick={toggleSortOrder}
        >
          {isAscending ? (
            <Ascending sx={{ width: 18, height: 18 }} />
          ) : (
            <Descending sx={{ width: 18, height: 18 }} />
          )}
        </ButtonBox>
      </Box>
      {/* Search input */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          mb: 1,
          backgroundColor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:focus-within': {
            borderColor: 'secondary.dark',
          },
        }}
      >
        <Search
          sx={{
            mr: 1,
            width: 20,
            height: 20,
            flexShrink: 0,
            color: 'neutral.dark',
          }}
        />
        <SearchInput
          aria-label={searchLabel}
          placeholder={searchLabel}
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{
            flex: '1 1 auto',
            width: 'auto',
            minWidth: 0,
            py: 0.5,
            border: 0,
            outline: 0,
            backgroundColor: 'transparent',
            color: 'inherit',
            font: 'inherit',
            typography: 'body2',
            '&::placeholder': {
              color: 'text.secondary',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Separate Box for the scrollable, virtualized rows */}
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          overflow: 'auto',
          overflowX: 'hidden',
          borderRadius: 1,
        }}
      >
        <VirtualizedList
          height={listHeight}
          itemCount={table.getRowModel().rows.length}
          itemSize={ROW_HEIGHT}
          width="100%"
        >
          {Row}
        </VirtualizedList>
      </Box>
    </Box>
  )
}

export default SearchTable
