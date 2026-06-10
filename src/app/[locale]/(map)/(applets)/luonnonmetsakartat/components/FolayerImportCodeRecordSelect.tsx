import type { PandaStyleProp } from '#/common/style/panda'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'

interface Props {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  label?: string
  styleProps?: PandaStyleProp
}

const FolayerImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  label,
  styleProps,
}: Props) => {
  const handleSelectColumn = (event: FormSelectionEvent<string>) => {
    const { value } = event.target

    if (value === '' || value === null) {
      onColumnChange(undefined)
      return
    }

    onColumnChange(value as string)
  }

  return (
    <>
      {columns.length > 0 && (
        <DropDownSelectWithHeader
          styleProps={[...(Array.isArray(styleProps) ? styleProps : [styleProps])]}
          value={selectedColumn}
          options={columns.map((col) => {
            return { value: col, label: col }
          })}
          onChange={handleSelectColumn}
          allowEmpty={allowEmpty}
          label={label}
        />
      )}
    </>
  )
}

export default FolayerImportCodeRecordSelect
