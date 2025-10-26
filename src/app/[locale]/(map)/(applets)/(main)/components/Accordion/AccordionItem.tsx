import React, { useState } from 'react'
import { Box, Collapse, IconButton, Typography, useTheme } from '@mui/material'
import { EyeButton } from '#/components/common/EyeButton'
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

export const AccordionItem = ({
  layerConf,
  name,
  color,
  children,
}: AccordionItemProps) => {
  const theme = useTheme()
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

  return (
    <>
      <Box
        onClick={handleToggleExpand}
        sx={{
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
        />
        <Typography
          sx={{
            flexGrow: 1,
            typography: 'body1',
            fontSize: '0.6875rem',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: '1.4',
            letterSpacing: '0.06875rem',
            pr: 2,
          }}
        >
          {name}
        </Typography>
        {children && (
          <Box
            sx={{
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
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Box
            sx={{
              typography: 'body2',
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
        </Collapse>
      )}
    </>
  )
}
