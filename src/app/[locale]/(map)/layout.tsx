import React from 'react'
import LayoutClient from './layoutClient'

type Props = {
  children: React.ReactNode
}

const Layout = async ({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: Props) => {
  return <LayoutClient>{children}</LayoutClient>
}

export default Layout
