import type { PandaStyleProp } from '#/common/style/panda'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'

type PlanImportCodeRecordSelectProps = {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  label: string
  placeholder: string
  styleProps?: PandaStyleProp
}

const PlanImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  label,
  placeholder,
  styleProps,
}: PlanImportCodeRecordSelectProps) => {
  const handleSelectColumn = (event: FormSelectionEvent<string>) => {
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
      styleProps={[
        {
          width: '100%',
          mb: 0,
        },
        ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
      ]}
      successIndicatorMode="outside"
    />
  )
}

export default PlanImportCodeRecordSelect
