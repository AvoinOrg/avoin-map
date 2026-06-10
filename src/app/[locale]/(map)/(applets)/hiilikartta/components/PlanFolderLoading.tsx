'use client'

import React from 'react'

import { Folder } from '#/components/common/Folder'
import { Box } from '#/components/common/PandaBox'
import { LoadingSpinner } from '#/components/Loading'
import { PlaceholderPlanConf } from '../common/types'

const PlanFolder = ({
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

export default PlanFolder
