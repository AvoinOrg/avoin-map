import { Metadata } from 'next'

import LayoutClient from './layoutClient'

export const metadata: Metadata = {
  title: 'Hiilikartta',
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <LayoutClient>{children}</LayoutClient>
}

export default Layout
