import React, { useState } from 'react'
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
} from '@mui/material'

import ArrowDown from '#/components/icons/ArrowDown'
import { SelectOption } from '#/common/types/general'

interface Props {
  value: any
  options: SelectOption[]
  onChange: (event: SelectChangeEvent<string>) => void
  ariaLabel?: string
  sx?: SxProps<Theme>
  optionSx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
  isIconOnTheRight?: boolean // added prop
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
}: Props) => {
  const [hasEmpty, setHasEmpty] = useState(value == null)

  return (
    <FormControl variant={'standard'}>
      <Select
        aria-label={ariaLabel}
        value={value == null ? '' : value}
        onChange={onChange}
        IconComponent={ArrowDown}
        disableUnderline={true}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
          PaperProps: {
            sx: {
              mt: 0.5,
              borderRadius: '0.625rem',
              border: '0.5px solid #D6D6D6',
              boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
            },
          },
        }}
        sx={[
          {
            '.MuiSelect-icon': {
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0.75rem',
              height: '0.375rem',
              mr: "0.4rem",
              mt: "0.2rem",
              ...(iconSx as Record<string, any>),
            },
            '.MuiSelect-iconOpen': {
              transform: 'translateY(-50%) rotate(180deg)',
            },
            '& .MuiSelect-select': {
              m: 0,
              p: 0,
              fontSize: '0.6875rem',
              fontWeight: 400,
              lineHeight: 'normal',
              letterSpacing: '0.04em',
              color: '#111111',
            },

            '& .MuiSelect-select:focus': {
              backgroundColor: 'transparent',
            },
            m: 0,
            p: 0,
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {hasEmpty && <option key={''} value={''}></option>}
        {options.map((option) => (
          <MenuItem
            aria-label={
              typeof option.label === 'string'
                ? option.label
                : String(option.value)
            }
            sx={{
              m: 0,
              p: 0,
            }}
            key={option.value}
            value={option.value}
          >
            <Typography
              sx={[
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
                ...(Array.isArray(optionSx) ? optionSx : [optionSx]),
              ]}
            >
              {option.label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default DropDownSelectMinimal
