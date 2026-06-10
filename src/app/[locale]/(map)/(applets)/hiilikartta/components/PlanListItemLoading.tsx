'use client'

import React from 'react'
import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'

const SkeletonBox = ({ sx }: { sx: PandaStyleProp }) => (
  <Box
    aria-hidden="true"
    sx={[
      {
        flexShrink: 0,
        backgroundColor: 'rgba(17, 17, 17, 0.06)',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
)

const PlanListItemLoading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
        py: '0.75rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
          flex: 1,
          minWidth: 0,
        }}
      >
        <SkeletonBox
          sx={{
            width: '0.75rem',
            height: '0.5625rem',
            borderRadius: '0.2rem',
            mt: '0.25rem',
            backgroundColor: 'rgba(13, 96, 68, 0.12)',
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            flex: 1,
            minWidth: 0,
          }}
        >
          <SkeletonBox
            sx={{
              width: '40%',
              height: '1rem',
              backgroundColor: 'rgba(17, 17, 17, 0.08)',
            }}
          />
          <SkeletonBox
            sx={{
              width: '58%',
              height: '0.875rem',
              backgroundColor: 'rgba(17, 17, 17, 0.06)',
            }}
          />
        </Box>
      </Box>

      <SkeletonBox
        sx={{
          width: '1rem',
          height: '1rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(17, 17, 17, 0.08)',
          flexShrink: 0,
        }}
      />
    </Box>
  )
}

export default PlanListItemLoading
