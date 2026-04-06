'use client'

import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import FlowNode, { FlowNodeProps } from './FlowNode'

type FlowNodeContainerProps = {
  children: React.ReactNode
  sx?: SxProps<Theme>
}

const isFlowNodeElement = (
  child: React.ReactNode
): child is React.ReactElement<FlowNodeProps> => {
  return (
    React.isValidElement(child) &&
    (child.type as { flowNodeMarker?: string }).flowNodeMarker ===
      FlowNode.flowNodeMarker
  )
}

const FlowNodeContainer = ({ children, sx }: FlowNodeContainerProps) => {
  const childArray = React.Children.toArray(children)

  return (
    <Box
      sx={[
        {
          '--flow-node-gap': '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
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
        const showConnector = isFlowNodeElement(nextChild)

        return React.cloneElement(child, { showConnector })
      })}
    </Box>
  )
}

export default FlowNodeContainer
