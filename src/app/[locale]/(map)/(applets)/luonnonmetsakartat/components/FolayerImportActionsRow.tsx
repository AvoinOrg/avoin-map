import React from 'react'
import { Box, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'

const FolayerImportActionsRow = ({
  onClickAccept,
  isAcceptDisabled,
}: {
  onClickAccept: () => void
  isAcceptDisabled: boolean
}) => {
  const { t } = useTranslate('luonnonmetsakartat')
  const acceptLabel = t('sidebar.admin.create.accept')

  return (
    <Box
      sx={{
        minHeight: '25px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        margin: '40px 0 60px 0',
      }}
    >
      <Box
        component="button"
        type="button"
        disabled={isAcceptDisabled}
        aria-label={acceptLabel}
        sx={(theme) => ({
          p: 0,
          border: 0,
          background: 'transparent',
          font: 'inherit',
          color: isAcceptDisabled
            ? theme.palette.neutral.main
            : theme.palette.neutral.dark,
          cursor: isAcceptDisabled ? 'not-allowed' : 'pointer',
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.neutral.darker}`,
            outlineOffset: '0.25rem',
          },
        })}
        onClick={isAcceptDisabled ? undefined : onClickAccept}
      >
        <Typography component="span" typography={'h3'}>
          <u>{acceptLabel}</u>
        </Typography>
      </Box>
    </Box>
  )
}

export default FolayerImportActionsRow
