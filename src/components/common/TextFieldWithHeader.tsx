import * as React from 'react'
import { Box, TextField, Typography, SxProps, Theme } from '@mui/material'

interface CustomTextFieldProps {
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
}

const CustomTextField = ({
  headerText,
  placeholderText,
  value,
  onChange,
  sx,
  headerSx,
  textSx,
  required = false,
  fullWidth = true,
  disabled = false,
  error = false,
  helperText,
  ...textFieldProps
}: CustomTextFieldProps) => {
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
        value={value}
        onChange={onChange}
        placeholder={placeholderText}
        fullWidth={fullWidth}
        disabled={disabled}
        error={error}
        helperText={helperText}
        sx={[
          {
            '& .MuiOutlinedInput-root': {
              borderRadius: 'px',
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
        {...textFieldProps}
      />
    </Box>
  )
}

export default CustomTextField
