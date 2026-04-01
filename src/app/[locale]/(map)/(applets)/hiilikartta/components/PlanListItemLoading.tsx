'use client'

import React from 'react'
import { Box, Skeleton } from '@mui/material'

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
        <Skeleton
          variant="rounded"
          sx={{
            width: '0.75rem',
            height: '0.5625rem',
            borderRadius: '0.2rem',
            mt: '0.25rem',
            bgcolor: 'rgba(13, 96, 68, 0.12)',
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
          <Skeleton
            variant="text"
            sx={{
              width: '40%',
              height: '1rem',
              transform: 'none',
              bgcolor: 'rgba(17, 17, 17, 0.08)',
            }}
          />
          <Skeleton
            variant="text"
            sx={{
              width: '58%',
              height: '0.875rem',
              transform: 'none',
              bgcolor: 'rgba(17, 17, 17, 0.06)',
            }}
          />
        </Box>
      </Box>

      <Skeleton
        variant="circular"
        sx={{
          width: '1rem',
          height: '1rem',
          bgcolor: 'rgba(17, 17, 17, 0.08)',
          flexShrink: 0,
        }}
      />
    </Box>
  )
}

export default PlanListItemLoading
