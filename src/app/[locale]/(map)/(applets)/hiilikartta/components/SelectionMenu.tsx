import * as React from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'

interface Props {
  id: string
  options: string[]
  value: string | undefined
  onChange: (event: FormSelectionEvent<string>) => void
  label?: string
  sx?: PandaStyleProp
}

const SelectionMenu = ({ id, options, value, onChange, sx, label }: Props) => {
  return (
    <DropDownSelectWithHeader
      name={id}
      label={label}
      ariaLabel={label ?? id}
      value={value}
      options={options.map((option) => ({ label: option, value: option }))}
      onChange={onChange}
      sx={sx}
    />
  )
}

export default SelectionMenu
