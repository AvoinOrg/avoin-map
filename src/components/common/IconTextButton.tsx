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

import QuestionCircleOutline from '#/components/icons/QuestionCircleOutline'

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
        width: 14,
        height: 14,
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
          minHeight: '1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#111111',
          ...(isDisabled
            ? {
                color: 'rgba(47,68,23,0.45)',
              }
            : {
                '&:hover': {
                  color: '#0D6044',
                },
              }),
          '& .MuiIconButton-root.Mui-disabled': {
            color: 'rgba(47,68,23,0.35)',
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
          minWidth: 0,
          minHeight: '1.125rem',
          px: 0,
          py: 0,
          justifyContent: 'flex-start',
          alignItems: 'center',
          textTransform: 'none',
          borderRadius: 0,
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
            gap: '1rem',
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
                width: '1.125rem',
                minWidth: '1.125rem',
                height: '1.125rem',
                color: '#0D6044',
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
                fontSize: '0.625rem',
                fontWeight: 700,
                color: 'inherit',
                textAlign: 'left',
                whiteSpace: 'normal',
                lineHeight: '1.125rem',
                letterSpacing: '0.1em',
                textTransform: 'none',
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
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1rem',
              minWidth: '1rem',
              height: '1.125rem',
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
                  color: '#95a086',
                  p: 0,
                  width: '1rem',
                  height: '1rem',
                }}
              >
                <QuestionCircleOutline sx={{ width: 16, height: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      )}
    </Box>
  )
}

export default IconTextButton
