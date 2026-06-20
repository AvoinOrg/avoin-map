import React, { useState } from 'react'
import { Collapsible } from '@base-ui/react/collapsible'

import { Box } from '#/common/style/theme/system'
import { EyeButton } from '#/components/common/EyeButton'
import { useLayerGroup } from '#/common/hooks/map/useLayerGroup'
import { LayerConf } from '#/common/types/map'
import { ArrowDown, ArrowUp } from '#/components/icons'

const DEFAULT_COLOR = 'darkgreen'
const ButtonBox = Box as React.ElementType

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

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={(rootProps) => <Box {...rootProps} sx={{ width: '100%' }} />}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          py: 1,
          pl: 3.5,
          pr: 5,
          height: 'auto',
          minHeight: '3.5rem',
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
        {children ? (
          <Collapsible.Trigger
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${name}`}
            render={(triggerProps) => (
              <ButtonBox
                {...triggerProps}
                component="button"
                type="button"
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                  p: 0,
                  m: 0,
                  border: 0,
                  background: 'transparent',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'left',
                  font: 'inherit',
                  cursor: 'pointer',
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'secondary.dark',
                    outlineOffset: '2px',
                  },
                }}
              >
                <Box
                  component="span"
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
                </Box>
                <Box
                  component="span"
                  sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isExpanded ? <ArrowUp /> : <ArrowDown />}
                </Box>
              </ButtonBox>
            )}
          />
        ) : (
          <Box
            component="span"
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
          </Box>
        )}
      </Box>
      {children && (
        <Collapsible.Panel
          render={(panelProps) => (
            <Box
              {...panelProps}
              sx={{
                height: 'var(--collapsible-panel-height)',
                overflow: 'hidden',
                transition: 'height 200ms ease',
                '&[data-starting-style], &[data-ending-style]': {
                  height: 0,
                },
              }}
            />
          )}
        >
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
        </Collapsible.Panel>
      )}
    </Collapsible.Root>
  )
}
