import React from 'react'
import { useTranslate } from '@tolgee/react'

import { AppSxProps, Box } from '#/common/style/theme'
import { useAppParams } from '#/common/navigation/navigation'
import { Login } from '#/components/icons'
import TText from '#/components/common/TText'
import { useUserStore } from '#/common/store/userStore'
import { UserAuthState, UserDataState } from '#/common/types/state'
import { openWindow } from '#/common/utils/modal'
import { openLoginWindow } from '#/common/utils/auth'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { MapButton } from './MapButton'
import { MapButtonMenu } from './MapButtonMenu'

const PROFILE_URL =
  process.env.PUBLIC_ZITADEL_ISSUER + '/ui/console/users/me'

type Props = {
  isVertical: boolean
  defaultMenuOpen?: boolean
}

const menuItemSx = {
  width: '100%',
  px: 3,
  py: 1.5,
  m: 0,
  border: 0,
  backgroundColor: 'transparent',
  color: 'text.primary',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textAlign: 'left',
  font: 'inherit',
  typography: 'body1',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
  '&:focus-visible': {
    outline: (theme) => `2px solid ${theme.palette.secondary.dark}`,
    outlineOffset: -2,
  },
} satisfies AppSxProps

const buttonTypeProps = { type: 'button' } as const

export const MapLoginButton = ({ isVertical, defaultMenuOpen }: Props) => {
  const params = useAppParams()
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

  const isAuthenticated = userAuthState === UserAuthState.Authenticated
  const isLoading =
    userAuthState === UserAuthState.Loading ||
    (isAuthenticated && userDataState !== UserDataState.Fetched)

  const tooltipLabel = isAuthenticated
    ? t('navbar.profile.settings', 'Profile settings')
    : t('navbar.profile.sign_in', 'Sign in')

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
        onClick={() => void openLoginWindow(locale)}
      >
        <Login />
      </MapButton>
    )
  }

  const menuContent = ({ closeMenu }: { closeMenu: () => void }) => (
    <Box key="account-menu-content" sx={{ minWidth: '12rem' }}>
      <Box
        sx={{
          px: 3,
          py: 2,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.10)',
          backgroundColor: 'inherit',
        }}
      >
        <Box component="h3" sx={{ m: 0, typography: 'h3', textAlign: 'left' }}>
          {userData?.name || t('map.buttons.account', 'Account')}
        </Box>
      </Box>
      <Box role="separator" sx={{ borderTop: '1px solid', borderColor: 'divider' }} />
      <Box
        role="menu"
        aria-label={t('map.buttons.account', 'Account menu')}
        sx={{ py: 1 }}
      >
        <Box
          component="button"
          {...buttonTypeProps}
          role="menuitem"
          aria-label={t('navbar.profile.settings')}
          onClick={() => {
            openWindow(PROFILE_URL)
            closeMenu()
          }}
          sx={menuItemSx}
        >
          <TText keyName="navbar.profile.settings" />
        </Box>
        <Box
          component="button"
          {...buttonTypeProps}
          role="menuitem"
          aria-label={t('navbar.profile.sign_out')}
          onClick={() => {
            signOut()
            closeMenu()
          }}
          sx={menuItemSx}
        >
          <TText keyName="navbar.profile.sign_out" />
        </Box>
      </Box>
    </Box>
  )

  return (
    <MapButtonMenu
      isVertical={isVertical}
      placement={isVertical ? 'left-start' : 'bottom-start'}
      menuContent={menuContent}
      paperSx={{ p: 0, overflow: 'hidden' }}
      defaultOpen={defaultMenuOpen}
    >
      <MapButton size="small" tooltip={tooltipLabel} isVertical={isVertical}>
        <Login />
      </MapButton>
    </MapButtonMenu>
  )
}
