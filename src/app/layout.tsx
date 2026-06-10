import React from 'react'
import type { Metadata } from 'next'

import { arimo } from '#/common/style/theme/fonts'
import '../../styled-system/styles.css'

export const metadata: Metadata = {
  icons: {
    icon: '/files/favicon.ico',
    shortcut: '/files/favicon.ico',
    // apple: '/files/apple-touch-icon.png',
  },
}

// import { UserModal } from '#/components/Profile'
// import { UiStateProvider, UserStateProvider } from '#/components/State'
const RootLayout = ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <html lang="en" className={arimo.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

export default RootLayout
