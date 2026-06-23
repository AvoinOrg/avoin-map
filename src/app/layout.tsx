import React from 'react'

import { arimo } from '#/common/style/theme/fonts'

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
