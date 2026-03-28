import React from 'react'
import { Box, Button } from '@mui/material'
import { T } from '@tolgee/react'

const InitActionsRow = ({
  onClickAccept,
  isAcceptDisabled,
}: {
  onClickAccept: () => void
  isAcceptDisabled: boolean
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        mt: 4,
      }}
    >
      <Button
        type="button"
        aria-label="Accept imported plan"
        variant="contained"
        color="inherit"
        disabled={isAcceptDisabled}
        onClick={isAcceptDisabled ? undefined : onClickAccept}
        sx={{
          minWidth: '8rem',
          px: '1.5rem',
          py: '0.7rem',
          borderRadius: '999px',
          textTransform: 'uppercase',
          typography: 'h4',
          backgroundColor: '#fff',
          color: 'primary.dark',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#fff',
            boxShadow: 'none',
          },
        }}
      >
        <T keyName="sidebar.create.accept" ns="hiilikartta" />
      </Button>
    </Box>
  )
}

export default InitActionsRow
