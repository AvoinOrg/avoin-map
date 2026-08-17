import type React from 'react'
import { useTranslate } from '@tolgee/react'

import { Box, toSxArray } from '#/common/style/theme'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'

type FolayerImportCodeRecordSelectSx = React.ComponentProps<
  typeof DropDownSelectWithLabel
>['sx']

interface Props {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  label?: string
  sx?: FolayerImportCodeRecordSelectSx
  defaultOpen?: boolean
}

const columnValueSx = {
  display: 'block',
  minWidth: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const

const menuColumnValueSx = {
  display: 'block',
  minWidth: 0,
  maxWidth: '100%',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
} as const

const FolayerImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  label,
  sx,
  defaultOpen,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const handleSelectColumn = (event: DropDownValueChangeEvent) => {
    const { value } = event.target

    if (value === '' || value === null) {
      onColumnChange(undefined)
      return
    }

    onColumnChange(value as string)
  }

  if (columns.length === 0) {
    return null
  }

  return (
    <DropDownSelectWithLabel
      sx={toSxArray(sx)}
      value={selectedColumn}
      options={columns.map((col) => {
        return { value: col, label: col }
      })}
      onChange={handleSelectColumn}
      allowEmpty={allowEmpty}
      label={label}
      placeholder={
        allowEmpty ? t('components.drop_down_select.empty_selection') : undefined
      }
      defaultOpen={defaultOpen}
      headerSx={{
        px: '0.875rem',
      }}
      labelSx={{
        maxWidth: '100%',
        overflowWrap: 'anywhere',
        lineHeight: 1.25,
      }}
      selectSx={{
        '.MuiSelect-select': {
          pr: '2.25rem',
        },
      }}
      typographySx={{
        fontSize: '0.75rem',
        lineHeight: 1.3,
      }}
      menuPaperSx={{
        maxWidth: 'min(24rem, calc(100vw - 1rem))',
      }}
      menuItemSx={{
        alignItems: 'flex-start',
        py: 1,
        minHeight: '2.125rem',
      }}
      renderSelectedValue={(selectedOption, selectedValue) => (
        <Box component="span" sx={columnValueSx}>
          {selectedOption?.label ?? selectedValue}
        </Box>
      )}
      renderOption={(option) => (
        <Box component="span" sx={menuColumnValueSx}>
          {option.label}
        </Box>
      )}
    />
  )
}

export default FolayerImportCodeRecordSelect
