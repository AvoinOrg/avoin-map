import React from 'react'

import AppTooltip, {
  type AppTooltipSide,
} from '#/components/common/AppTooltip'

export type SidebarPanelExtensionTooltipSide = AppTooltipSide
export type SidebarPanelExtensionTooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLButtonElement>,
  'color'
> & {
  ref?: React.Ref<HTMLButtonElement>
}

export type SidebarPanelExtensionTooltipProps = {
  title: React.ReactNode
  side?: SidebarPanelExtensionTooltipSide
  children: (
    props: SidebarPanelExtensionTooltipTriggerProps
  ) => React.ReactElement
}

export const SidebarPanelExtensionTooltip = ({
  title,
  side = 'right',
  children,
}: SidebarPanelExtensionTooltipProps) => (
  <AppTooltip
    title={title}
    side={side}
    delay={0}
    closeDelay={0}
    popupSx={{ px: 1 }}
  >
    {(triggerProps) =>
      children(triggerProps as SidebarPanelExtensionTooltipTriggerProps)
    }
  </AppTooltip>
)

export default SidebarPanelExtensionTooltip
