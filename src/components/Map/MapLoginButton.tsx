'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Button as BaseButton } from '@base-ui/react/button'
import { css } from 'styled-system/css'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import { Login } from '#/components/icons'
import { useUserStore } from '#/common/store/userStore'
import { UserAuthState, UserDataState } from '#/common/types/state'
import { openWindow } from '#/common/utils/modal'
import { getLoginUrl } from '#/common/utils/auth'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { MapButton } from './MapButton'
import { MapButtonMenu } from './MapButtonMenu'

const PROFILE_URL =
  process.env.NEXT_PUBLIC_ZITADEL_ISSUER + '/ui/console/users/me'

const menuItemClass = css({
  width: '100%',
  border: 0,
  backgroundColor: 'transparent',
  color: 'neutral.darker',
  textAlign: 'left',
  px: 3,
  py: 1.5,
  textStyle: 'body1',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'neutral.main',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-dark)',
    outlineOffset: '-2px',
  },
})

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
  const loginUrl = getLoginUrl(locale)

  const isAuthenticated = userAuthState === UserAuthState.Authenticated
  const isLoading =
    userAuthState === UserAuthState.Loading ||
    (isAuthenticated && userDataState !== UserDataState.Fetched)

  const tooltipLabel = isAuthenticated
    ? t('navbar.profile.settings')
    : t('navbar.profile.sign_in')

  if (isLoading) {
    return (
      <MapButton
        size="small"
        disabled
        isVertical={isVertical}
        aria-label={tooltipLabel}
      >
        <LoadingHorizontal styleProps={{ color: 'text.secondary' }} />
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
    <Box styleProps={{ minWidth: '12rem' }}>
      <Box
        styleProps={{
          px: 3,
          py: 2,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
        }}
      >
        <Box component="h2" styleProps={{ m: 0, textStyle: 'h3', textAlign: 'left' }}>
          {userData?.name || t('map.buttons.account')}
        </Box>
      </Box>
      <Box component="hr" styleProps={{ m: 0, border: 0, borderTop: '1px solid var(--colors-neutral-main)' }} />
      <Box
        role="menu"
        aria-label={t('map.buttons.account')}
        styleProps={{ display: 'flex', flexDirection: 'column', py: 1 }}
      >
        <BaseButton
          type="button"
          role="menuitem"
          aria-label={t('navbar.profile.settings')}
          onClick={() => {
            openWindow(PROFILE_URL)
            closeMenu()
          }}
          className={menuItemClass}
        >
          {t('navbar.profile.settings')}
        </BaseButton>
        <BaseButton
          type="button"
          role="menuitem"
          aria-label={t('navbar.profile.sign_out')}
          onClick={() => {
            signOut()
            closeMenu()
          }}
          className={menuItemClass}
        >
          {t('navbar.profile.sign_out')}
        </BaseButton>
      </Box>
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
