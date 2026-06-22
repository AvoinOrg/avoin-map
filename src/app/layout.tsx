import React from 'react'
import type { Metadata } from 'next'

import { arimo } from '#/common/style/theme/fonts'

export const metadata: Metadata = {
  icons: {
    icon: '/files/favicon.ico',
    shortcut: '/files/favicon.ico',
    // apple: '/files/apple-touch-icon.png',
  },
}

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
