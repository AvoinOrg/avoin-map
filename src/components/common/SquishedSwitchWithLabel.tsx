import * as React from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import type { SwitchProps } from '#/components/common/Switch'

type SquishedSwitchWithLabelProps = Omit<SwitchProps, 'styleProps'> & {
  children?: React.ReactNode
  ariaLabel?: string
  checkedTrackColor?: string
  styleProps?: PandaStyleProp
  controlSx?: PandaStyleProp
  labelSx?: PandaStyleProp
}

const SquishedSwitchWithLabel = ({
  children,
  ariaLabel,
  checkedTrackColor,
  styleProps,
  controlSx,
  labelSx,
  inputProps,
  ...rest
}: SquishedSwitchWithLabelProps) => {
  return (
    <SwitchWithLabel
      {...rest}
      ariaLabel={ariaLabel}
      checkedTrackColor={checkedTrackColor}
      inputProps={{
        ...inputProps,
        role: 'switch',
      }}
      thumbSize="0.375rem"
      thumbMargin="0.25rem"
      thumbTranslateX="1.25rem"
      styleProps={[
        {
          m: 0,
          width: '100%',
          minHeight: '0.875rem',
          display: 'flex',
          alignItems: 'center',
        },
        ...(Array.isArray(styleProps) ? styleProps : styleProps ? [styleProps] : []),
      ]}
      controlSx={[
        {
          '--switch-width': '2.125rem',
          '--switch-height': '0.875rem',
          flexShrink: 0,
          boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
        },
        ...(Array.isArray(controlSx)
          ? controlSx
          : controlSx
            ? [controlSx]
            : []),
      ]}
      labelSx={[
        {
          ml: '0.625rem',
        },
        ...(Array.isArray(labelSx) ? labelSx : labelSx ? [labelSx] : []),
      ]}
    >
      {children}
    </SwitchWithLabel>
  )
}

export default SquishedSwitchWithLabel
