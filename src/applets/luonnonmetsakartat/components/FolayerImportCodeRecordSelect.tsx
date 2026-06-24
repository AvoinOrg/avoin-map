import type React from 'react'

import { toSxArray } from '#/common/style/theme'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'

type FolayerImportCodeRecordSelectSx = React.ComponentProps<
  typeof DropDownSelectWithHeader
>['sx']

interface Props {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  label?: string
  sx?: FolayerImportCodeRecordSelectSx
}

const FolayerImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  label,
  sx,
}: Props) => {
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
    <DropDownSelectWithHeader
      sx={toSxArray(sx)}
      value={selectedColumn}
      options={columns.map((col) => {
        return { value: col, label: col }
      })}
      onChange={handleSelectColumn}
      allowEmpty={allowEmpty}
      label={label}
    />
  )
}

export default FolayerImportCodeRecordSelect
