import React, { useLayoutEffect, useState } from 'react'
import {
  SxProps,
  Theme,
  TextField,
  Typography,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

interface Props {
  value: string
  onChange: (event: any) => void
  valueAppendix?: string
  sx?: SxProps<Theme>
  textSx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
}

const EditableText = ({
  value,
  onChange,
  valueAppendix,
  sx,
  textSx,
  iconSx,
}: Props) => {
  const [internalValue, setInternalValue] = useState(value)
  const [isValueFocused, setIsInputFocused] = useState(false)
  const isCanceledRef = React.useRef(false)

  useLayoutEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleCancel = (event: any) => {
    isCanceledRef.current = true
    setInternalValue(value) // Revert to original value
    setIsInputFocused(false)
    event.stopPropagation()
  }

  const handleAccept = (event: any) => {
    if (internalValue !== value) {
      handleChange({ target: { value: internalValue } })
    } else {
      setIsInputFocused(false)
    }
    event.stopPropagation()
  }

  const handleChange = (event: any) => {
    setIsInputFocused(false)
    if (event.target.value !== value) {
      onChange(event)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (isCanceledRef.current) {
        isCanceledRef.current = false
        return
      }
      if (internalValue !== value) {
        handleChange({ target: { value: internalValue } })
      } else {
        setIsInputFocused(false)
      }
    }, 100) // Delay to allow click event to be registered
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      if (internalValue !== value) {
        handleChange({ target: { value: internalValue } })
      } else {
        setIsInputFocused(false)
      }
    }
  }

  const handleEditClick = (event: any) => {
    event.stopPropagation()
    setIsInputFocused(true)
  }

  const handleEditKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleEditClick(event)
    }
  }

  const handleInputChange = (event: any) => {
    setInternalValue(event.target.value)
  }

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'start',
          width: '100%',
          justifyContent: 'flex-start',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!isValueFocused ? (
        <>
          <Typography
            sx={[
              {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                // float: "left",
              },
              ...(Array.isArray(textSx) ? textSx : [textSx]),
            ]}
            // onClick={(event) => {
            //   event?.stopPropagation()
            //   setIsInputFocused(true)
            // }}
          >
            {`${value}${valueAppendix ?? ''}`}
          </Typography>
          <IconButton
            disableRipple
            onClick={handleEditClick}
            component="span"
            role="button"
            tabIndex={0}
            onKeyDown={handleEditKeyDown}
            sx={{ ml: 1, p: 0, height: '100%' }}
          >
            <EditIcon
              sx={[
                {
                  fontSize: '19px',
                  color: 'neutral.dark',
                  '&:hover': {
                    color: 'neutral.darker',
                  },
                },
                ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
              ]}
            />
          </IconButton>
        </>
      ) : (
        <TextField
          autoFocus
          sx={{
            p: 0,
            m: 0,
            width: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: '999px',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderRadius: '999px',
            },
          }}
          value={internalValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={(event) => event.stopPropagation()}
          variant="outlined"
          onFocus={(event) => {
            event.stopPropagation()
          }}
          slotProps={{
            input: {
              sx: [
                { m: 0, p: 0, height: '100%' },
                ...(Array.isArray(textSx) ? textSx : [textSx]),
              ],
              endAdornment: (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    sx={{
                      height: '100%',
                      color: 'neutral.dark',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      '&:hover': {
                        color: 'neutral.darker',
                      },
                    }}
                    onClick={handleAccept}
                  >
                    <CheckIcon
                      sx={[
                        { fontSize: '19px' },
                        ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
                      ]}
                    />
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      p: 0,
                      height: '100%',
                      color: 'neutral.dark',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      '&:hover': {
                        color: 'neutral.darker',
                      },
                    }}
                    onClick={handleCancel}
                  >
                    <CloseIcon
                      sx={[
                        { fontSize: '19px' },
                        ...(Array.isArray(iconSx) ? iconSx : [iconSx]),
                      ]}
                    />
                  </Box>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
    </Box>
  )
}

export default EditableText
