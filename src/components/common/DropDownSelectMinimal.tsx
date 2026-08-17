import React from 'react'

import { SHARED_CONTROL_INFINITE_BORDER_RADIUS } from '#/common/style/theme/constants'
import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'
import { SelectOption } from '#/common/types/general'
import DropDownSelect, {
  DROP_DOWN_SELECT_ICON_SX,
  type DropDownValueChangeEvent,
} from '#/components/common/DropDownSelect'

type Props = {
  value: unknown
  options: SelectOption[]
  onChange: (event: DropDownValueChangeEvent) => void
  ariaLabel?: string
  sx?: AppSxProps
  selectedValueSx?: AppSxProps
  optionSx?: AppSxProps
  iconSx?: AppSxProps
  isIconOnTheRight?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const DropDownSelectMinimal = ({
  value,
  options,
  onChange,
  ariaLabel,
  sx,
  selectedValueSx,
  optionSx,
  iconSx,
  isIconOnTheRight = true,
  open,
  defaultOpen,
  onOpenChange,
}: Props) => {
  const selectedValueSxArray = toSxArray(selectedValueSx)
  const rootSxArray = toSxArray(sx)
  const optionSxArray = toSxArray(optionSx)
  const iconSxArray = toSxArray(iconSx)

  return (
    <Box
      sx={[
        {
          display: 'inline-flex',
          width: 'fit-content',
          maxWidth: '100%',
          minWidth: 0,
          borderRadius: SHARED_CONTROL_INFINITE_BORDER_RADIUS,
          backgroundColor: 'neutral.main',
          color: '#111111',
        },
        ...rootSxArray,
      ]}
    >
      <DropDownSelect
        value={value}
        options={options}
        onChange={onChange}
        ariaLabel={ariaLabel}
        allowEmpty={value == null}
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        sx={[
          {
            display: 'inline-flex',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
          },
        ]}
        selectSx={[
          {
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxShadow: 'none',
            backgroundColor: 'transparent',
            flexDirection: isIconOnTheRight ? 'row' : 'row-reverse',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '.MuiSelect-select': {
              m: 0,
              flex: '0 1 auto',
              minWidth: 0,
              pl: isIconOnTheRight ? '1rem' : '2.5rem',
              pr: isIconOnTheRight ? '2.5rem' : '1rem',
              fontSize: '0.6875rem',
              fontWeight: 400,
              lineHeight: 'normal',
              letterSpacing: '0.04em',
              color: 'currentColor',
            },
          },
          ...selectedValueSxArray.map((selectedValueSxItem) => ({
            '.MuiSelect-select': selectedValueSxItem,
          })),
        ]}
        iconSx={[
          {
            color: 'currentColor',
          },
          ...(isIconOnTheRight
            ? []
            : [
                {
                  ...DROP_DOWN_SELECT_ICON_SX,
                  right: 'auto',
                  left: '1rem',
                },
              ]),
          ...iconSxArray,
        ]}
        typographySx={[
          {
            textAlign: 'left',
            fontSize: '0.6875rem',
            fontWeight: 400,
            lineHeight: 'normal',
            letterSpacing: '0.04em',
            color: '#111111',
          },
          ...optionSxArray,
        ]}
      />
    </Box>
  )
}

export default DropDownSelectMinimal
