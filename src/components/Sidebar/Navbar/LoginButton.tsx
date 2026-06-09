'use client'

import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css } from 'styled-system/css'
import { useTranslate } from '@tolgee/react'
import { useParams } from 'next/navigation'
import { openLoginWindow } from '#/common/utils/auth'

const buttonClass = css({
  color: 'neutral.lighter',
  textStyle: 'h3',
  pl: 0,
  p: 0,
  border: 0,
  backgroundColor: 'transparent',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid var(--colors-neutral-lighter)',
    outlineOffset: '2px',
  },
})

const LoginButton = () => {
  const params = useParams<{ locale?: string }>()
  const { t } = useTranslate('avoin-map')

  return (
    <BaseButton
      type="button"
      aria-label="Sign in"
      className={buttonClass}
      onClick={() => openLoginWindow(params.locale)}
    >
      {t('navbar.profile.sign_in')}
    </BaseButton>
  )
}

export default LoginButton
