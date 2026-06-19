import React, { useId } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'

import { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { Box, toSxArray } from '#/common/style/theme'
import { getContrastColor } from '#/common/utils/styling'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import MutableLink from '#/components/common/MutableLink'
import { CircleArrowRight, EyeClosed, EyeOpen } from '#/components/icons'

type MutableLinkProps = React.ComponentProps<typeof MutableLink>
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
}

type LayerToggleRowLinkProps = SharedLayerToggleRowProps & {
  linkAriaLabel: string
  linkProps: Omit<MutableLinkProps, 'children'>
  linkSx?: StyleProp
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
  sx?: StyleProp
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
    <Collapsible.Root
      open={expanded}
      render={(rootProps) => <Box {...rootProps} sx={{ width: '100%' }} />}
    >
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
            ...toStyleArray(rowSx),
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
        rowSx={rowSx}
        labelSx={labelSx}
        iconSx={iconSx}
        sx={{ flexGrow: 1, minWidth: 0 }}
      />
      <MutableLink
        {...restLinkProps}
        aria-label={linkAriaLabel}
        onClickCapture={(event) => {
          onLinkClickCapture?.(event)
        }}
        onClick={(event) => {
          event.stopPropagation()
          onLinkClick?.(event)
        }}
        sx={[
          {
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
          },
          ...toStyleArray(linkPropsSx as StyleProp),
          ...toStyleArray(linkSx),
        ]}
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
