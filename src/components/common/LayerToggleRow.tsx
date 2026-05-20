import React, { useId } from 'react'
import { Box, Collapse, SxProps, Theme, Typography } from '@mui/material'

import { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { getContrastColor } from '#/common/utils/styling'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import MutableLink from '#/components/common/MutableLink'
import { CircleArrowRight, EyeClosed, EyeOpen } from '#/components/icons'

type MutableLinkProps = React.ComponentProps<typeof MutableLink>

type SharedLayerToggleRowProps = {
  label: React.ReactNode
  status: LayerGroupStatus
  onToggle: () => void
  disabled?: boolean
  ariaLabel?: string
  color?: string
  sx?: SxProps<Theme>
  rowSx?: SxProps<Theme>
  labelSx?: SxProps<Theme>
  iconSx?: SxProps<Theme>
}

type LayerToggleRowProps = SharedLayerToggleRowProps

type LayerToggleRowAccordionProps = SharedLayerToggleRowProps & {
  expanded: boolean
  children: React.ReactNode
  contentSx?: SxProps<Theme>
}

type LayerToggleRowLinkProps = SharedLayerToggleRowProps & {
  linkAriaLabel: string
  linkProps: Omit<MutableLinkProps, 'children'>
  linkSx?: SxProps<Theme>
}

const BASE_ROW_SX = {
  width: '100%',
  minHeight: '1.125rem',
  p: 0,
  display: 'flex',
  alignItems: 'center',
  border: 0,
  background: 'transparent',
  color: '#111111',
  textAlign: 'left',
  font: 'inherit',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid #111111',
    outlineOffset: '0.25rem',
  },
  '&[aria-disabled="true"]': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}

const LABEL_SX = {
  color: '#111111',
  flexGrow: 1,
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
  whiteSpace: 'normal',
}

const ACCORDION_ROW_HORIZONTAL_PADDING_REM = 0.375
const ACCORDION_ROW_HORIZONTAL_PADDING = `${ACCORDION_ROW_HORIZONTAL_PADDING_REM}rem`
const ACCORDION_ROW_HORIZONTAL_MARGIN = `-${ACCORDION_ROW_HORIZONTAL_PADDING_REM}rem`
const ACCORDION_ROW_WIDTH = `calc(100% + ${
  ACCORDION_ROW_HORIZONTAL_PADDING_REM * 2
}rem)`

const ColoredVisibleIcon = ({ color }: { color: string }) => {
  const contrastColor = getContrastColor(color)

  return (
    <Box
      sx={{
        width: 32,
        height: 24,
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: contrastColor,
      }}
    >
      <EyeOpen
        sx={{
          width: 24,
          height: 24,
          color: contrastColor,
        }}
      />
    </Box>
  )
}

const LayerStatusIcon = ({
  status,
  color,
  sx,
}: {
  status: LayerGroupStatus
  color?: string
  sx?: SxProps<Theme>
}) => {
  const iconBoxSx = color
    ? {
        width: '32px',
        height: '24px',
      }
    : {
        width: '1.5rem',
        height: '1.125rem',
      }

  const iconSx = color
    ? {
        width: '24px',
        height: '24px',
      }
    : {
        width: '1rem',
        height: '1rem',
      }

  return (
    <Box
      sx={[
        {
          ...iconBoxSx,
          mr: color ? '0.75rem' : '0.3125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {status === 'processing' && <LoadingHorizontal sx={iconSx} />}
      {status === 'hidden' && <EyeClosed sx={iconSx} />}
      {status === 'visible' &&
        (color ? <ColoredVisibleIcon color={color} /> : <EyeOpen sx={iconSx} />)}
    </Box>
  )
}

const ToggleRowButton = ({
  label,
  status,
  onToggle,
  disabled = false,
  ariaLabel,
  color,
  sx,
  rowSx,
  labelSx,
  iconSx,
  children,
  expanded,
  controls,
}: SharedLayerToggleRowProps & {
  children?: React.ReactNode
  expanded?: boolean
  controls?: string
}) => {
  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled ? 'true' : undefined}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={disabled ? undefined : onToggle}
      sx={[
        BASE_ROW_SX,
        ...(Array.isArray(rowSx) ? rowSx : [rowSx]),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <LayerStatusIcon status={status} color={color} sx={iconSx} />
      <Typography
        component="span"
        sx={[LABEL_SX, ...(Array.isArray(labelSx) ? labelSx : [labelSx])]}
      >
        {label}
      </Typography>
      {children}
    </Box>
  )
}

export const LayerToggleRow = (props: LayerToggleRowProps) => {
  return <ToggleRowButton {...props} />
}

export const LayerToggleRowAccordion = ({
  expanded,
  children,
  contentSx,
  rowSx,
  ...props
}: LayerToggleRowAccordionProps) => {
  const generatedId = useId()
  const contentId = `layer-toggle-row-accordion-${generatedId}`

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          mx: ACCORDION_ROW_HORIZONTAL_MARGIN,
          width: ACCORDION_ROW_WIDTH,
        }}
      >
        <ToggleRowButton
          {...props}
          expanded={expanded}
          controls={contentId}
          rowSx={[
            {
              px: ACCORDION_ROW_HORIZONTAL_PADDING,
            },
            expanded
              ? {
                  backgroundColor: '#e6efff',
                  borderRadius: '20px',
                }
              : {},
            ...(Array.isArray(rowSx) ? rowSx : [rowSx]),
          ]}
        >
          <CircleArrowRight
            aria-hidden="true"
            sx={{
              width: '0.75rem',
              height: '0.75rem',
              color: '#aeb6ad',
              ml: '1rem',
              flexShrink: 0,
              transform: expanded ? 'rotate(-90deg)' : 'rotate(90deg)',
              transition: 'transform 160ms ease',
            }}
          />
        </ToggleRowButton>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box
          id={contentId}
          sx={[
            {
              width: '100%',
            },
            ...(Array.isArray(contentSx) ? contentSx : [contentSx]),
          ]}
        >
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}

export const LayerToggleRowLink = ({
  label,
  status,
  onToggle,
  disabled = false,
  ariaLabel,
  color,
  sx,
  rowSx,
  labelSx,
  iconSx,
  linkAriaLabel,
  linkProps,
  linkSx,
}: LayerToggleRowLinkProps) => {
  return (
    <Box
      sx={[
        {
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <ToggleRowButton
        label={label}
        status={status}
        onToggle={onToggle}
        disabled={disabled}
        ariaLabel={ariaLabel}
        color={color}
        rowSx={rowSx}
        labelSx={labelSx}
        iconSx={iconSx}
        sx={{
          flexGrow: 1,
          minWidth: 0,
        }}
      />
      <MutableLink
        {...linkProps}
        aria-label={linkAriaLabel}
        onClick={(event) => {
          event.stopPropagation()
          linkProps.onClick?.(event)
        }}
        sx={{
          width: '2.5rem',
          height: '2.5rem',
          ml: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111111',
          borderRadius: '50%',
          '&:focus-visible': {
            outline: '2px solid #111111',
            outlineOffset: '-0.25rem',
          },
          ...(linkProps.sx as object),
          ...(linkSx as object),
        }}
      >
        <CircleArrowRight
          aria-hidden="true"
          sx={{
            width: '1.5rem',
            height: '1.5rem',
            color: 'currentColor',
          }}
        />
      </MutableLink>
    </Box>
  )
}
