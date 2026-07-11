import React, { useEffect, useState } from 'react'
import { Menu } from '@base-ui/react/menu'
import { useTranslate } from '@tolgee/react'

import { openWindow } from '#/common/utils/modal'
import { useUserStore } from '#/common/store/userStore'
import { UserAuthState, UserDataState } from '#/common/types/state'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { Box } from '#/common/style/theme/system'

const profileUrl =
  process.env.PUBLIC_ZITADEL_ISSUER + '/ui/console/users/me'

const LoggedInButton = () => {
  const signOut = useUserStore((state) => state.signOut)
  const userData = useUserStore((state) => state.userData)
  const userAuthState = useUserStore((state) => state.userAuthState)
  const userDataState = useUserStore((state) => state.userDataState)
  const { t } = useTranslate('avoin-map')

  const [open, setOpen] = useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)

  const handleProfileClick = () => {
    openWindow(profileUrl)
    setOpen(false)
  }

  const handleSignoutClick = () => {
    signOut()
    setOpen(false)
  }

  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    }
  }

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open)
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current!.focus()
    }

    prevOpen.current = open
  }, [open])

  return (
    <>
      {userAuthState === UserAuthState.Authenticated &&
        userDataState === UserDataState.Fetched && (
          <Menu.Root
            open={open}
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen)
            }}
            modal={false}
          >
            <Menu.Trigger
              ref={anchorRef}
              id="navbar-profile-button"
              aria-label={`Open account menu for ${userData?.name ?? 'user'}`}
              render={(props) => (
                <Box
                  {...props}
                  component="button"
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
                    textAlign: 'left',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    '&:focus-visible, &[data-focus-visible="true"]': {
                      outline: (theme) =>
                        `2px solid ${theme.palette?.secondary?.dark ?? '#1976d2'}`,
                      outlineOffset: 3,
                    },
                  }}
                />
              )}
            >
              {userData?.name}
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner
                side="bottom"
                align="start"
                sideOffset={4}
                render={(props) => (
                  <Box
                    {...props}
                    sx={{ zIndex: (theme) => theme.zIndex?.popup ?? 3300 }}
                  />
                )}
              >
                <Menu.Popup
                  id="navbar-profile-menu"
                  aria-labelledby="navbar-profile-button"
                  onKeyDown={handleListKeyDown}
                  render={(props) => (
                    <Box
                      {...props}
                      sx={{
                        minWidth: 180,
                        py: 0.5,
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: 'neutral.darker',
                        boxShadow: '0px 6px 18px rgba(0, 0, 0, 0.22)',
                        border: '1px solid rgba(17, 17, 17, 0.08)',
                        outline: 0,
                      }}
                    />
                  )}
                >
                  <Menu.Item
                    aria-label="Open profile settings"
                    onClick={handleProfileClick}
                    render={(props) => (
                      <Box
                        {...props}
                        sx={{
                          px: 2,
                          py: 1,
                          cursor: 'pointer',
                          typography: 'body2',
                          '&[data-highlighted], &:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      />
                    )}
                  >
                    {t('navbar.profile.settings')}
                  </Menu.Item>
                  <Menu.Item
                    aria-label="Sign out"
                    onClick={handleSignoutClick}
                    render={(props) => (
                      <Box
                        {...props}
                        sx={{
                          px: 2,
                          py: 1,
                          cursor: 'pointer',
                          typography: 'body2',
                          '&[data-highlighted], &:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      />
                    )}
                  >
                    {t('navbar.profile.sign_out')}
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        )}
      {userDataState !== UserDataState.Fetched && (
        <LoadingHorizontal></LoadingHorizontal>
      )}
    </>
  )
}

export default LoggedInButton
