import React, { type ReactNode } from 'react'
import {
  Box,
  Checkbox,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material'

import DownIcon from '#/components/icons/DownIcon'

export type DropDownMultiSelectOption = {
  value: string
  label: ReactNode
  ariaLabel?: string
  leading?: ReactNode
  trailing?: ReactNode
}

type Props = {
  value: string[]
  options: DropDownMultiSelectOption[]
  onChange: (event: SelectChangeEvent<string[]>) => void
  ariaLabel?: string
  placeholder?: ReactNode
  renderValue?: (
    selected: string[],
    selectedOptions: DropDownMultiSelectOption[]
  ) => ReactNode
  renderOptionContent?: (
    option: DropDownMultiSelectOption,
    selected: boolean
  ) => ReactNode
  sx?: SxProps<Theme>
  selectSx?: SxProps<Theme>
  menuPaperSx?: SxProps<Theme>
  menuItemSx?: SxProps<Theme>
  checkboxSx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
  disabled?: boolean
}

const DropDownMultiSelect = ({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder,
  renderValue,
  renderOptionContent,
  sx,
  selectSx,
  menuPaperSx,
  menuItemSx,
  checkboxSx,
  iconSx,
  disabled,
}: Props) => {
  return (
    <Box
      sx={[
        {
          width: '100%',
          minWidth: 0,
          borderRadius: '999px',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Select
        multiple
        displayEmpty
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        disabled={disabled}
        input={<OutlinedInput notched={false} />}
        IconComponent={DownIcon}
        renderValue={(selected) => {
          const selectedValues = selected as string[]
          const selectedOptions = options.filter((option) =>
            selectedValues.includes(option.value)
          )

          if (renderValue) {
            return renderValue(selectedValues, selectedOptions)
          }

          if (selectedOptions.length === 0) {
            return (
              <Box
                component="span"
                sx={{
                  display: 'block',
                  color: '#A0A0A0',
                }}
              >
                {placeholder}
              </Box>
            )
          }

          return (
            <Typography
              component="span"
              sx={{
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedOptions
                .map((option) =>
                  typeof option.label === 'string' ? option.label : option.value
                )
                .join(', ')}
            </Typography>
          )
        }}
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
            sx: [
              {
                mt: 0.5,
                borderRadius: '0.625rem',
                border: '0.5px solid #D6D6D6',
                boxShadow: '0px 8px 24px rgba(17, 17, 17, 0.12)',
              },
              ...(Array.isArray(menuPaperSx) ? menuPaperSx : [menuPaperSx]),
            ],
          },
        }}
        sx={[
          {
            '&.MuiOutlinedInput-root': {
              minHeight: '1.375rem',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D6D6D6',
              borderRadius: '999px',
            },
            '& .MuiOutlinedInput-notchedOutline legend': {
              maxWidth: 0,
            },
            '& .MuiSelect-select': {
              minHeight: '1.375rem',
              display: 'flex',
              alignItems: 'center',
              py: '0.1875rem',
              pl: '0.3125rem',
              pr: '2.25rem !important',
            },
            '& .MuiSelect-icon': {
              width: '0.75rem',
              height: '0.375rem',
              right: '0.875rem',
              ...(iconSx as Record<string, unknown>),
            },
          },
          ...(Array.isArray(selectSx) ? selectSx : [selectSx]),
        ]}
      >
        {options.map((option) => {
          const isSelected = value.includes(option.value)

          return (
            <MenuItem
              key={option.value}
              value={option.value}
              aria-label={
                option.ariaLabel ??
                (typeof option.label === 'string'
                  ? option.label
                  : String(option.value))
              }
              sx={[
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  py: '0.5rem',
                },
                ...(Array.isArray(menuItemSx) ? menuItemSx : [menuItemSx]),
              ]}
            >
              {renderOptionContent ? (
                renderOptionContent(option, isSelected)
              ) : (
                <>
                  <Checkbox
                    checked={isSelected}
                    sx={[
                      {
                        p: 0,
                        mr: '0.25rem',
                        '& .MuiSvgIcon-root': {
                          fontSize: '1rem',
                        },
                      },
                      ...(Array.isArray(checkboxSx)
                        ? checkboxSx
                        : [checkboxSx]),
                    ]}
                  />

                  {option.leading}

                  <Typography
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: '0.6875rem',
                      lineHeight: '1rem',
                      letterSpacing: '0.04em',
                      color: '#111111',
                    }}
                  >
                    {option.label}
                  </Typography>

                  {option.trailing}
                </>
              )}
            </MenuItem>
          )
        })}
      </Select>
    </Box>
  )
}

export default DropDownMultiSelect
