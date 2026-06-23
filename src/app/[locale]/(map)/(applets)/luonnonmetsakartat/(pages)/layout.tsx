import AppletLayout from '#/components/common/AppletLayout'
import LayoutClient from './layoutClient'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppletLayout
      umamiWebsiteId={
        process.env.NEXT_PUBLIC_APPLETS_LUONNONMETSAKARTAT_UMAMI_ID
      }
    >
      <LayoutClient>{children}</LayoutClient>
    </AppletLayout>
  )
}

export default Layout
