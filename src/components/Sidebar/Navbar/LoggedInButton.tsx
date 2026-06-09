'use client'

import React, { useEffect, useState } from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { Popover as BasePopover } from '@base-ui/react/popover'
import { css } from 'styled-system/css'
import { useTranslate } from '@tolgee/react'
import { useSession } from 'next-auth/react'

import { openWindow } from '#/common/utils/modal'
import { useUserStore } from '#/common/store/userStore'
import { UserAuthState, UserDataState } from '#/common/types/state'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'

const profileUrl =
  process.env.NEXT_PUBLIC_ZITADEL_ISSUER + '/ui/console/users/me'

const triggerClass = css({
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

const positionerClass = css({
  zIndex: 3300,
})

const popupClass = css({
  minWidth: '10rem',
  backgroundColor: '#ffffff',
  color: 'neutral.darker',
  boxShadow: '0 8px 24px rgba(17, 17, 17, 0.18)',
  borderRadius: '0.3125rem',
  py: '0.25rem',
  outline: 'none',
})

const menuClass = css({
  display: 'flex',
  flexDirection: 'column',
  py: '0.25rem',
})

const menuItemClass = css({
  textStyle: 'body1',
  width: '100%',
  border: 0,
  backgroundColor: 'transparent',
  color: 'neutral.darker',
  textAlign: 'left',
  px: '1rem',
  py: '0.625rem',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'neutral.light',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-primary-main)',
    outlineOffset: '-2px',
  },
})

const LoggedInButton = () => {
  const { data: session } = useSession()
  void session
  const { t } = useTranslate('avoin-map')

  const signOut = useUserStore((state) => state.signOut)
  const userData = useUserStore((state) => state.userData)
  const userAuthState = useUserStore((state) => state.userAuthState)
  const userDataState = useUserStore((state) => state.userDataState)

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

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault()
      setOpen(false)
    } else if (event.key === 'Escape') {
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
          <BasePopover.Root
            open={open}
            onOpenChange={(nextOpen) => setOpen(nextOpen)}
          >
            <BasePopover.Trigger
              ref={anchorRef}
              aria-label={`Open account menu for ${userData?.name ?? 'user'}`}
              aria-haspopup="true"
              id="navbar-profile-button"
              className={triggerClass}
            >
              {userData?.name}
            </BasePopover.Trigger>
            <BasePopover.Portal>
              <BasePopover.Positioner
                side="bottom"
                align="start"
                sideOffset={0}
                positionMethod="fixed"
                className={positionerClass}
              >
                <BasePopover.Popup className={popupClass}>
                  <div
                    role="menu"
                    id="navbar-profile-menu"
                    aria-labelledby="navbar-profile-button"
                    onKeyDown={handleListKeyDown}
                    className={menuClass}
                  >
                    <BaseButton
                      type="button"
                      role="menuitem"
                      aria-label="Open profile settings"
                      onClick={handleProfileClick}
                      className={menuItemClass}
                    >
                      {t('navbar.profile.settings')}
                    </BaseButton>
                    <BaseButton
                      type="button"
                      role="menuitem"
                      aria-label="Sign out"
                      onClick={handleSignoutClick}
                      className={menuItemClass}
                    >
                      {t('navbar.profile.sign_out')}
                    </BaseButton>
                  </div>
                </BasePopover.Popup>
              </BasePopover.Positioner>
            </BasePopover.Portal>
          </BasePopover.Root>
        )}
      {userDataState !== UserDataState.Fetched && (
        <LoadingHorizontal></LoadingHorizontal>
      )}
    </>
  )
}

export default LoggedInButton
