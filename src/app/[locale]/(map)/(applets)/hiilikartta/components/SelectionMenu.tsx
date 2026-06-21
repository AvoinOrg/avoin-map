import { Box, type AppSystemStyleObject } from '#/common/style/theme'
import DropDownSelect, {
  type DropDownValueChangeEvent,
} from '#/components/common/DropDownSelect'

export type SelectionMenuChangeEvent = DropDownValueChangeEvent

interface Props {
  id: string
  options: string[]
  value: string | undefined
  onChange: (event: SelectionMenuChangeEvent) => void
  label?: string
  sx?: AppSystemStyleObject
}

const SelectionMenu = ({ id, options, value, onChange, sx, label }: Props) => {
  const selectOptions = options.map((option) => ({
    value: option,
    label: option,
  }))

  return (
    <Box id={id} sx={sx}>
      <DropDownSelect
        ariaLabel={label ?? id}
        label={label}
        value={value}
        options={selectOptions}
        onChange={onChange}
      />
    </Box>
  )
}

export default SelectionMenu
