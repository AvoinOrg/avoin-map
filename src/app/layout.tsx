import '#/common/style/index.css'

import React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { ThemeProvider } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'

import theme from '#/common/style/theme'
// import { UserModal } from '#/components/Profile'
// import { UiStateProvider, UserStateProvider } from '#/components/State'
// import RootStyleRegistry from './emotion'

const RootLayout = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en">
      <body>
        <CssBaseline />
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </body>
    </html>
  )
}

export default RootLayout
