import React from 'react'
import {
  Box,
  TextField,
  type TextFieldProps,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material'

type TextFieldWithLabelProps = Omit<TextFieldProps, 'label' | 'sx'> & {
  label: React.ReactNode
  ariaLabel?: string
  sx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  textFieldSx?: SxProps<Theme>
  trailing?: React.ReactNode
}

const TextFieldWithLabel = ({
  label,
  ariaLabel,
  sx,
  labelSx,
  textFieldSx,
  trailing,
  fullWidth = true,
  size = 'small',
  variant = 'outlined',
  ...textFieldProps
}: TextFieldWithLabelProps) => {
  return (
    <Box
      sx={[
        {
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          maxWidth: '100%',
          px: '1rem',
          minHeight: '1.5rem',
          mb: '0.2rem',
        }}
      >
        <Typography
          sx={[
            {
              fontSize: '0.625rem',
              fontWeight: 400,
              lineHeight: '0.8125rem',
              letterSpacing: '0.11em',
              color: '#111111',
            },
            ...(Array.isArray(labelSx) ? labelSx : [labelSx]),
          ]}
        >
          {label}
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          width: '100%',
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <TextField
            {...textFieldProps}
            aria-label={ariaLabel}
            fullWidth={fullWidth}
            size={size}
            variant={variant}
            sx={[
              {
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  minHeight: '2rem',
                  borderRadius: '999px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: 'inset 0px 0.5px 1px 0px #D9D9D9',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#D6D6D6',
                },
                '& .MuiOutlinedInput-notchedOutline legend': {
                  maxWidth: 0,
                },
                '& .MuiInputBase-input': {
                  py: '0.1875rem',
                  px: '1rem',
                  fontSize: '0.6875rem',
                  fontWeight: 400,
                  lineHeight: 'normal',
                  letterSpacing: '0.04em',
                  color: '#111111',
                },
              },
              ...(Array.isArray(textFieldSx) ? textFieldSx : [textFieldSx]),
            ]}
          />
        </Box>

        {trailing && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              lineHeight: 0,
            }}
          >
            {trailing}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default TextFieldWithLabel
