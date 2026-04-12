'use client'

import React, { useState } from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import { ArrowDown, ArrowUp } from '#/components/icons'
import NodeFlowButton, {
  NODE_FLOW_OUTER_OFFSET,
  NODE_FLOW_OUTER_WIDTH,
} from './NodeFlowButton'

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

const OPEN_SHELL_CONTENT_INSET = {
  mobile: '0.75rem',
  desktop: '0.875rem',
} as const

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
  sx,
  rowSx,
  bodySx,
}: NodeFlowAccordionProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen != null
  const isOpen = controlledOpen ?? internalOpen
  const resolvedTrailing =
    trailing === undefined ? (
      isOpen ? (
        <ArrowUp
          sx={{
            width: '0.5625rem',
            height: '0.286625rem',
            color: 'inherit',
          }}
        />
      ) : (
        <ArrowDown
          sx={{
            width: '0.5625rem',
            height: '0.286625rem',
            color: 'inherit',
          }}
        />
      )
    ) : (
      trailing
    )

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
          ml: NODE_FLOW_OUTER_OFFSET,
          width: NODE_FLOW_OUTER_WIDTH,
          minWidth: 0,
          transition:
            'margin 160ms cubic-bezier(.2,0,.2,1), width 160ms cubic-bezier(.2,0,.2,1)',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!isOpen && (
        <NodeFlowButton
          title={title}
          helper={helper}
          helperLeading={helperLeading}
          leading={leading}
          trailing={resolvedTrailing}
          onClick={handleToggle}
          ariaLabel={ariaLabel}
          ariaExpanded={isOpen}
          state="available"
          disableOuterOffset
          rowSx={rowSx}
        />
      )}

      {isOpen && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            minWidth: 0,
            px: OPEN_SHELL_CONTENT_INSET,
            pt: { mobile: '0.75rem', desktop: '0.875rem' },
            pb: { mobile: '1.125rem', desktop: '1.25rem' },
            border: '0.2px solid rgba(14, 97, 69, 0.45)',
            borderRadius: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.78)',
            boxShadow:
              'inset 0px 0.5px 1px 0px rgba(217, 217, 217, 0.7), 0px 4px 16px 0px rgba(17, 17, 17, 0.03)',
          }}
        >
          <NodeFlowButton
            title={title}
            helper={helper}
            helperLeading={helperLeading}
            leading={leading}
            trailing={resolvedTrailing}
            onClick={handleToggle}
            ariaLabel={ariaLabel}
            ariaExpanded={isOpen}
            state="active"
            disableOuterOffset
            rowSx={[
              {
                minHeight: '1.125rem',
                px: 0,
                py: 0,
                border: 'none',
                borderRadius: 0,
                backgroundColor: 'transparent',
                boxShadow: 'none',
                '&:hover': {
                  transform: 'none',
                  backgroundColor: 'transparent',
                },
              },
              ...(Array.isArray(rowSx) ? rowSx : [rowSx]),
            ]}
          />

          {children != null && (
            <Box
              sx={[
                {
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  width: '100%',
                  pt: '1rem',
                },
                ...(Array.isArray(bodySx) ? bodySx : [bodySx]),
              ]}
            >
              {children}
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}

const NodeFlowAccordion = NodeFlowAccordionBase as NodeFlowAccordionComponent

NodeFlowAccordion.flowNodeMarker = 'flow-node'

export default NodeFlowAccordion
