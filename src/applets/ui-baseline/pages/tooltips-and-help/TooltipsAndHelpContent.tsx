import type React from 'react'

import { Box } from '#/common/style/theme'
import AppTooltip, {
  type AppTooltipSide,
  type AppTooltipTriggerProps,
} from '#/components/common/AppTooltip'
import { IconButton, type IconButtonProps } from '#/components/common/Button'
import Info from '#/components/icons/Info'
import QuestionCircleOutline from '#/components/icons/QuestionCircleOutline'

import { BaselineExample, BaselineSection } from '../BaselineContent'

const TOOLTIP_SIDES = ['top', 'right', 'bottom', 'left'] as const

const TOOLTIP_SIDE_LABELS: Record<AppTooltipSide, string> = {
  top: 'Top',
  right: 'Right',
  bottom: 'Bottom',
  left: 'Left',
}

const TOOLTIP_COPY: Record<AppTooltipSide, string> = {
  top: 'Top help tooltip',
  right: 'Right info tooltip',
  bottom: 'Bottom help tooltip',
  left: 'Left info tooltip',
}

const isHorizontalSide = (side: AppTooltipSide) =>
  side === 'left' || side === 'right'

const getIconKind = (side: AppTooltipSide) =>
  isHorizontalSide(side) ? 'info' : 'help'

const tooltipPopupSx = {
  maxWidth: 176,
  textAlign: 'center',
} as const

const tooltipButtonSx = {
  width: 36,
  minWidth: 36,
  height: 36,
  borderRadius: '50%',
  border: '1px solid #D7E3CD',
  backgroundColor: '#F4F8F0',
  color: '#0D6044',
  '&:hover': {
    backgroundColor: '#E7F1DF',
  },
  '&:focus-visible, &[data-focus-visible="true"]': {
    outlineOffset: 3,
  },
} as const

type TooltipIconButtonProps = {
  triggerProps: AppTooltipTriggerProps
  ariaLabel: string
  iconKind: 'help' | 'info'
  dataSlot: string
}

const TooltipIconButton = ({
  triggerProps,
  ariaLabel,
  iconKind,
  dataSlot,
}: TooltipIconButtonProps) => {
  const { ref, ...restTriggerProps } = triggerProps

  return (
    <IconButton
      {...(restTriggerProps as Omit<IconButtonProps, 'children'>)}
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      size="small"
      aria-label={ariaLabel}
      data-slot={dataSlot}
      sx={tooltipButtonSx}
    >
      {iconKind === 'info' ? (
        <Info sx={{ width: 18, height: 18 }} />
      ) : (
        <QuestionCircleOutline sx={{ width: 18, height: 18 }} />
      )}
    </IconButton>
  )
}

const renderTooltipButton =
  ({
    ariaLabel,
    iconKind,
    dataSlot,
  }: {
    ariaLabel: string
    iconKind: 'help' | 'info'
    dataSlot: string
  }) =>
  (triggerProps: AppTooltipTriggerProps) => (
    <TooltipIconButton
      triggerProps={triggerProps}
      ariaLabel={ariaLabel}
      iconKind={iconKind}
      dataSlot={dataSlot}
    />
  )

const DirectionExampleFrame = ({
  side,
  children,
}: {
  side: AppTooltipSide
  children: React.ReactNode
}) => {
  const horizontal = isHorizontalSide(side)

  return (
    <Box
      data-slot={`ui-baseline-tooltip-frame-${side}`}
      sx={{
        minHeight: {
          mobile: horizontal ? '8rem' : '7.5rem',
          desktop: horizontal ? '7rem' : '8rem',
        },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: {
          mobile: horizontal ? '4rem' : '1rem',
          desktop: horizontal ? '5rem' : '1rem',
        },
        py: {
          mobile: horizontal ? '1.25rem' : '3rem',
          desktop: horizontal ? '1.25rem' : '3rem',
        },
        border: '1px dashed #D7D7D7',
        borderRadius: '6px',
        backgroundColor: '#FBFBFB',
        overflow: 'visible',
      }}
    >
      {children}
    </Box>
  )
}

const OpenDirectionExample = ({ side }: { side: AppTooltipSide }) => (
  <BaselineExample
    title={`${TOOLTIP_SIDE_LABELS[side]} direction forced open`}
    minHeight={isHorizontalSide(side) ? '8.75rem' : '9.5rem'}
  >
    <DirectionExampleFrame side={side}>
      <AppTooltip
        title={TOOLTIP_COPY[side]}
        side={side}
        open
        popupDataSlot={`ui-baseline-tooltip-open-${side}`}
        popupSx={tooltipPopupSx}
      >
        {renderTooltipButton({
          ariaLabel: `${TOOLTIP_SIDE_LABELS[side]} direction forced-open tooltip button`,
          iconKind: getIconKind(side),
          dataSlot: `ui-baseline-tooltip-open-trigger-${side}`,
        })}
      </AppTooltip>
    </DirectionExampleFrame>
  </BaselineExample>
)

const HoverDirectionExample = ({ side }: { side: AppTooltipSide }) => (
  <BaselineExample
    title={`${TOOLTIP_SIDE_LABELS[side]} direction hover and focus`}
    minHeight={isHorizontalSide(side) ? '7.75rem' : '8.5rem'}
  >
    <DirectionExampleFrame side={side}>
      <AppTooltip
        title={TOOLTIP_COPY[side]}
        side={side}
        popupDataSlot={`ui-baseline-tooltip-hover-${side}`}
        popupSx={tooltipPopupSx}
      >
        {renderTooltipButton({
          ariaLabel: `${TOOLTIP_SIDE_LABELS[side]} direction hover tooltip button`,
          iconKind: getIconKind(side),
          dataSlot: `ui-baseline-tooltip-hover-trigger-${side}`,
        })}
      </AppTooltip>
    </DirectionExampleFrame>
  </BaselineExample>
)

const TooltipsAndHelpContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Forced-open helper and info tooltips">
      {TOOLTIP_SIDES.map((side) => (
        <OpenDirectionExample key={side} side={side} />
      ))}
    </BaselineSection>

    <BaselineSection title="Hover and focus helper and info tooltips">
      {TOOLTIP_SIDES.map((side) => (
        <HoverDirectionExample key={side} side={side} />
      ))}
    </BaselineSection>
  </Box>
)

export default TooltipsAndHelpContent
