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

import ArrowDown from '#/components/icons/ArrowDown'
import CheckcircleCheckedFilled from '#/components/icons/CheckcircleCheckedFilled'
import { SelectOption } from '#/common/types/general'

interface Props {
  value: any
  options: SelectOption[]
  onChange: (event: SelectChangeEvent) => void
  label?: string
  ariaLabel?: string
  allowEmpty?: boolean
  placeholder?: React.ReactNode
  renderOption?: (option: SelectOption) => React.ReactNode
  renderSelectedValue?: (
    selectedOption: SelectOption | undefined,
    selectedValue: string
  ) => React.ReactNode
  sx?: SxProps<Theme>
  selectSx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
  typographySx?: SxProps<Theme>
  disabled?: boolean
  successIndicatorMode?: 'outside' | 'hidden'
}

const DropDownSelect = ({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  allowEmpty,
  placeholder,
  renderOption,
  renderSelectedValue,
  sx,
  selectSx,
  labelSx,
  iconSx,
  typographySx,
  disabled,
  successIndicatorMode = 'hidden',
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
  const menuItemTypographySx = {
    fontSize: '0.6875rem',
    fontWeight: 400,
    lineHeight: 'normal',
    letterSpacing: '0.04em',
    color: '#111111',
  } as const

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: successIndicatorMode === 'outside' ? 'flex' : 'block',
          alignItems: 'center',
          gap: successIndicatorMode === 'outside' ? '0.5rem' : 0,
          maxWidth: '100%',
          borderRadius: '999px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <FormControl
        variant="outlined"
        sx={{
          width: '100%',
          minWidth: 0,
          flex: successIndicatorMode === 'outside' ? 1 : undefined,
          borderRadius: '999px',
        }}
      >
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
          SelectDisplayProps={{
            'aria-label': ariaLabel ?? label,
          }}
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
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {placeholder}
                </Box>
              )
            }

            const selectedOption = options.find(
              (option) => option.value === selected
            )

            if (renderSelectedValue) {
              return renderSelectedValue(selectedOption, String(selected ?? ''))
            }

            return selectedOption?.label ?? selected
          }}
          IconComponent={ArrowDown}
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
                height: '2rem',
                borderRadius: '999px !important',
                boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#D6D6D6',
                borderRadius: '999px',
              },
              '& .MuiOutlinedInput-notchedOutline legend': {
                maxWidth: 0,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'secondary.dark',
              },
              '.MuiSelect-icon': {
                top: '50%',
                transform: 'translateY(-50%)',
                width: '0.75rem',
                height: '0.375rem',
                mr: '0rem',
                ...(iconSx as Record<string, any>),
              },
              '.MuiSelect-iconOpen': {
                transform: 'translateY(-50%) rotate(180deg)',
              },
              '.MuiSelect-select': {
                minHeight: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                py: '0.1875rem',
                pl: '1rem !important',
                pr: '2.5rem !important',
                backgroundColor: 'transparent',
                fontSize: '0.6875rem',
                fontWeight: 400,
                lineHeight: 'normal',
                letterSpacing: '0.04em',
                color: '#111111',
                overflow: 'hidden',
                '&:focus': {
                  backgroundColor: 'transparent',
                },
              },
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
                menuItemTypographySx,
                ...(Array.isArray(typographySx)
                  ? typographySx
                  : [typographySx]),
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
                menuItemTypographySx,
                ...(Array.isArray(typographySx)
                  ? typographySx
                  : [typographySx]),
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
                menuItemTypographySx,
                ...(Array.isArray(typographySx)
                  ? typographySx
                  : [typographySx]),
              ]}
            >
              {renderOption ? renderOption(option) : option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {hasValidSelection && successIndicatorMode === 'outside' && (
        <CheckcircleCheckedFilled
          sx={{
            width: 12,
            height: 12,
            color: '#2C8E74',
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  )
}

export default DropDownSelect
