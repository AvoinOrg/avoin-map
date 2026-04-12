'use client'

import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import FlowNode from '../FlowNode'

export const NODE_FLOW_CONNECTOR_X = '0.35rem'

export type NodeFlowContainerProps = {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

const isFlowNodeElement = (
  child: React.ReactNode
): child is React.ReactElement<{
  showConnector?: boolean
  showConnectorTop?: boolean
  showConnectorBottom?: boolean
}> => {
  return (
    React.isValidElement(child) &&
    (child.type as { flowNodeMarker?: string }).flowNodeMarker ===
      FlowNode.flowNodeMarker
  )
}

const NodeFlowContainer = ({ children, sx }: NodeFlowContainerProps) => {
  const childArray = React.Children.toArray(children)
  const nodeGap = { mobile: '1.5rem', desktop: '1.75rem' } as const

  return (
    <Box
      sx={[
        {
          '--flow-node-gap': nodeGap,
          display: 'flex',
          flexDirection: 'column',
          gap: nodeGap,
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {childArray.map((child, index) => {
        if (!isFlowNodeElement(child)) {
          return <React.Fragment key={index}>{child}</React.Fragment>
        }

        const nextChild = childArray[index + 1]

        return (
          <Box
            key={index}
            sx={{
              position: 'relative',
              width: '100%',
              minWidth: 0,
            }}
          >
            {child}

            {isFlowNodeElement(nextChild) && (
              <Box
                sx={{
                  position: 'absolute',
                  left: NODE_FLOW_CONNECTOR_X,
                  top: '100%',
                  height: 'var(--flow-node-gap, 1.5rem)',
                  transform: 'translateX(-50%)',
                  width: '1px',
                  backgroundColor: '#87BEA8',
                  pointerEvents: 'none',
                }}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

export default NodeFlowContainer
