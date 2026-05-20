import React from 'react'
import { Box, SxProps, Theme } from '@mui/material'
import { useTranslate } from '@tolgee/react'

import { useUIStore } from '#/common/store'

type Props = {
  textToCopy: string
  children: React.ReactNode
  onSuccessText?: string
  onFailText?: string
  ariaLabel?: string
  disabled?: boolean
  sx?: SxProps<Theme>
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
    } catch (err) {
      const text = onFailText || t('general.messages.clipboard_fail')
      notify({ message: text, variant: 'error' })
    }
  }

  return (
    <Box
      component="button"
      type="button"
      aria-label={ariaLabel ?? 'Copy to clipboard'}
      aria-disabled={disabled ? 'true' : undefined}
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
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  )
}

export default ClipboardCopyWrapper
