import React from 'react'
import { Box, Button } from '@mui/material'
import { T } from '@tolgee/react'

const PlanImportActionsRow = ({
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
        disabled={isAcceptDisabled}
        onClick={isAcceptDisabled ? undefined : onClickAccept}
        sx={{
          width: 'fit-content',
          minWidth: '5.125rem',
          height: '1.25rem',
          px: '0.75rem',
          py: 0,
          border: '0.2px solid #0A4835',
          borderRadius: '0.625rem',
          textTransform: 'none',
          fontSize: '0.625rem',
          fontWeight: 700,
          lineHeight: '0.875rem',
          letterSpacing: '0.1em',
          backgroundColor: '#BCE9B4',
          color: '#111111',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#BCE9B4',
            boxShadow: 'none',
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(10, 72, 53, 0.35)',
            backgroundColor: 'rgba(188, 233, 180, 0.5)',
            color: 'rgba(17, 17, 17, 0.56)',
          },
        }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            transform: 'translateY(0.0625rem)',
          }}
        >
          <T keyName="sidebar.create.accept" ns="hiilikartta" />
        </Box>
      </Button>
    </Box>
  )
}

export default PlanImportActionsRow
