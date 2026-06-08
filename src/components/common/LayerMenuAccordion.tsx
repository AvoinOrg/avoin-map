import React from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import { sharedFocusRing } from './formControlStyles'
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
  showBottomSeparator?: boolean
  sx?: PandaStyleProp
  headerSx?: PandaStyleProp
  contentSx?: PandaStyleProp
}

// Mirrors standalone layer-group row segments in LayerMenuContent.
const LAYER_MENU_ACCORDION_CONTENT_PX = 3
const layerMenuAccordionContentPadding = `${LAYER_MENU_ACCORDION_CONTENT_PX * 0.5}rem`

const rootClass = css({
  width: '100%',
  textAlign: 'left',
})

const triggerClass = css({
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
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
  '&:focus-visible': sharedFocusRing,
})

const titleClass = css({
  position: 'relative',
  zIndex: 1,
  px: '1.625rem',
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.75rem',
  fontWeight: 700,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
})

const arrowContainerClass = css({
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
})

const panelClass = css({
  overflow: 'hidden',
  height: 'var(--collapsible-panel-height)',
  opacity: 1,
  transition: 'height 200ms ease, opacity 200ms ease',
  '&[data-closed]': {
    height: 0,
    opacity: 0,
  },
})

const contentClass = css({
  width: '100%',
  boxSizing: 'border-box',
  px: LAYER_MENU_ACCORDION_CONTENT_PX,
})

const separatorClass = css({
  borderBottom: '1px solid #D6D6D6',
})

const separatorStyle = {
  borderBottom: '1px solid #D6D6D6',
} as const

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
  showBottomSeparator = true,
  sx,
  headerSx,
  contentSx,
}: Props) => {
  const [internalExpanded, setInternalExpanded] =
    React.useState(defaultExpanded)
  const isExpanded = expanded ?? internalExpanded
  const isControlled = expanded != null
  const buttonId = `${id}-button`
  const contentId = `${id}-content`
  const backgroundImage = backgroundImageSrc
    ? `linear-gradient(90deg, rgba(255, 255, 255, 0.86) 16%, rgba(255, 255, 255, 0.36) 53%, rgba(255, 255, 255, 0) 100%), url("${backgroundImageSrc}")`
    : 'linear-gradient(90deg, rgba(255, 255, 255, 0.86) 16%, rgba(255, 255, 255, 0.36) 53%, rgba(255, 255, 255, 0) 100%)'

  const handleOpenChange = (nextExpanded: boolean) => {
    if (!isControlled) {
      setInternalExpanded(nextExpanded)
    }

    onExpandedChange?.(nextExpanded)
  }

  return (
    <BaseCollapsible.Root
      open={isExpanded}
      onOpenChange={handleOpenChange}
      className={cx(rootClass, css(...pandaStylePropsToArray(sx)))}
      style={mergePandaStyleProps({ sx })}
    >
      <BaseCollapsible.Trigger
        id={buttonId}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className={cx(triggerClass, css(...pandaStylePropsToArray(headerSx)))}
        style={{
          backgroundImage,
          ...mergePandaStyleProps({ sx: headerSx }),
        }}
      >
        <span className={titleClass}>{title}</span>
        <span aria-hidden="true" className={arrowContainerClass}>
          <ArrowDown
            sx={{
              width: 9,
              height: 5,
              color: '#075CFF',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </span>
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel
        className={panelClass}
        onTransitionEnd={(event) => {
          if (
            event.target === event.currentTarget &&
            event.propertyName === 'height'
          ) {
            onTransitionEnd?.()
          }
        }}
      >
        <div
          id={contentId}
          role="region"
          aria-labelledby={buttonId}
          className={cx(contentClass, css(...pandaStylePropsToArray(contentSx)))}
          style={{
            paddingLeft: layerMenuAccordionContentPadding,
            paddingRight: layerMenuAccordionContentPadding,
            ...mergePandaStyleProps({ sx: contentSx }),
          }}
        >
          {children}
          {showBottomSeparator && (
            <div
              aria-hidden="true"
              className={separatorClass}
              style={separatorStyle}
            />
          )}
        </div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}

export default LayerMenuAccordion
