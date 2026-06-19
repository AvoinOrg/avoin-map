import React from 'react'
import { Collapsible } from '@base-ui/react/collapsible'

import { Box, toSxArray } from '#/common/style/theme'
import { ArrowDown } from '#/components/icons'

type StyleProp = React.ComponentProps<typeof Box>['sx']
type StyleItem = Exclude<NonNullable<StyleProp>, readonly unknown[]>

const toStyleArray = (sx?: StyleProp) => toSxArray(sx) as StyleItem[]
const ButtonBox = Box as React.ElementType

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
  sx?: StyleProp
  headerSx?: StyleProp
  contentSx?: StyleProp
}

// Mirrors standalone layer-group row segments in LayerMenuContent.
const LAYER_MENU_ACCORDION_CONTENT_PX = 3

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
  const buttonId = `${id}-button`
  const contentId = `${id}-content`

  const handleExpandedChange = (nextExpanded: boolean) => {
    if (expanded == null) {
      setInternalExpanded(nextExpanded)
    }

    onExpandedChange?.(nextExpanded)
  }

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (
      event.target === event.currentTarget &&
      event.propertyName === 'height'
    ) {
      onTransitionEnd?.()
    }
  }

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={handleExpandedChange}
      render={(rootProps) => (
        <Box
          {...rootProps}
          sx={[
            {
              width: '100%',
              textAlign: 'left',
            },
            ...toStyleArray(sx),
          ]}
        />
      )}
    >
      <Collapsible.Trigger
        id={buttonId}
        aria-label={ariaLabel}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        render={(triggerProps) => (
          <ButtonBox
            {...triggerProps}
            id={buttonId}
            component="button"
            type="button"
            aria-label={ariaLabel}
            aria-expanded={isExpanded}
            aria-controls={contentId}
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
                  outline: '2px solid',
                  outlineColor: 'secondary.dark',
                  outlineOffset: '2px',
                },
              },
              ...toStyleArray(headerSx),
            ]}
          >
            <Box
              component="span"
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
            </Box>
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
          </ButtonBox>
        )}
      />
      <Collapsible.Panel
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        onTransitionEnd={handleTransitionEnd}
        render={(panelProps) => (
          <Box
            {...panelProps}
            id={contentId}
            role="region"
            aria-labelledby={buttonId}
            sx={[
              {
                width: '100%',
                boxSizing: 'border-box',
                px: LAYER_MENU_ACCORDION_CONTENT_PX,
                height: 'var(--collapsible-panel-height)',
                overflow: 'hidden',
                transition: 'height 200ms ease',
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
        {showBottomSeparator && (
          <Box
            aria-hidden="true"
            sx={{
              borderBottom: '1px solid #D6D6D6',
            }}
          />
        )}
      </Collapsible.Panel>
    </Collapsible.Root>
  )
}

export default LayerMenuAccordion
