import React from 'react'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import DropDownSelect from '#/components/common/DropDownSelect'

type DropDownSelectProps = React.ComponentProps<typeof DropDownSelect>
type DropDownSelectWithHeaderProps = DropDownSelectProps & {
  labelAction?: React.ReactNode
  headerSx?: PandaStyleProp
}

const wrapperClass = css({
  width: '100%',
})

const headerClass = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  maxWidth: '100%',
  px: '1rem',
  minHeight: '1.5rem',
  mb: '0.2rem',
})

const labelClass = css({
  minWidth: 0,
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '0.8125rem',
  letterSpacing: '0.11em',
  color: '#111111',
})

const actionClass = css({
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  lineHeight: 0,
})

const DropDownSelectWithHeader = ({
  ariaLabel,
  label,
  labelAction,
  headerSx,
  labelSx,
  sx,
  ...rest
}: DropDownSelectWithHeaderProps) => {
  return (
    <div
      className={cx(wrapperClass, css(...pandaStylePropsToArray(sx)))}
      style={mergePandaStyleProps({ sx })}
    >
      {label && (
        <div
          className={cx(headerClass, css(...pandaStylePropsToArray(headerSx)))}
          style={mergePandaStyleProps({ sx: headerSx })}
        >
          <span
            className={cx(labelClass, css(...pandaStylePropsToArray(labelSx)))}
            style={mergePandaStyleProps({ sx: labelSx })}
          >
            {label}
          </span>
          {labelAction && <span className={actionClass}>{labelAction}</span>}
        </div>
      )}
      <DropDownSelect
        sx={{ width: '100%' }}
        {...rest}
        ariaLabel={ariaLabel ?? (typeof label === 'string' ? label : undefined)}
        label={undefined}
      />
    </div>
  )
}

export default DropDownSelectWithHeader
