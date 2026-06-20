'use client'

import React from 'react'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme/system'
import { SelectOption } from '#/common/types/general'
import DropDownSelect, {
  type DropDownValueChangeEvent,
} from '#/components/common/DropDownSelect'

type Props = {
  value: unknown
  options: SelectOption[]
  onChange: (event: DropDownValueChangeEvent) => void
  ariaLabel?: string
  sx?: AppSxProps
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
  optionSx,
  iconSx,
  isIconOnTheRight = true,
  open,
  defaultOpen,
  onOpenChange,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        minWidth: 0,
      }}
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
            width: 'auto',
            minWidth: 0,
          },
          ...toSxArray(sx),
        ]}
        selectSx={{
          width: 'auto',
          minWidth: 0,
          height: 'auto',
          minHeight: 0,
          boxShadow: 'none',
          backgroundColor: 'transparent',
          borderRadius: 0,
          flexDirection: isIconOnTheRight ? 'row' : 'row-reverse',
          '&:focus-visible .MuiOutlinedInput-notchedOutline, &[data-popup-open] .MuiOutlinedInput-notchedOutline':
            {
              borderColor: 'transparent',
            },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
            borderWidth: 0,
          },
          '.MuiSelect-select': {
            m: 0,
            p: 0,
            pr: isIconOnTheRight ? '1.25rem' : 0,
            pl: isIconOnTheRight ? 0 : '1.25rem',
            minHeight: 0,
            fontSize: '0.6875rem',
            fontWeight: 400,
            lineHeight: 'normal',
            letterSpacing: '0.04em',
            color: '#111111',
          },
        }}
        iconSx={[
          {
            right: isIconOnTheRight ? '0.4rem' : 'auto',
            left: isIconOnTheRight ? 'auto' : '0.4rem',
            mr: '0.4rem',
            mt: '0.2rem',
          },
          ...toSxArray(iconSx),
        ]}
        typographySx={[
          {
            textAlign: 'left',
            pl: 1,
            pt: 0.5,
            pb: 0.5,
            fontSize: '0.6875rem',
            fontWeight: 400,
            lineHeight: 'normal',
            letterSpacing: '0.04em',
            color: '#111111',
          },
          ...toSxArray(optionSx),
        ]}
        menuItemSx={{
          m: 0,
          p: 0,
        }}
        menuPaperSx={{
          mt: 0.5,
          borderRadius: '0.625rem',
          border: '0.5px solid #D6D6D6',
          boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
        }}
      />
    </Box>
  )
}

export default DropDownSelectMinimal
