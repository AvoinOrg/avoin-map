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

type Props = {
  open: boolean
  onClose: () => void
  features: any[]
}

const AreaModal = ({ open, onClose, features }: Props) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="area-modal-title"
      aria-describedby="area-modal-description"
    >
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
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
    </Modal>
  )
}

export default AreaModal
