'use client'

import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'

import FlowNode from './FlowNode'

type NodeFlowContainerProps = {
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

        const previousChild = childArray[index - 1]
        const nextChild = childArray[index + 1]
        const showConnectorTop = isFlowNodeElement(previousChild)
        const showConnectorBottom = isFlowNodeElement(nextChild)

        return React.cloneElement(child, {
          showConnector: showConnectorBottom,
          showConnectorTop,
          showConnectorBottom,
        })
      })}
    </Box>
  )
}

export default NodeFlowContainer
