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

const AreaModal = ({ features }: PopupProps) => {
  return (
    <Box
      sx={{
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {
          xs: '90%',
          sm: '70%',
          md: '500px',
        },
        maxHeight: '90vh',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 1,
        outline: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ overflowY: 'auto', flexGrow: 1 }}>
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
        {/* Example of using LoadingHorizontal if needed */}
        {/* <LoadingHorizontal /> */}
      </Box>
    </Box>
  )
}

export default AreaModal
