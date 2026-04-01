import React, { useEffect } from 'react'
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material'
import { T } from '@tolgee/react'

import DownIcon from '#/components/icons/DownIcon'
import CheckcircleChecked from '#/components/icons/CheckcircleChecked'
import { SelectOption } from '#/common/types/general'

interface Props {
  value: any
  options: SelectOption[]
  onChange: (event: SelectChangeEvent) => void
  label?: string
  ariaLabel?: string
  allowEmpty?: boolean
  placeholder?: React.ReactNode
  sx?: SxProps<Theme>
  selectSx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
  typographySx?: SxProps<Theme>
  disabled?: boolean
}

const DropDownSelect = ({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  allowEmpty,
  placeholder,
  sx,
  selectSx,
  labelSx,
  iconSx,
  typographySx,
  disabled,
}: Props) => {
  const [hasEmpty, setHasEmpty] = React.useState(true)
  const generatedId = React.useId()
  const labelId = label ? `${generatedId}-label` : undefined
  const selectId = `${generatedId}-select`

  useEffect(() => {
    setHasEmpty(
      Object.values(options).find((option) => option.value === value) == null
    )
  }, [value, options])

  const useEmpty = allowEmpty || value == null || value === ''
  const currentValue = value == null ? '' : value
  const hasValidSelection =
    !disabled &&
    value != null &&
    value !== '' &&
    options.some((option) => option.value === value)

  return (
    <Box
      sx={[
        {
          position: 'relative',
          maxWidth: '100%',
          borderRadius: '999px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FormControl variant="outlined" sx={{ width: '100%', borderRadius: '999px' }}>
      {label && (
        <InputLabel
          id={labelId}
          sx={[
            {
              typography: 'body2',
              fontWeight: 400,
              letterSpacing: '0.0875rem',
              lineHeight: 'normal',
              transform: 'translate(14px, 12px) scale(1)',
              backgroundColor: 'background.main',
              px: 0.5,
              '&.MuiInputLabel-shrink': {
                transform: 'translate(14px, -8px) scale(0.75)',
              },
              '&.Mui-focused': {
                color: 'secondary.dark',
              },
            },
            ...(Array.isArray(labelSx) ? labelSx : [labelSx]),
          ]}
        >
          {label}
        </InputLabel>
      )}
      <Select
        id={selectId}
        labelId={labelId}
        aria-label={ariaLabel ?? label}
        value={currentValue}
        onChange={onChange}
        displayEmpty={placeholder != null}
        renderValue={(selected) => {
          if ((selected == null || selected === '') && placeholder != null) {
            return (
              <Box
                component="span"
                sx={{
                  display: 'block',
                  color: '#a0a0a0',
                }}
              >
                {placeholder}
              </Box>
            )
          }

          const selectedOption = options.find(
            (option) => option.value === selected
          )

          return selectedOption?.label ?? selected
        }}
        IconComponent={DownIcon}
        label={label}
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
              borderRadius: '10px',
              border: '0.1px solid #A0A0A0',
              boxShadow: '0 1px 3px 0 rgba(214, 214, 214, 0.50) inset',
            },
          },
        }}
        disabled={disabled}
        sx={[
          {
            '&.MuiOutlinedInput-root': {
              backgroundColor: 'background.main',
              borderRadius: '999px',
              overflow: 'hidden',
              boxShadow: '0 1px 2px 0 rgba(214, 214, 214, 0.60) inset',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '999px',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'secondary.dark',
            },
            '.MuiSvgIcon-root': { fontSize: '16px', margin: '0 10px 0 0' },
            '.MuiSelect-icon': {
              mt: 0.2,
              mr: hasValidSelection ? 3.35 : 1.1,
              ...(iconSx as Record<string, any>),
            },
            '.MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: 1.5,
              pr: hasValidSelection ? '4rem !important' : undefined,
              backgroundColor: 'transparent',
              '&:focus': {
                backgroundColor: 'transparent',
              },
            },
            typography: 'body2',
          },
          ...(Array.isArray(selectSx) ? selectSx : [selectSx]),
        ]}
      >
        {hasEmpty === true && value != null && value !== '' && (
          <MenuItem
            key={`invalid-${value}`}
            value={value}
            aria-label={`Invalid value ${value}`}
            sx={[
              { typography: 'body2' },
              ...(Array.isArray(typographySx) ? typographySx : [typographySx]),
            ]}
          >
            <i>
              <T
                keyName={'components.drop_down_select.invalid_value'}
                ns={'avoin-map'}
              />
              {` (${value})`}
            </i>
          </MenuItem>
        )}
        {useEmpty && (
          <MenuItem
            key="empty-selection"
            value=""
            aria-label="Empty selection"
            sx={[
              { typography: 'body2' },
              ...(Array.isArray(typographySx) ? typographySx : [typographySx]),
            ]}
          >
            <i>
              <T
                keyName={'components.drop_down_select.empty_selection'}
                ns={'avoin-map'}
              />
            </i>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={`option-${option.value}`}
            value={option.value}
            aria-label={
              typeof option.label === 'string'
                ? option.label
                : String(option.value)
            }
            sx={[
              { typography: 'body2' },
              ...(Array.isArray(typographySx) ? typographySx : [typographySx]),
            ]}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      </FormControl>
      {hasValidSelection && (
        <CheckcircleChecked
          fillColor="rgba(51, 147, 73, 0.2)"
          sx={{
            position: 'absolute',
            top: '50%',
            right: '2.7rem',
            transform: 'translateY(-50%)',
            width: 20,
            height: 20,
            color: 'secondary.dark',
            pointerEvents: 'none',
          }}
        />
      )}
    </Box>
  )
}

export default DropDownSelect
