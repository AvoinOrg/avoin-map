import * as React from 'react'
import { Collapsible } from '@base-ui/react/collapsible'

import { Box, toSxArray } from '#/common/style/theme'
import ArrowDown from '#/components/icons/ArrowDown'

type StyleProp = React.ComponentProps<typeof Box>['sx']
type StyleItem = Exclude<NonNullable<StyleProp>, readonly unknown[]>

const toStyleArray = (sx?: StyleProp) => toSxArray(sx) as StyleItem[]
const ButtonBox = Box as React.ElementType

type CustomAccordionSummaryProps = Omit<
  React.ComponentProps<typeof Collapsible.Trigger>,
  'children' | 'render'
> & {
  children: React.ReactNode
  expandIcon?: React.ReactNode
  sx?: StyleProp
}

const CustomAccordionSummary = ({
  expandIcon = <ArrowDown />,
  sx,
  children,
  'aria-label': ariaLabel,
  ...accordionSummaryProps
}: CustomAccordionSummaryProps) => {
  return (
    <Collapsible.Trigger
      {...accordionSummaryProps}
      aria-label={ariaLabel}
      render={(triggerProps) => (
        <ButtonBox
          {...triggerProps}
          component="button"
          type="button"
          aria-label={ariaLabel}
          sx={[
            {
              width: '100%',
              p: 0,
              border: 0,
              backgroundColor: 'transparent',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'secondary.dark',
                outlineOffset: '2px',
              },
              '&:active': {
                backgroundColor: 'transparent',
              },
              '&[data-panel-open] .CustomAccordionSummary-expandIcon': {
                transform: 'rotate(180deg)',
              },
            },
            ...toStyleArray(sx),
          ]}
        >
          <Box
            component="span"
            sx={{
              width: '100%',
              display: 'flex',
              flexGrow: 1,
            }}
          >
            {children}
          </Box>
          {expandIcon && (
            <Box
              component="span"
              className="CustomAccordionSummary-expandIcon"
              aria-hidden="true"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 150ms ease',
              }}
            >
              {expandIcon}
            </Box>
          )}
        </ButtonBox>
      )}
    />
  )
}

export default CustomAccordionSummary
