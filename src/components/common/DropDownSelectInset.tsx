import React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>

type DropDownSelectInsetProps = Omit<
  DropDownSelectProps,
  'label' | 'labelSx' | 'styleProps'
> & {
  label: React.ReactNode
  styleProps?: PandaStyleProp
  labelSx?: PandaStyleProp
  selectWrapperSx?: PandaStyleProp
}

const wrapperClass = css({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  minWidth: 0,
  gap: '0.875rem',
})

const pillClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '100%',
  minWidth: 0,
  height: '0.875rem',
  px: '0.625rem',
  borderRadius: '999px',
  backgroundColor: 'secondary.dark',
  color: 'neutral.light',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.625rem',
  fontWeight: 700,
  lineHeight: '0.875rem',
  letterSpacing: '0.1em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const labelClass = css({
  flex: 1,
  minWidth: 0,
  color: '#111111',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.625rem',
  fontWeight: 700,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const DropDownSelectInset = ({
  label,
  ariaLabel,
  styleProps,
  labelSx,
  selectSx,
  selectWrapperSx,
  renderSelectedValue,
  ...rest
}: DropDownSelectInsetProps) => {
  return (
    <div
      className={cx(wrapperClass, css(...pandaStylePropsToArray(styleProps)))}
      style={mergePandaStyleProps({ styleProps })}
    >
      <DropDownSelect
        {...rest}
        ariaLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        label={undefined}
        styleProps={[
          {
            width: '8.25rem',
            flexShrink: 0,
          },
          ...pandaStylePropsToArray(selectWrapperSx),
        ]}
        selectSx={[
          {
            height: '1.375rem',
            minHeight: '1.375rem',
            backgroundColor: 'common.white',
            boxShadow: 'none',
            py: 0,
            pl: '0.25rem',
            pr: '0.625rem',
          },
          ...pandaStylePropsToArray(selectSx),
        ]}
        iconSx={{
          width: '0.5rem',
          height: '0.25rem',
        }}
        renderSelectedValue={
          renderSelectedValue ??
          ((selectedOption, selectedValue) => (
            <span className={pillClass}>
              {selectedOption?.label ?? selectedValue}
            </span>
          ))
        }
      />
      <span
        className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
        style={mergePandaStyleProps({ styleProps: labelSx })}
      >
        {label}
      </span>
    </div>
  )
}

export default DropDownSelectInset
