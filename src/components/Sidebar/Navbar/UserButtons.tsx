import React from 'react'

import { useUserStore } from '#/common/store/userStore'
import { Box } from '#/common/style/theme/system'
import LoggedInButton from './LoggedInButton'
import LoginButton from './LoginButton'
import { UserAuthState } from '#/common/types/state'

const UserButtons = () => {
  const userAuthState = useUserStore((state) => state.userAuthState)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      {[UserAuthState.Authenticated, UserAuthState.Loading].includes(
        userAuthState
      ) ? (
        <LoggedInButton></LoggedInButton>
      ) : (
        <LoginButton></LoginButton>
      )}
    </Box>
  )
}

export default UserButtons
