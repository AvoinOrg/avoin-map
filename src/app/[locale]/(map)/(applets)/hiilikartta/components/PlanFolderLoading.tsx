'use client'

import { Box } from '#/common/style/theme'
import { Folder } from '#/components/common/Folder'
import { LoadingSpinner } from '#/components/Loading'
import type { PlaceholderPlanConf } from '../common/types'

const PlanFolderLoading = ({
  height,
}: {
  planConf: PlaceholderPlanConf
  height: number
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Folder height={height}>
        <Box
          sx={{
            pt: 2,
            pl: 3,
            pb: 3,
            pr: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: '1',
            height: '100%',
          }}
        >
          <LoadingSpinner />
        </Box>
      </Folder>
    </Box>
  )
}

export default PlanFolderLoading
