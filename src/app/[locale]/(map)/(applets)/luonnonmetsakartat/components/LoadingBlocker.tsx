import { LoadingSpinner } from '#/components/Loading/LoadingSpinner'
import { Box } from '#/components/common/PandaBox'

const LoadingBlocker = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        mt: 8,
      }}
    >
      <LoadingSpinner />
    </Box>
  )
}

export default LoadingBlocker
