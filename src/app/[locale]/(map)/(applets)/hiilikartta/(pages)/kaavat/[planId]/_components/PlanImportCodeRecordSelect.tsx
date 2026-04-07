import { SelectChangeEvent, SxProps, Theme } from '@mui/material'

import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'

type PlanImportCodeRecordSelectProps = {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  label: string
  placeholder: string
  sx?: SxProps<Theme>
}

const sharedSelectSx = {
  '&.MuiOutlinedInput-root': {
    minHeight: '1.25rem',
    borderRadius: '0.625rem',
    backgroundColor: '#ffffff',
    boxShadow: 'inset 0px 0.5px 1px 0px #d9d9d9',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d6d6d6',
  },
  '& .MuiOutlinedInput-notchedOutline legend': {
    maxWidth: 0,
  },
  '& .MuiSelect-select': {
    minHeight: '1.25rem',
    py: '0.1875rem',
    pl: '1rem',
    pr: '2.5rem !important',
    fontSize: '0.6875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.04em',
    color: '#111111',
  },
  '& .MuiSelect-icon': {
    width: '0.75rem',
    height: '0.375rem',
    right: '0.875rem',
  },
} as const satisfies SxProps<Theme>

const sharedTypographySx = {
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.04em',
} as const satisfies SxProps<Theme>

const PlanImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  label,
  placeholder,
  sx,
}: PlanImportCodeRecordSelectProps) => {
  const handleSelectColumn = (event: SelectChangeEvent) => {
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
    <DropDownSelectWithHeader
      value={selectedColumn}
      options={columns.map((column) => ({ value: column, label: column }))}
      onChange={handleSelectColumn}
      allowEmpty={allowEmpty}
      label={label}
      placeholder={placeholder}
      sx={[
        {
          width: '100%',
          mb: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      labelSx={{
        mb: '0.3125rem',
        fontSize: '0.625rem',
        fontWeight: 400,
        lineHeight: '0.8125rem',
        letterSpacing: '0.11em',
        color: '#111111',
      }}
      selectSx={sharedSelectSx}
      typographySx={sharedTypographySx}
      successIndicatorMode="outside"
      iconSx={{
        mt: 0,
      }}
    />
  )
}

export default PlanImportCodeRecordSelect
