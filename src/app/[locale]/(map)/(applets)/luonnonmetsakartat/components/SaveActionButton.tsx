import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css, cx } from 'styled-system/css'

import type { PandaStyleProp } from '#/common/style/panda'
import { appTypography } from '#/common/style/theme/tokens'
import TText from '#/components/common/TText'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

import SaveIcon from './SaveIcon'

interface SaveActionButtonProps {
  keyName: string
  ariaLabel: string
  onClick: React.MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  sx?: PandaStyleProp
}

const buttonClass = css({
  m: 0,
  p: 0,
  border: 0,
  backgroundColor: 'transparent',
  display: 'inline-flex',
  alignItems: 'center',
  color: 'neutral.dark',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textAlign: 'left',
  fontFamily: 'inherit',
  fontSize: 'inherit',
  lineHeight: 'inherit',
  borderRadius: '0.125rem',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'secondary.main',
    outlineOffset: '2px',
  },
  '&[data-disabled]': {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
})

const labelClass = css({
  ml: 1,
  ...appTypography.h3,
})

const SaveActionButton = ({
  keyName,
  ariaLabel,
  onClick,
  disabled,
  sx,
}: SaveActionButtonProps) => {
  return (
    <BaseButton
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cx(buttonClass, css(...pandaStylePropsToArray(sx)))}
      style={mergePandaStyleProps({ sx })}
    >
      <SaveIcon />
      <span className={labelClass}>
        <TText keyName={keyName} ns="luonnonmetsakartat" />
      </span>
    </BaseButton>
  )
}

export default SaveActionButton
