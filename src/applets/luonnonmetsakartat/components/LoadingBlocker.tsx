import { LoadingSpinner } from '#/components/Loading/LoadingSpinner'
import { Box } from '#/common/style/theme'
import { SidebarContentBox } from '#/components/Sidebar'

const LoadingBlocker = () => {
  return (
    <SidebarContentBox>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          minHeight: '3rem',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 3,
        }}
      >
        <LoadingSpinner />
      </Box>
    </SidebarContentBox>
  )
}

export default LoadingBlocker
