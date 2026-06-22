'use client'

import React from 'react'
import { useTranslate } from '@tolgee/react'
import { openLoginWindow } from '#/common/utils/auth'
import { Box } from '#/common/style/theme/system'
import { useAppParams } from '#/common/navigation/navigation'

const nativeButtonType = {
  type: 'button',
} satisfies Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>

const LoginButton = () => {
  const params = useAppParams<{ locale?: string }>()
  const { t } = useTranslate('avoin-map')

  return (
    <Box
      component="button"
      {...nativeButtonType}
      aria-label="Sign in"
      sx={{
        m: 0,
        p: 0,
        pl: 0,
        border: 0,
        appearance: 'none',
        background: 'transparent',
        color: 'neutral.lighter',
        cursor: 'pointer',
        font: 'inherit',
        typography: 'h3',
        '&:hover': {
          textDecoration: 'underline',
        },
        '&:focus-visible': {
          outline: (theme) =>
            `2px solid ${theme.palette?.secondary?.dark ?? '#1976d2'}`,
          outlineOffset: 3,
        },
      }}
      onClick={() => openLoginWindow(params.locale)}
    >
      {t('navbar.profile.sign_in')}
    </Box>
  )
}

export default LoginButton
