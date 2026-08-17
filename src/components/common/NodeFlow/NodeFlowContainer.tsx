import React from 'react'

import { Box, type AppSxProps, toSxArray } from '#/common/style/theme'
import FlowNode from '../FlowNode'
import { NODE_FLOW_MARKER_CENTER_X } from './NodeFlowButton'

export const NODE_FLOW_CONNECTOR_X = NODE_FLOW_MARKER_CENTER_X

type NodeFlowContainerSpacing =
  | string
  | number
  | { mobile?: string | number; desktop?: string | number }

export type NodeFlowContainerProps = {
  children: React.ReactNode
  spacing?: NodeFlowContainerSpacing
  sx?: AppSxProps
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

const NodeFlowContainer = ({
  children,
  spacing = '1.5rem',
  sx,
}: NodeFlowContainerProps) => {
  const childArray = React.Children.toArray(children)

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: spacing,
          width: '100%',
        },
        ...toSxArray(sx),
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
                  height: spacing,
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
