import React from 'react'
import { Box, Collapse, SxProps, Theme, Typography } from '@mui/material'

import { ArrowDown } from '#/components/icons'

type Props = {
  id: string
  title: React.ReactNode
  ariaLabel: string
  children?: React.ReactNode
  backgroundImageSrc?: string
  defaultExpanded?: boolean
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  onTransitionEnd?: () => void
  sx?: SxProps<Theme>
  headerSx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

const LayerMenuAccordion = ({
  id,
  title,
  ariaLabel,
  children,
  backgroundImageSrc,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  onTransitionEnd,
  sx,
  headerSx,
  contentSx,
}: Props) => {
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded
  const buttonId = `${id}-button`
  const contentId = `${id}-content`

  const handleToggle = () => {
    const nextExpanded = !isExpanded

    if (expanded == null) {
      setInternalExpanded(nextExpanded)
    }

    onExpandedChange?.(nextExpanded)
  }

  return (
    <Box
      sx={[
        {
          width: '100%',
          textAlign: 'left',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box
        id={buttonId}
        component="button"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={handleToggle}
        sx={[
          {
            p: 0,
            m: 0,
            width: '100%',
            height: '4.375rem',
            minHeight: '4.375rem',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            overflow: 'hidden',
            border: '0.2px solid #ffffff',
            borderRadius: '0.125rem',
            color: '#111111',
            cursor: 'pointer',
            textAlign: 'left',
            backgroundColor: 'neutral.light',
            backgroundImage: backgroundImageSrc
              ? `linear-gradient(90deg, rgba(255, 255, 255, 0.86) 16%, rgba(255, 255, 255, 0.36) 53%, rgba(255, 255, 255, 0) 100%), url("${backgroundImageSrc}")`
              : 'linear-gradient(90deg, rgba(255, 255, 255, 0.86) 16%, rgba(255, 255, 255, 0.36) 53%, rgba(255, 255, 255, 0) 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
            '&:focus-visible': {
              outline: (theme: Theme) =>
                `2px solid ${theme.palette.secondary.dark}`,
              outlineOffset: '2px',
            },
          },
          ...(Array.isArray(headerSx) ? headerSx : headerSx ? [headerSx] : []),
        ]}
      >
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,
            px: '1.625rem',
            color: '#111111',
            fontSize: '0.75rem',
            fontWeight: 700,
            lineHeight: '1.125rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>
        <Box
          component="span"
          aria-hidden="true"
          sx={{
            position: 'relative',
            zIndex: 1,
            mr: '0.625rem',
            width: '1.25rem',
            height: '1.25rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'common.white',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.12)',
            flexShrink: 0,
          }}
        >
          <ArrowDown
            sx={{
              width: 9,
              height: 5,
              color: '#075CFF',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </Box>
      </Box>
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        onEntered={onTransitionEnd}
        onExited={onTransitionEnd}
      >
        <Box
          id={contentId}
          role="region"
          aria-labelledby={buttonId}
          sx={[
            {
              borderBottom: '1px solid #D6D6D6',
            },
            ...(Array.isArray(contentSx)
              ? contentSx
              : contentSx
                ? [contentSx]
                : []),
          ]}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}

export default LayerMenuAccordion
