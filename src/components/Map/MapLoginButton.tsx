'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Box, Divider, MenuItem, MenuList, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'

import { Login } from '#/components/icons'
import { useUserStore } from '#/common/store/userStore'
import { UserAuthState, UserDataState } from '#/common/types/state'
import { openWindow } from '#/common/utils/modal'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { MapButton } from './MapButton'
import { MapButtonMenu } from './MapButtonMenu'

const PROFILE_URL =
  process.env.NEXT_PUBLIC_ZITADEL_ISSUER + '/ui/console/users/me'

type Props = {
  isVertical: boolean
}

export const MapLoginButton = ({ isVertical }: Props) => {
  const params = useParams()
  const userAuthState = useUserStore((state) => state.userAuthState)
  const userData = useUserStore((state) => state.userData)
  const userDataState = useUserStore((state) => state.userDataState)
  const signOut = useUserStore((state) => state.signOut)
  const { t } = useTranslate('avoin-map')
  const localeParam = params.locale
  const locale =
    typeof localeParam === 'string'
      ? localeParam
      : Array.isArray(localeParam)
        ? (localeParam[0] ?? 'en')
        : 'en'
  const loginUrl = `/${locale}/adds/login`

  const isAuthenticated = userAuthState === UserAuthState.Authenticated
  const isLoading =
    userAuthState === UserAuthState.Loading ||
    (isAuthenticated && userDataState !== UserDataState.Fetched)

  const tooltipLabel = isAuthenticated
    ? t('navbar.profile.settings', 'Profile settings')
    : t('navbar.profile.sign_in', 'Sign in')

  const menuItemSx = {
    px: 3,
    py: 1.5,
    typography: 'body1',
  }

  if (isLoading) {
    return (
      <MapButton
        size="small"
        disabled
        isVertical={isVertical}
        aria-label={tooltipLabel}
      >
        <LoadingHorizontal sx={{ color: 'text.secondary' }} />
      </MapButton>
    )
  }

  if (!isAuthenticated) {
    return (
      <MapButton
        size="small"
        tooltip={tooltipLabel}
        isVertical={isVertical}
        onClick={() => openWindow(loginUrl)}
      >
        <Login />
      </MapButton>
    )
  }

  const menuContent = ({ closeMenu }: { closeMenu: () => void }) => (
    <Box sx={{ minWidth: '12rem' }}>
      <Box
        sx={{
          px: 3,
          py: 2,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
        }}
      >
        <Typography variant="h3" sx={{ textAlign: 'left' }}>
          {userData?.name || t('map.buttons.account', 'Account')}
        </Typography>
      </Box>
      <Divider />
      <MenuList aria-label={t('map.buttons.account', 'Account menu')} sx={{ py: 1 }}>
        <MenuItem
          aria-label={t('navbar.profile.settings')}
          onClick={() => {
            openWindow(PROFILE_URL)
            closeMenu()
          }}
          sx={menuItemSx}
        >
          <T keyName="navbar.profile.settings" />
        </MenuItem>
        <MenuItem
          aria-label={t('navbar.profile.sign_out')}
          onClick={() => {
            signOut()
            closeMenu()
          }}
          sx={menuItemSx}
        >
          <T keyName="navbar.profile.sign_out" />
        </MenuItem>
      </MenuList>
    </Box>
  )

  return (
    <MapButtonMenu
      isVertical={isVertical}
      placement={isVertical ? 'left-start' : 'bottom-start'}
      menuContent={menuContent}
      paperSx={{ p: 0, overflow: 'hidden' }}
    >
      <MapButton size="small" tooltip={tooltipLabel} isVertical={isVertical}>
        <Login />
      </MapButton>
    </MapButtonMenu>
  )
}
