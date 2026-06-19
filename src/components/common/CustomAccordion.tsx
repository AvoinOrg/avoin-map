import * as React from 'react'
import { Collapsible } from '@base-ui/react/collapsible'

import { Box, toSxArray } from '#/common/style/theme'

type StyleProp = React.ComponentProps<typeof Box>['sx']
type StyleItem = Exclude<NonNullable<StyleProp>, readonly unknown[]>

const toStyleArray = (sx?: StyleProp) => toSxArray(sx) as StyleItem[]

type CustomAccordionProps = Omit<
  React.ComponentProps<typeof Collapsible.Root>,
  | 'children'
  | 'defaultOpen'
  | 'onChange'
  | 'onOpenChange'
  | 'open'
  | 'render'
> & {
  children: React.ReactNode
  sx?: StyleProp
  expanded?: boolean
  defaultExpanded?: boolean
  onChange?: (event: React.SyntheticEvent, expanded: boolean) => void
}

const CustomAccordion = ({
  children,
  sx,
  expanded,
  defaultExpanded,
  onChange,
  ...accordionProps
}: CustomAccordionProps) => {
  return (
    <Collapsible.Root
      {...accordionProps}
      open={expanded}
      defaultOpen={defaultExpanded}
      onOpenChange={(open, eventDetails) => {
        onChange?.(
          eventDetails.event as unknown as React.SyntheticEvent,
          open
        )
      }}
      render={(rootProps) => (
        <Box
          {...rootProps}
          sx={[
            {
              width: '100%',
              backgroundColor: 'background.paper',
              ':before': {
                opacity: 0,
              },
              '&[data-open]': {
                margin: 'auto',
                backgroundColor: 'primary.lighter',
              },
              '&:before': {
                display: 'none',
              },
            },
            ...toStyleArray(sx),
          ]}
        />
      )}
    >
      {children}
    </Collapsible.Root>
  )
}

export default CustomAccordion
