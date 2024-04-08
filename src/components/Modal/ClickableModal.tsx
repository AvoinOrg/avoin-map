import React from 'react'
import { Modal, Box, IconButton, SxProps, Theme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type Props = {
  children: React.ReactNode
  modalBody: React.ReactNode
  sx?: SxProps<Theme>
  textContainerSx?: SxProps<Theme>
}

const ClickableModal = ({ modalBody, children, sx }: Props) => {
  const [open, setOpen] = React.useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Box
        sx={[
          { '&:hover': { cursor: 'pointer' } },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        onClick={() => setOpen(true)}
      >
        {children}
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ border: 'none', outline: 'none' }}
      >
        <Box
          sx={[
            {
              position: 'absolute' as const,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: {
                xs: '100%',
                md: '800px',
              },
              maxHeight: {
                xs: '100vh',
                md: '80vh',
              },
              overflow: 'auto',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              border: 'none',
              outline: 'none',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box sx={{ mt: 2 }}>{modalBody}</Box>
        </Box>
      </Modal>
    </>
  )
}

export default ClickableModal
