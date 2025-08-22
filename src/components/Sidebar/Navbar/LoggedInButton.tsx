'use client'

import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import {
  Box,
  ClickAwayListener,
  Grow,
  Menu,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { T } from '@tolgee/react'
import { useSession } from 'next-auth/react'
import { User } from 'next-auth'
import { useQuery } from '@tanstack/react-query'

import { openWindow } from '#/common/utils/modal'
import { useUserStore } from '#/common/store/userStore'
import { LoadingSpinner } from '#/components/Loading'
import { UserAuthState, UserDataState } from '#/common/types/state'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'

const profileUrl =
  process.env.NEXT_PUBLIC_ZITADEL_ISSUER + '/ui/console/users/me'

const LoggedInButton = () => {
  const { data: session } = useSession()

  const signOut = useUserStore((state) => state.signOut)
  const userData = useUserStore((state) => state.userData)
  const userAuthState = useUserStore((state) => state.userAuthState)
  const userDataState = useUserStore((state) => state.userDataState)

  const [open, setOpen] = useState(false)
  const anchorRef = React.useRef<HTMLButtonElement>(null)

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Event | React.SyntheticEvent) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

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
          <>
            <Button
              ref={anchorRef}
              aria-haspopup="true"
              id="navbar-profile-button"
              sx={{ color: 'neutral.lighter', typography: 'h3', pl: 0 }}
              onClick={handleToggle}
            >
              {userData?.name}
            </Button>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              placement="bottom-start"
              transition
              // disablePortal
              sx={{
                zIndex: 3300,
              }}
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom-start' ? 'left top' : 'left bottom',
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={handleClose}>
                      <MenuList
                        autoFocusItem={open}
                        id="navbar-profile-menu"
                        aria-labelledby="navbar-profile-button"
                        onKeyDown={handleListKeyDown}
                      >
                        <MenuItem onClick={handleProfileClick}>
                          <T keyName={'navbar.profile.settings'}></T>
                        </MenuItem>
                        <MenuItem onClick={handleSignoutClick}>
                          <T keyName={'navbar.profile.sign_out'}></T>
                        </MenuItem>
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </>
        )}
      {userDataState !== UserDataState.Fetched && (
        <LoadingHorizontal></LoadingHorizontal>
      )}
    </>
  )
}

const ActionButton = styled(Button)({
  height: 40,
  display: 'inline',
  width: 90,
  margin: '0 0 0 10px',
  fontSize: '0.9rem',
})

export default LoggedInButton
