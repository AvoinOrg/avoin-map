import * as React from 'react'
import { Box, TextField, Typography, SxProps, Theme } from '@mui/material'

interface TextFieldWithHeaderProps {
  headerText: string
  placeholderText?: string
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  sx?: SxProps<Theme>
  headerSx?: SxProps<Theme>
  textSx?: SxProps<Theme>
  required?: boolean
  fullWidth?: boolean
  disabled?: boolean
  error?: boolean
  helperText?: string
  multiline?: boolean
  rows?: number
  minRows?: number
  maxRows?: number
}

const TextFieldWithHeader = ({
  headerText,
  placeholderText,
  value,
  onChange,
  sx,
  headerSx,
  textSx,
  helperText,
  required = false,
  fullWidth = true,
  disabled = false,
  error = false,
  multiline = false,
  rows,
  minRows,
  maxRows,
  ...restTextFieldProps
}: TextFieldWithHeaderProps) => {
  const textFieldProps: any = {
    value,
    onChange,
    placeholder: placeholderText,
    fullWidth,
    disabled,
    error,
    helperText,
    multiline,
    rows,
    minRows,
    maxRows,
    ...restTextFieldProps,
  }

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography
        variant="body1"
        sx={[
          {
            mb: 1,
          },
          ...(Array.isArray(headerSx) ? headerSx : [headerSx]),
        ]}
      >
        {headerText}
        {required && ' *'}
      </Typography>
      <TextField
        {...textFieldProps}
        sx={[
          {
            '& .MuiOutlinedInput-root': {
              borderRadius: '2px',
              border: '0.5px solid',
              borderColor: 'neutral.main',
              backgroundColor: 'neutral.light',
              boxShadow: '0px 4px 7px 0px rgba(217, 217, 217, 0.50) inset',

              // Remove default MUI border to use our custom one
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
            },
            '& .MuiInputBase-input': {
              fontFamily: 'Arimo',
              fontSize: '0.9rem',
              color: 'neutral.darker',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              letterSpacing: '1.1px',
              opacity: 1,
            },
            // For Firefox
            '& .MuiInputBase-input::-moz-placeholder': {
              typography: 'body1',
              fontSize: '1rem',
              opacity: 1,
              color: 'neutral.dark',
              letterSpacing: '1.1px',
            },
          },
          ...(Array.isArray(textSx) ? textSx : [textSx]),
        ]}
      />
    </Box>
  )
}

export default TextFieldWithHeader
