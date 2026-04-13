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
      successIndicatorMode="outside"
    />
  )
}

export default PlanImportCodeRecordSelect
