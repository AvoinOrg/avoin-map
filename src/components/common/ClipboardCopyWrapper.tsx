import React from 'react'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import { useUIStore } from '#/common/store'
import type { PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'

type Props = {
  textToCopy: string
  children: React.ReactNode
  onSuccessText?: string
  onFailText?: string
  ariaLabel?: string
  disabled?: boolean
  styleProps?: PandaStyleProp
}

const ClipboardCopyWrapper = ({
  textToCopy,
  children,
  onSuccessText,
  onFailText,
  ariaLabel,
  disabled,
  styleProps,
}: Props) => {
  const { t } = useTranslate('avoin-map')
  const notify = useUIStore((state) => state.notify)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      const text = onSuccessText || t('general.messages.clipboard_success')
      notify({ message: text, variant: 'info' })
    } catch {
      const text = onFailText || t('general.messages.clipboard_fail')
      notify({ message: text, variant: 'error' })
    }
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel ?? 'Copy to clipboard'}
      aria-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      onClick={disabled ? undefined : copyToClipboard}
      className={cx(
        css({
          background: 'none',
          border: 'none',
          p: 0,
          m: 0,
          color: 'inherit',
          textAlign: 'inherit',
          font: 'inherit',
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }),
        css(...pandaStylePropsToArray(styleProps))
      )}
      style={mergePandaStyleProps({ styleProps })}
    >
      {children}
    </button>
  )
}

export default ClipboardCopyWrapper
