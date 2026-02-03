import React, { useEffect } from 'react'
import {
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
  Typography,
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

const DropDownSelectWithHeader = ({
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
        <Typography
          sx={[
            {
              typography: 'h7',
              mb: 2,
            },
            ...(Array.isArray(labelSx) ? labelSx : [labelSx]),
          ]}
        >
          {label}
        </Typography>
      )}
      <Select
        value={currentValue}
        onChange={onChange}
        IconComponent={DownIcon}
        MenuProps={{
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        }}
        disabled={disabled}
        sx={[
          {
            '&.MuiOutlinedInput-root': {
              backgroundColor: 'background.main',
              borderRadius: '999px',
              overflow: 'hidden',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '999px',
            },
            '.MuiSvgIcon-root': { fontSize: '16px', margin: '0 10px 0 0' },
            '.MuiSelect-icon': {
              mt: 0.2,
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

export default DropDownSelectWithHeader
