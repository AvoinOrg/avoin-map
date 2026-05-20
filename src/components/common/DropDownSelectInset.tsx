import React from 'react'
import { Box, SxProps, Theme, Typography } from '@mui/material'

import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>

type DropDownSelectInsetProps = Omit<
  DropDownSelectProps,
  'label' | 'labelSx' | 'sx'
> & {
  label: React.ReactNode
  sx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  selectWrapperSx?: SxProps<Theme>
}

const DropDownSelectInset = ({
  label,
  ariaLabel,
  sx,
  labelSx,
  selectSx,
  selectWrapperSx,
  renderSelectedValue,
  ...rest
}: DropDownSelectInsetProps) => {
  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          gap: '0.875rem',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <DropDownSelect
        {...rest}
        ariaLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        label={undefined}
        sx={[
          {
            width: '8.25rem',
            flexShrink: 0,
          },
          ...(Array.isArray(selectWrapperSx)
            ? selectWrapperSx
            : selectWrapperSx
              ? [selectWrapperSx]
              : []),
        ]}
        selectSx={[
          {
            '&.MuiOutlinedInput-root': {
              height: '1.375rem',
              borderRadius: '999px !important',
              backgroundColor: 'common.white',
              boxShadow: 'none',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#D6D6D6',
              borderRadius: '999px',
            },
            '.MuiSelect-select': {
              minHeight: '1.125rem',
              py: '0 !important',
              pl: '0.25rem !important',
              pr: '1.75rem !important',
              display: 'flex',
              alignItems: 'center',
            },
            '.MuiSelect-icon': {
              width: '0.5rem',
              height: '0.25rem',
              mr: '0.625rem',
            },
          },
          ...(Array.isArray(selectSx) ? selectSx : selectSx ? [selectSx] : []),
        ]}
        renderSelectedValue={
          renderSelectedValue ??
          ((selectedOption, selectedValue) => (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                maxWidth: '100%',
                minWidth: 0,
                height: '0.875rem',
                px: '0.625rem',
                borderRadius: '999px',
                backgroundColor: 'secondary.dark',
                color: 'neutral.light',
                fontSize: '0.625rem',
                fontWeight: 700,
                lineHeight: '0.875rem',
                letterSpacing: '0.1em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {selectedOption?.label ?? selectedValue}
            </Box>
          ))
        }
      />
      <Typography
        sx={[
          {
            flex: 1,
            minWidth: 0,
            color: '#111111',
            fontSize: '0.625rem',
            fontWeight: 700,
            lineHeight: '1.125rem',
            letterSpacing: '0.1em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
          ...(Array.isArray(labelSx) ? labelSx : labelSx ? [labelSx] : []),
        ]}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default DropDownSelectInset
