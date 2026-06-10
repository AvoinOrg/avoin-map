import React, { useId } from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { css, cx } from 'styled-system/css'

import { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { getContrastColor } from '#/common/utils/styling'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
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
  styleProps?: PandaStyleProp
  rowSx?: PandaStyleProp
  labelSx?: PandaStyleProp
  iconSx?: PandaStyleProp
}

type LayerToggleRowProps = SharedLayerToggleRowProps

type LayerToggleRowAccordionProps = SharedLayerToggleRowProps & {
  expanded: boolean
  children: React.ReactNode
  contentSx?: PandaStyleProp
}

type LayerToggleRowLinkProps = SharedLayerToggleRowProps & {
  linkAriaLabel: string
  linkProps: Omit<MutableLinkProps, 'children'>
  linkSx?: PandaStyleProp
}

const baseRowClass = css({
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
})

const labelClass = css({
  color: '#111111',
  flexGrow: 1,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
  whiteSpace: 'normal',
})

const ACCORDION_ROW_HORIZONTAL_PADDING_REM = 0.375
const ACCORDION_ROW_HORIZONTAL_PADDING = `${ACCORDION_ROW_HORIZONTAL_PADDING_REM}rem`
const ACCORDION_ROW_HORIZONTAL_MARGIN = `-${ACCORDION_ROW_HORIZONTAL_PADDING_REM}rem`
const ACCORDION_ROW_WIDTH = `calc(100% + ${
  ACCORDION_ROW_HORIZONTAL_PADDING_REM * 2
}rem)`

const coloredVisibleIconClass = css({
  width: 32,
  height: 24,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid',
})

const iconBoxClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
})

const rootClass = css({
  width: '100%',
})

const accordionRowWrapperClass = css({
  mx: ACCORDION_ROW_HORIZONTAL_MARGIN,
  width: ACCORDION_ROW_WIDTH,
})

const accordionPanelClass = css({
  width: '100%',
  overflow: 'hidden',
  height: 'var(--collapsible-panel-height)',
  opacity: 1,
  transition: 'height 160ms ease, opacity 160ms ease',
  '&[data-closed]': {
    height: 0,
    opacity: 0,
  },
})

const linkRowClass = css({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
})

const ColoredVisibleIcon = ({ color }: { color: string }) => {
  const contrastColor = getContrastColor(color)

  return (
    <span
      className={coloredVisibleIconClass}
      style={{
        background: color,
        borderColor: contrastColor,
      }}
    >
      <EyeOpen
        styleProps={{
          width: 24,
          height: 24,
          color: contrastColor,
        }}
      />
    </span>
  )
}

const LayerStatusIcon = ({
  status,
  color,
  styleProps,
}: {
  status: LayerGroupStatus
  color?: string
  styleProps?: PandaStyleProp
}) => {
  const iconBoxStyle = color
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
    <span
      className={cx(iconBoxClass, css(...pandaStylePropsToArray(styleProps)))}
      style={{
        ...iconBoxStyle,
        marginRight: color ? '0.75rem' : '0.3125rem',
        ...mergePandaStyleProps({ styleProps }),
      }}
    >
      {status === 'processing' && <LoadingHorizontal styleProps={iconSx} />}
      {status === 'hidden' && <EyeClosed styleProps={iconSx} />}
      {status === 'visible' &&
        (color ? <ColoredVisibleIcon color={color} /> : <EyeOpen styleProps={iconSx} />)}
    </span>
  )
}

const ToggleRowButton = ({
  label,
  status,
  onToggle,
  disabled = false,
  ariaLabel,
  color,
  styleProps,
  rowSx,
  labelSx,
  iconSx,
  children,
  expanded,
  controls,
  collapsibleTrigger = false,
}: SharedLayerToggleRowProps & {
  children?: React.ReactNode
  expanded?: boolean
  controls?: string
  collapsibleTrigger?: boolean
}) => {
  const buttonSx = [
    ...pandaStylePropsToArray(rowSx),
    ...pandaStylePropsToArray(styleProps),
  ]
  const sharedProps = {
    type: 'button' as const,
    'aria-label': ariaLabel,
    'aria-disabled': disabled || undefined,
    'aria-expanded': expanded,
    'aria-controls': controls,
    className: cx(
      baseRowClass,
      css(...pandaStylePropsToArray(rowSx)),
      css(...pandaStylePropsToArray(styleProps))
    ),
    style: mergePandaStyleProps({ styleProps: buttonSx }),
  }
  const contents = (
    <>
      <LayerStatusIcon status={status} color={color} styleProps={iconSx} />
      <span
        className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
        style={mergePandaStyleProps({ styleProps: labelSx })}
      >
        {label}
      </span>
      {children}
    </>
  )

  if (collapsibleTrigger) {
    return (
      <BaseCollapsible.Trigger {...sharedProps}>
        {contents}
      </BaseCollapsible.Trigger>
    )
  }

  return (
    <button {...sharedProps} onClick={disabled ? undefined : onToggle}>
      {contents}
    </button>
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
    <BaseCollapsible.Root
      open={expanded}
      disabled={props.disabled}
      onOpenChange={(nextExpanded) => {
        if (nextExpanded !== expanded && !props.disabled) {
          props.onToggle()
        }
      }}
      className={rootClass}
    >
      <div className={accordionRowWrapperClass}>
        <ToggleRowButton
          {...props}
          expanded={expanded}
          controls={contentId}
          collapsibleTrigger
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
            ...pandaStylePropsToArray(rowSx),
          ]}
        >
          <CircleArrowRight
            aria-hidden="true"
            styleProps={{
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
      </div>
      <BaseCollapsible.Panel
        id={contentId}
        role="region"
        className={cx(
          accordionPanelClass,
          css(...pandaStylePropsToArray(contentSx))
        )}
        style={mergePandaStyleProps({ styleProps: contentSx })}
      >
        {children}
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

export const LayerToggleRowLink = ({
  label,
  status,
  onToggle,
  disabled = false,
  ariaLabel,
  color,
  styleProps,
  rowSx,
  labelSx,
  iconSx,
  linkAriaLabel,
  linkProps,
  linkSx,
}: LayerToggleRowLinkProps) => {
  const {
    onClick: linkOnClick,
    styleProps: linkStyleProps,
    ...restLinkProps
  } = linkProps

  return (
    <div
      className={cx(linkRowClass, css(...pandaStylePropsToArray(styleProps)))}
      style={mergePandaStyleProps({ styleProps })}
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
        styleProps={{
          flexGrow: 1,
          minWidth: 0,
        }}
      />
      <MutableLink
        {...restLinkProps}
        aria-label={linkAriaLabel}
        onClick={(event) => {
          event.stopPropagation()
          linkOnClick?.(event)
        }}
        styleProps={[
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
          ...pandaStylePropsToArray(linkStyleProps),
          ...pandaStylePropsToArray(linkSx),
        ]}
      >
        <CircleArrowRight
          aria-hidden="true"
          styleProps={{
            width: '1.5rem',
            height: '1.5rem',
            color: 'currentColor',
          }}
        />
      </MutableLink>
    </div>
  )
}
