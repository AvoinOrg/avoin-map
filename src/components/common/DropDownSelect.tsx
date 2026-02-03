import React, { useEffect } from 'react'
import {
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
import { SelectOption } from '#/common/types/general'

interface Props {
  value: any
  options: SelectOption[]
  onChange: (event: SelectChangeEvent) => void
  label?: string
  allowEmpty?: boolean
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
  allowEmpty,
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

  return (
    <FormControl
      variant="outlined"
      sx={[
        { maxWidth: '100%', borderRadius: '999px' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
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
        value={currentValue}
        onChange={onChange}
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
              mr: 1.1,
              ...(iconSx as Record<string, any>),
            },
            '.MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              py: 1.5,
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
  )
}

export default DropDownSelect
