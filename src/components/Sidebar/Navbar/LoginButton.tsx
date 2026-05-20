'use client'

import React from 'react'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import { T } from '@tolgee/react'
import { useParams } from 'next/navigation'
import { openLoginWindow } from '#/common/utils/auth'

const LoginButton = () => {
  const params = useParams<{ locale?: string }>()

  return (
    <Button
      aria-label="Sign in"
      sx={{ color: 'neutral.lighter', typography: 'h3', pl: 0 }}
      onClick={() => openLoginWindow(params.locale)}
    >
      <T keyName="navbar.profile.sign_in" />
    </Button>
  )
}

const ActionButton = styled(Button)({
  height: 40,
  display: 'inline',
  width: 90,
  margin: '0 0 0 10px',
  fontSize: '0.9rem',
})

export default LoginButton
