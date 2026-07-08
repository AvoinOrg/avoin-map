import type React from 'react'

import { toSxArray } from '#/common/style/theme'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'

type PlanImportCodeRecordSelectSx = React.ComponentProps<
  typeof DropDownSelectWithLabel
>['sx']

type PlanImportCodeRecordSelectProps = {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  dataSlot?: string
  label: string
  placeholder: string
  sx?: PlanImportCodeRecordSelectSx
}

const PlanImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  dataSlot,
  label,
  placeholder,
  sx,
}: PlanImportCodeRecordSelectProps) => {
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
      dataSlot={dataSlot}
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
        ...toSxArray(sx),
      ]}
      successIndicatorMode="outside"
    />
  )
}

export default PlanImportCodeRecordSelect
