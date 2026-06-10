import React, { useId, useState } from 'react'
import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible'
import { css } from 'styled-system/css'

import { EyeButton } from '#/components/common/EyeButton'
import { Box } from '#/components/common/PandaBox'
import { useLayerGroup } from '#/common/hooks/map/useLayerGroup'
import { LayerConf } from '#/common/types/map'
import { ArrowDown, ArrowUp } from '#/components/icons'

const DEFAULT_COLOR = 'darkgreen'

interface AccordionItemProps {
  layerConf: LayerConf
  name: string
  color?: string
  children?: React.ReactNode
}

const panelClass = css({
  overflow: 'hidden',
  height: 'var(--collapsible-panel-height)',
  opacity: 1,
  transition: 'height 180ms ease, opacity 180ms ease',
  '&[data-closed]': {
    height: 0,
    opacity: 0,
  },
})

export const AccordionItem = ({
  layerConf,
  name,
  color,
  children,
}: AccordionItemProps) => {
  const generatedId = useId()
  const [isExpanded, setIsExpanded] = useState(false)
  const [layerGroupStatus, setEnabled] = useLayerGroup(
    layerConf.id,
    layerConf,
    {
      preload: true,
    }
  )

  const itemColor = color || layerConf.signatureColor || DEFAULT_COLOR

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEnabled(layerGroupStatus !== 'visible')
  }

  const handleToggleExpand = () => {
    if (children) {
      setIsExpanded(!isExpanded)
    }
  }

  const handleHeaderKeyDown = (event: React.KeyboardEvent) => {
    if (!children) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggleExpand()
    }
  }

  return (
    <BaseCollapsible.Root open={isExpanded}>
      <Box
        onClick={handleToggleExpand}
        role={children ? 'button' : undefined}
        tabIndex={children ? 0 : undefined}
        aria-controls={children ? generatedId : undefined}
        aria-expanded={children ? isExpanded : undefined}
        aria-label={
          children
            ? `${isExpanded ? 'Collapse' : 'Expand'} ${name}`
            : undefined
        }
        onKeyDown={handleHeaderKeyDown}
        styleProps={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          py: 1,
          pl: 3.5,
          pr: 5,
          height: 'auto',
          minHeight: '3.5rem',
          cursor: children ? 'pointer' : 'default',
          '&:hover': {
            backgroundColor: isExpanded ? 'neutral.main' : 'neutral.light',
          },
          ...(isExpanded && {
            backgroundColor: 'neutral.light',
          }),
        }}
      >
        <EyeButton
          onClick={handleToggleVisibility}
          color={itemColor}
          status={layerGroupStatus}
          ariaLabel={`${name}: ${
            layerGroupStatus === 'visible' ? 'Hide layer' : 'Show layer'
          }`}
        />
        <Box
          component="span"
          styleProps={{
            display: 'block',
            flexGrow: 1,
            fontSize: '0.6875rem',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '1.4',
            letterSpacing: '0.06875rem',
            pr: 2,
          }}
        >
          {name}
        </Box>
        {children && (
          <Box
            styleProps={{
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isExpanded ? <ArrowUp /> : <ArrowDown />}
          </Box>
        )}
      </Box>
      {children && (
        <BaseCollapsible.Panel
          id={generatedId}
          role="region"
          className={panelClass}
          keepMounted={false}
        >
          <Box
            styleProps={{
              fontSize: '0.6875rem',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '1.4',
              letterSpacing: '0.06875rem',
              textTransform: 'none',
              px: 5,
              pt: 2.5,
              pb: 5,
            }}
          >
            {children}
          </Box>
        </BaseCollapsible.Panel>
      )}
    </BaseCollapsible.Root>
  )
}
