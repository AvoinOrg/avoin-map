import React from 'react'
import { Box, IconButton } from '@mui/material'
import { EyeClosed, EyeOpen } from '#/components/icons'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { getContrastColor } from '#/common/utils/styling'
import { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'

interface EyeButtonProps {
  onClick: (e: React.MouseEvent) => void
  color: string
  status: LayerGroupStatus
  ariaLabel?: string
}

export const EyeButton = ({
  onClick,
  color,
  status,
  ariaLabel,
}: EyeButtonProps) => {
  const contrastColor = getContrastColor(color)

  return (
    <IconButton
      onClick={onClick}
      aria-label={ariaLabel ?? 'Toggle layer visibility'}
      sx={{ mr: 1 }}
    >
      {status === 'processing' && (
        <Box
          sx={{
            width: '32px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LoadingHorizontal sx={{ width: '24px', height: '24px' }} />
        </Box>
      )}
      {status === 'hidden' && (
        <Box
          sx={{
            width: '32px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EyeClosed sx={{ width: '24px', height: '24px' }} />
        </Box>
      )}
      {status === 'visible' && (
        <Box
          sx={{
            width: 32,
            height: 24,
            borderRadius: '50%',
            background: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: contrastColor,
          }}
        >
          <EyeOpen
            sx={{
              width: 24,
              height: 24,
              color: contrastColor,
            }}
          />
        </Box>
      )}
    </IconButton>
  )
}
