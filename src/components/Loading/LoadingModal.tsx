import { Box, type AppTheme } from '#/common/style/theme'
import { LoadingSpinner } from './LoadingSpinner'

const DEFAULT_MODAL_Z_INDEX = 1500

const getLoadingModalZIndex = (theme: AppTheme) =>
  (theme.zIndex?.modal ?? DEFAULT_MODAL_Z_INDEX) + 1

export const LoadingModal = () => {
  return (
    <Box
      sx={(theme) => ({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '64px 10px 200px 10px',
        zIndex: getLoadingModalZIndex(theme),
        backgroundColor: 'white',
        overflowY: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      })}
    >
      <LoadingSpinner color="secondary" size={200} />
    </Box>
  )
}
