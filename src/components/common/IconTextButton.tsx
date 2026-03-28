'use client'

import React, { useMemo, useState } from 'react'
import {
  Box,
  ButtonProps,
  Button,
  ClickAwayListener,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material'

import InfoCircleFilled from '#/components/icons/InfoCircleFilled'

type IconTextButtonProps = ButtonProps & {
  icon: React.ReactElement
  text: React.ReactNode
  helperText?: React.ReactNode
  helperAriaLabel?: string
  textSx?: SxProps<Theme>
  iconWrapperSx?: SxProps<Theme>
}

const IconTextButton = ({
  icon,
  text,
  helperText,
  helperAriaLabel,
  sx,
  textSx,
  iconWrapperSx,
  'aria-label': ariaLabel,
  ...buttonProps
}: IconTextButtonProps) => {
  const [isHelperOpen, setIsHelperOpen] = useState(false)
  const isDisabled = Boolean(buttonProps.disabled)

  const resolvedAriaLabel = useMemo(() => {
    if (ariaLabel) {
      return ariaLabel
    }

    if (typeof text === 'string' || typeof text === 'number') {
      return String(text)
    }

    return undefined
  }, [ariaLabel, text])

  const iconElement = React.cloneElement(icon, {
    sx: [
      {
        width: 22,
        height: 22,
        color: 'inherit',
      },
      ...((icon.props.sx
        ? Array.isArray(icon.props.sx)
          ? icon.props.sx
          : [icon.props.sx]
        : []) as SxProps<Theme>[]),
    ],
  })

  return (
    <Box
      sx={[
        {
          width: '100%',
          minHeight: '4.5rem',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          color: '#fff',
          boxShadow: 'none',
          transition: 'background-color 140ms ease, border-color 140ms ease',
          ...(isDisabled
            ? {
                color: 'rgba(255,255,255,0.65)',
                borderColor: 'rgba(255,255,255,0.14)',
                backgroundColor: 'rgba(255,255,255,0.07)',
              }
            : {
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  boxShadow: 'none',
                },
              }),
          '& .MuiIconButton-root.Mui-disabled': {
            color: 'rgba(255,255,255,0.5)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Button
        aria-label={resolvedAriaLabel}
        color="inherit"
        {...buttonProps}
        sx={{
          flex: 1,
          minHeight: '4.5rem',
          px: '1rem',
          py: '0.875rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          textTransform: 'none',
          borderRadius: 'inherit',
          color: 'inherit',
          backgroundColor: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            color: 'inherit',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            minWidth: 0,
            flex: 1,
          }}
        >
          <Box
            sx={[
              {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              },
              ...(Array.isArray(iconWrapperSx)
                ? iconWrapperSx
                : [iconWrapperSx]),
            ]}
          >
            {iconElement}
          </Box>
          <Typography
            sx={[
              {
                typography: 'h4',
                color: 'inherit',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: 1.2,
              },
              ...(Array.isArray(textSx) ? textSx : [textSx]),
            ]}
          >
            {text}
          </Typography>
        </Box>
      </Button>

      {helperText && (
        <ClickAwayListener onClickAway={() => setIsHelperOpen(false)}>
          <Box
            sx={{
              pr: '0.875rem',
              pl: 0.25,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Tooltip
              title={helperText}
              open={isHelperOpen || undefined}
              onOpen={() => setIsHelperOpen(true)}
              onClose={() => setIsHelperOpen(false)}
              arrow
              placement="top"
            >
              <IconButton
                size="small"
                aria-label={helperAriaLabel ?? 'Show more information'}
                disabled={isDisabled}
                onMouseEnter={() => setIsHelperOpen(true)}
                onMouseLeave={() => setIsHelperOpen(false)}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setIsHelperOpen((prev) => !prev)
                }}
                sx={{
                  color: 'inherit',
                  p: 0.25,
                }}
              >
                <InfoCircleFilled sx={{ width: 18, height: 18 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      )}
    </Box>
  )
}

export default IconTextButton
