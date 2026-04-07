'use client'

import React, { useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import NodeFlowButton from './NodeFlowButton'

export type NodeFlowAccordionProps = {
  title: React.ReactNode
  helper?: React.ReactNode
  helperLeading?: React.ReactNode
  leading?: React.ReactNode
  trailing?: React.ReactNode | null
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  ariaLabel?: string
  showConnector?: boolean
  showConnectorTop?: boolean
  showConnectorBottom?: boolean
  sx?: SxProps<Theme>
  rowSx?: SxProps<Theme>
  bodySx?: SxProps<Theme>
}

type NodeFlowAccordionComponent = React.FC<NodeFlowAccordionProps> & {
  flowNodeMarker?: string
}

const NodeFlowAccordionBase = ({
  title,
  helper,
  helperLeading,
  leading,
  trailing,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  children,
  ariaLabel,
  showConnector = false,
  showConnectorTop = false,
  showConnectorBottom,
  sx,
  rowSx,
  bodySx,
}: NodeFlowAccordionProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen != null
  const isOpen = controlledOpen ?? internalOpen
  const shouldShowConnectorBottom = showConnectorBottom ?? showConnector

  const handleToggle = () => {
    const nextOpen = !isOpen

    if (!isControlled) {
      setInternalOpen(nextOpen)
    }

    onOpenChange?.(nextOpen)
  }

  return (
    <Box
      sx={[
        {
          ml: { mobile: '-0.75rem', desktop: '-0.875rem' },
          width: {
            mobile: 'calc(100% + 1.5rem)',
            desktop: 'calc(100% + 1.75rem)',
          },
          minWidth: 0,
          transition:
            'margin 160ms cubic-bezier(.2,0,.2,1), width 160ms cubic-bezier(.2,0,.2,1)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <NodeFlowButton
        title={title}
        helper={helper}
        helperLeading={helperLeading}
        leading={leading}
        trailing={trailing}
        onClick={handleToggle}
        ariaLabel={ariaLabel}
        ariaExpanded={isOpen}
        state={isOpen ? 'active' : 'available'}
        showConnectorTop={!isOpen && showConnectorTop}
        showConnectorBottom={!isOpen && shouldShowConnectorBottom}
        disableOuterOffset
        rowSx={rowSx}
      />

      {isOpen && children != null && (
        <Box
          sx={[
            {
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              width: '100%',
              pt: '0.875rem',
              pb: { mobile: '1.25rem', desktop: '1.375rem' },
            },
            ...(Array.isArray(bodySx) ? bodySx : [bodySx]),
          ]}
        >
          {children}
        </Box>
      )}
    </Box>
  )
}

const NodeFlowAccordion = NodeFlowAccordionBase as NodeFlowAccordionComponent

NodeFlowAccordion.flowNodeMarker = 'flow-node'

export default NodeFlowAccordion
