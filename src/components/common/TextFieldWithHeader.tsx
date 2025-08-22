import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, TextField, Typography, SxProps, Theme } from '@mui/material'
import { debounce } from 'lodash-es' // Or from 'lodash' or 'lodash.debounce'

interface TextFieldWithHeaderProps {
  headerText: string
  placeholderText?: string
  value: string // Controlled value from parent
  onChange: (value: string) => void // MODIFIED: Receives debounced string value
  debounceTimeout?: number // Optional: allow parent to configure timeout
  name?: string // Optional: pass name attribute to TextField
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
  // Allow any other TextField props to be passed
  [key: string]: any
}

const TextFieldWithHeader = ({
  headerText,
  placeholderText,
  value: propValue,
  onChange: onParentChange,
  debounceTimeout = 300, // Default 300ms debounce
  name,
  sx,
  headerSx,
  textSx,
  required = false,
  fullWidth = true,
  disabled = false,
  error = false,
  helperText,
  multiline = false,
  rows,
  minRows,
  maxRows,
  ...restTextFieldProps
}: TextFieldWithHeaderProps) => {
  const [internalValue, setInternalValue] = useState(propValue)

  // Update internalValue if propValue changes from parent
  useEffect(() => {
    if (propValue !== internalValue) {
      // Only update if different to avoid loops if parent updates from debounced change
      setInternalValue(propValue)
    }
  }, [propValue])

  // Use a ref to store the latest onParentChange callback
  // This avoids re-creating the debounced function if onParentChange changes frequently
  // (though typically it shouldn't if memoized correctly in parent)
  const onParentChangeRef = useRef(onParentChange)
  useEffect(() => {
    onParentChangeRef.current = onParentChange
  }, [onParentChange])

  const debouncedParentOnChange = useCallback(
    debounce((newValue: string) => {
      if (onParentChangeRef.current) {
        onParentChangeRef.current(newValue)
      }
    }, debounceTimeout),
    [debounceTimeout] // Re-create debounced function if timeout changes
  )

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedParentOnChange.cancel()
    }
  }, [debouncedParentOnChange])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = event.target.value
    setInternalValue(newValue) // Update internal state immediately for responsive UI
    debouncedParentOnChange(newValue) // Call the debounced parent onChange with the new value
  }

  const textFieldFinalProps: any = {
    value: internalValue, // TextField uses internalValue for immediate updates
    onChange: handleInputChange, // Use the local handler
    placeholder: placeholderText,
    fullWidth,
    disabled,
    error,
    helperText,
    multiline,
    name,
    ...restTextFieldProps, // Spread other TextField compatible props
  }

  // Conditionally add row-related props only if multiline is true and they are defined
  if (multiline) {
    if (rows !== undefined) textFieldFinalProps.rows = rows
    if (minRows !== undefined) textFieldFinalProps.minRows = minRows
    if (maxRows !== undefined) textFieldFinalProps.maxRows = maxRows
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
        {...textFieldFinalProps}
        sx={[
          {
            '& .MuiOutlinedInput-root': {
              borderRadius: '2px',
              border: '0.5px solid',
              borderColor: 'neutral.main',
              backgroundColor: 'neutral.light',
              boxShadow: '0px 4px 7px 0px rgba(217, 217, 217, 0.50) inset',
              '& fieldset': { border: 'none' },
              '&:hover fieldset': { border: 'none' },
              '&.Mui-focused fieldset': { border: 'none' },
              '&.MuiInputBase-multiline': { padding: '12px 14px' }, // Example padding
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
              '&.MuiInputBase-inputMultiline': {
                // Specific styles for multiline input if needed
              },
            },
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
