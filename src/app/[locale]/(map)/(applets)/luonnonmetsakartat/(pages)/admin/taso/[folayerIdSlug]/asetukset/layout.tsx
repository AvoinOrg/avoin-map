import LayoutClient from './layoutClient'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <LayoutClient>{children}</LayoutClient>
}

export default Layout
