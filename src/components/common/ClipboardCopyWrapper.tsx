import React from 'react'
import { useTranslate } from '@tolgee/react'

import { type AppSxProps, toSxArray } from '#/common/style/theme'
import { useUIStore } from '#/common/store/uiStore'
import { ButtonBase } from '#/components/common/Button'

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

const toAppSxItemArray = (sx?: AppSxProps) =>
  toSxArray(sx) as AppSxItem[]

type Props = {
  textToCopy: string
  children: React.ReactNode
  onSuccessText?: string
  onFailText?: string
  ariaLabel?: string
  disabled?: boolean
  sx?: AppSxProps
}

const ClipboardCopyWrapper = ({
  textToCopy,
  children,
  onSuccessText,
  onFailText,
  ariaLabel,
  disabled,
  sx,
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
    <ButtonBase
      type="button"
      aria-label={ariaLabel ?? 'Copy to clipboard'}
      aria-disabled={disabled ? 'true' : undefined}
      disabled={disabled}
      onClick={disabled ? undefined : copyToClipboard}
      sx={[
        {
          background: 'none',
          border: 'none',
          p: 0,
          m: 0,
          color: 'inherit',
          textAlign: 'inherit',
          '&:hover': {
            cursor: disabled ? 'not-allowed' : 'pointer',
          },
          opacity: disabled ? 0.6 : 1,
        },
        ...toAppSxItemArray(sx),
      ]}
    >
      {children}
    </ButtonBase>
  )
}

export default ClipboardCopyWrapper
