import React from 'react'
import {
  Box,
  Typography,
  Modal,
  IconButton,
  SxProps,
  Theme,
} from '@mui/material'
import { T } from '@tolgee/react'
import LoadingHorizontal from '#/components/Loading/LoadingHorizontal'
import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'

const AreaModal = ({ features, onClose }: PopupProps) => {
  return (
    <MapModalWrapper>
      <Box
        sx={{
          backgroundColor: '#3E3E3E',
          borderRadius: '0.625rem',
          color: '#A9E7CB',
          p: 5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* <Typography id="area-modal-title" variant="h6" component="h2">
                  {title}
                </Typography> */}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              // Position to top-right if preferred, or remove for default flow if title is on left
              // position: 'absolute',
              // right: (theme) => theme.spacing(1),
              // top: (theme) => theme.spacing(1),
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Cross />
          </IconButton>
        </Box>
        <Box sx={{ overflowY: 'auto', flexGrow: 1, top: '2.5rem' }}>
          {features && features.length > 0 ? (
            features.map((feature, index) => (
              // Replace with your actual feature rendering logic
              <Box key={index} sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Feature {index + 1}:{' '}
                  {JSON.stringify(feature.properties || feature)}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography id="area-modal-description">
              <T keyName="no_features_selected" ns="luonnonmetsakartat">
                No features selected or data available.
              </T>
            </Typography>
          )}
        </Box>
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModal
