import type { PandaStyleProp } from '#/common/style/panda'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'

interface Props {
  columns: string[]
  selectedColumn?: string
  onColumnChange: (column: string | undefined) => void
  allowEmpty?: boolean
  label?: string
  sx?: PandaStyleProp
}

const FolayerImportCodeRecordSelect = ({
  columns,
  selectedColumn,
  onColumnChange,
  allowEmpty,
  label,
  sx,
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
          sx={[...(Array.isArray(sx) ? sx : [sx])]}
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
