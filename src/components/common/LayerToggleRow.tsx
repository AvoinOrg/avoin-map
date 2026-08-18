import React, { useId } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'

import { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { Box, toSxArray } from '#/common/style/theme'
import { getContrastColor } from '#/common/utils/styling'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import {
  AppRouteLink,
  type AppRouteLinkProps,
} from '#/common/navigation/appRouteLinks'
import { CircleArrowRight, EyeClosed, EyeOpen } from '#/components/icons'

type StyleProp = React.ComponentProps<typeof Box>['sx']
type StyleItem = Exclude<NonNullable<StyleProp>, readonly unknown[]>

const toStyleArray = (sx?: StyleProp) => toSxArray(sx) as StyleItem[]
const ButtonBox = Box as React.ElementType

type SharedLayerToggleRowProps = {
  label: React.ReactNode
  status: LayerGroupStatus
  onToggle: () => void
  disabled?: boolean
  ariaLabel?: string
  color?: string
  sx?: StyleProp
  rowSx?: StyleProp
  labelSx?: StyleProp
  iconSx?: StyleProp
}

type LayerToggleRowProps = SharedLayerToggleRowProps

type LayerToggleRowAccordionProps = SharedLayerToggleRowProps & {
  expanded: boolean
  children: React.ReactNode
  contentSx?: StyleProp
  applyNegativeMargins?: boolean
}

type LayerToggleRowLinkProps = SharedLayerToggleRowProps & {
  linkAriaLabel: string
  linkProps: Omit<AppRouteLinkProps, 'children'>
  linkSx?: StyleProp
}

const LAYER_ROW_MIN_HEIGHT = { mobile: '2rem', desktop: '1.75rem' }
const LAYER_ROW_HORIZONTAL_PADDING_REM = 0.375
const LAYER_ROW_HORIZONTAL_PADDING = `${LAYER_ROW_HORIZONTAL_PADDING_REM}rem`
const LAYER_STATUS_ICON_SLOT_WIDTH = '2rem'
const LAYER_STATUS_ICON_SLOT_HEIGHT = '1.5rem'
const LAYER_STATUS_ICON_SIZE_REM = 1
const LAYER_STATUS_ICON_SIZE = `${LAYER_STATUS_ICON_SIZE_REM}rem`
const LAYER_STATUS_ICON_HIGHLIGHT_WIDTH_REM = 1.5
const LAYER_STATUS_ICON_HIGHLIGHT_WIDTH = `${LAYER_STATUS_ICON_HIGHLIGHT_WIDTH_REM}rem`
const LAYER_STATUS_ICON_HIGHLIGHT_HEIGHT = '1rem'
const LAYER_COLORED_VISIBLE_EYE_OFFSET = `${
  (LAYER_STATUS_ICON_SIZE_REM - LAYER_STATUS_ICON_HIGHLIGHT_WIDTH_REM) / 2
}rem`
const LAYER_STATUS_ICON_SLOT_MARGIN_RIGHT = '0.75rem'
const LAYER_TRAILING_ACTION_SLOT_SIZE = '1.75rem'
const LAYER_TRAILING_ACTION_ICON_SIZE = '1rem'
const LAYER_TRAILING_ACTION_MARGIN_LEFT = '0.75rem'

const BASE_ROW_SX = {
  width: '100%',
  minHeight: LAYER_ROW_MIN_HEIGHT,
  py: { mobile: '0.125rem', desktop: 0 },
  px: LAYER_ROW_HORIZONTAL_PADDING,
  boxSizing: 'border-box',
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

const EDGE_ALIGNED_ROW_SX = {
  pl: 0,
}

const EDGE_ALIGNED_ICON_SX = {
  justifyContent: 'flex-start',
}

const NEGATIVE_MARGIN_ACCORDION_ROW_SX = {
  mx: `-${LAYER_ROW_HORIZONTAL_PADDING}`,
  width: `calc(100% + ${LAYER_ROW_HORIZONTAL_PADDING_REM * 2}rem)`,
}

const TRAILING_ACTION_SLOT_SX = {
  width: LAYER_TRAILING_ACTION_SLOT_SIZE,
  height: LAYER_TRAILING_ACTION_SLOT_SIZE,
  ml: LAYER_TRAILING_ACTION_MARGIN_LEFT,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
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

const ColoredVisibleIcon = ({ color }: { color: string }) => {
  const contrastColor = getContrastColor(color)

  return (
    <Box
      data-slot="layer-visible-highlight"
      sx={{
        width: LAYER_STATUS_ICON_HIGHLIGHT_WIDTH,
        height: LAYER_STATUS_ICON_HIGHLIGHT_HEIGHT,
        boxSizing: 'border-box',
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
        data-slot="layer-colored-visible-eye"
        sx={{
          width: LAYER_STATUS_ICON_SIZE,
          height: LAYER_STATUS_ICON_SIZE,
          color: contrastColor,
          transform: `translateX(${LAYER_COLORED_VISIBLE_EYE_OFFSET})`,
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
  sx?: StyleProp
}) => {
  const iconSx = {
    width: LAYER_STATUS_ICON_SIZE,
    height: LAYER_STATUS_ICON_SIZE,
  }

  return (
    <Box
      data-slot="layer-status-icon-slot"
      sx={[
        {
          width: LAYER_STATUS_ICON_SLOT_WIDTH,
          height: LAYER_STATUS_ICON_SLOT_HEIGHT,
          mr: LAYER_STATUS_ICON_SLOT_MARGIN_RIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        ...toStyleArray(sx),
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
    <ButtonBox
      component="button"
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled ? 'true' : undefined}
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={disabled ? undefined : onToggle}
      sx={[
        BASE_ROW_SX,
        ...toStyleArray(rowSx),
        ...toStyleArray(sx),
      ]}
    >
      <LayerStatusIcon status={status} color={color} sx={iconSx} />
      <Box
        component="span"
        sx={[LABEL_SX, ...toStyleArray(labelSx)]}
      >
        {label}
      </Box>
      {children}
    </ButtonBox>
  )
}

export const LayerToggleRow = ({
  rowSx,
  iconSx,
  ...props
}: LayerToggleRowProps) => {
  return (
    <ToggleRowButton
      {...props}
      rowSx={[EDGE_ALIGNED_ROW_SX, ...toStyleArray(rowSx)]}
      iconSx={[EDGE_ALIGNED_ICON_SX, ...toStyleArray(iconSx)]}
    />
  )
}

export const LayerToggleRowAccordion = ({
  expanded,
  children,
  contentSx,
  applyNegativeMargins = false,
  rowSx,
  iconSx,
  ...props
}: LayerToggleRowAccordionProps) => {
  const generatedId = useId()
  const contentId = `layer-toggle-row-accordion-${generatedId}`

  return (
    <Collapsible.Root
      open={expanded}
      render={(rootProps) => <Box {...rootProps} sx={{ width: '100%' }} />}
    >
      <ToggleRowButton
        {...props}
        expanded={expanded}
        controls={contentId}
        rowSx={[
          applyNegativeMargins ? NEGATIVE_MARGIN_ACCORDION_ROW_SX : {},
          expanded
            ? {
                backgroundColor: '#e6efff',
                borderRadius: '0.875rem',
              }
            : {},
          ...toStyleArray(rowSx),
        ]}
        iconSx={[
          applyNegativeMargins ? EDGE_ALIGNED_ICON_SX : {},
          ...toStyleArray(iconSx),
        ]}
      >
        <Box
          component="span"
          aria-hidden="true"
          data-slot="layer-trailing-action-slot"
          sx={TRAILING_ACTION_SLOT_SX}
        >
          <CircleArrowRight
            sx={{
              width: LAYER_TRAILING_ACTION_ICON_SIZE,
              height: LAYER_TRAILING_ACTION_ICON_SIZE,
              color: '#aeb6ad',
              transform: expanded ? 'rotate(-90deg)' : 'rotate(90deg)',
              transition: 'transform 160ms ease',
            }}
          />
        </Box>
      </ToggleRowButton>
      <Collapsible.Panel
        id={contentId}
        render={(panelProps) => (
          <Box
            {...panelProps}
            id={contentId}
            sx={[
              {
                width: '100%',
                height: 'var(--collapsible-panel-height)',
                overflow: 'hidden',
                transition: 'height 160ms ease',
                '&[data-starting-style], &[data-ending-style]': {
                  height: 0,
                },
              },
              ...toStyleArray(contentSx),
            ]}
          />
        )}
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
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
  const {
    onClick: onLinkClick,
    onClickCapture: onLinkClickCapture,
    sx: linkPropsSx,
    ...restLinkProps
  } = linkProps

  return (
    <Box
      sx={[
        {
          width: '100%',
          display: 'flex',
          alignItems: 'center',
        },
        ...toStyleArray(sx),
      ]}
    >
      <ToggleRowButton
        label={label}
        status={status}
        onToggle={onToggle}
        disabled={disabled}
        ariaLabel={ariaLabel}
        color={color}
        rowSx={[EDGE_ALIGNED_ROW_SX, ...toStyleArray(rowSx)]}
        labelSx={labelSx}
        iconSx={[EDGE_ALIGNED_ICON_SX, ...toStyleArray(iconSx)]}
        sx={{ flexGrow: 1, minWidth: 0 }}
      />
      <AppRouteLink
        {...restLinkProps}
        aria-label={linkAriaLabel}
        data-slot="layer-trailing-action-slot"
        onClickCapture={(event) => {
          onLinkClickCapture?.(event)
        }}
        onClick={(event) => {
          event.stopPropagation()
          onLinkClick?.(event)
        }}
        sx={[
          {
            ...TRAILING_ACTION_SLOT_SX,
            color: '#111111',
            borderRadius: '50%',
            '&:focus-visible': {
              outline: '2px solid #111111',
              outlineOffset: '-0.125rem',
            },
          },
          ...toStyleArray(linkPropsSx as StyleProp),
          ...toStyleArray(linkSx),
        ]}
      >
        <CircleArrowRight
          aria-hidden="true"
          sx={{
            width: LAYER_TRAILING_ACTION_ICON_SIZE,
            height: LAYER_TRAILING_ACTION_ICON_SIZE,
            color: 'currentColor',
          }}
        />
      </AppRouteLink>
    </Box>
  )
}
