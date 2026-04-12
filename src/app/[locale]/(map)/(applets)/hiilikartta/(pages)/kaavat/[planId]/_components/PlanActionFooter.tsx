'use client'

import React from 'react'
import { Box, SxProps, Theme, Typography } from '@mui/material'
import FolderCopyOutlinedIcon from '@mui/icons-material/FolderCopyOutlined'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { T } from '@tolgee/react'

import IconTextButton from '#/components/common/IconTextButton'
import { Delete, Login } from '#/components/icons'

type PlanActionFooterProps = {
  showDelete?: boolean
  showCopy?: boolean
  showCloudAction?: boolean
  cloudActionKind?: 'login' | 'save'
  cloudActionLabel?: string
  isCloudActionDisabled?: boolean
  lastSavedLabel?: string
  onDelete?: () => void
  onCopy?: () => void
  onCloudAction?: () => void
  sx?: SxProps<Theme>
}

const getActionRowSx = ({
  isDisabled = false,
}: {
  isDisabled?: boolean
}) => ({
  color: isDisabled ? 'rgba(128, 128, 128, 0.56)' : '#808080',
  '&:hover': isDisabled
    ? undefined
    : {
        color: '#5f5f5f',
      },
  '& .MuiButton-root.Mui-disabled': {
    color: 'inherit',
  },
  '& .MuiIconButton-root.Mui-disabled': {
    color: 'inherit',
  },
})

const ACTION_TEXT_SX = {
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '0.875rem',
  letterSpacing: '0.1em',
  textTransform: 'none',
} as const

const ACTION_ICON_WRAPPER_SX = {
  width: '1rem',
  minWidth: '1rem',
  height: '0.875rem',
  color: 'inherit',
} as const

const PlanActionFooter = ({
  showDelete = false,
  showCopy = false,
  showCloudAction = false,
  cloudActionKind = 'save',
  cloudActionLabel,
  isCloudActionDisabled = false,
  lastSavedLabel,
  onDelete,
  onCopy,
  onCloudAction,
  sx,
}: PlanActionFooterProps) => {
  if (!showDelete && !showCopy && !showCloudAction) {
    return null
  }

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          width: '100%',
          borderTop: '0.5px solid rgba(13, 96, 68, 0.22)',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8125rem',
          width: '100%',
          pl: '0.75rem',
          pb: '0.125rem',
        }}
      >
        {showCopy && (
          <IconTextButton
            icon={<FolderCopyOutlinedIcon sx={{ width: 13, height: 13 }} />}
            text={<T keyName="sidebar.plan_settings.copy" ns="hiilikartta" />}
            onClick={onCopy}
            sx={getActionRowSx({})}
            textSx={ACTION_TEXT_SX}
            iconWrapperSx={ACTION_ICON_WRAPPER_SX}
          />
        )}

        {showDelete && (
          <IconTextButton
            icon={<Delete sx={{ width: 12, height: 12 }} />}
            text={<T keyName="sidebar.plan_settings.delete" ns="hiilikartta" />}
            onClick={onDelete}
            sx={getActionRowSx({})}
            textSx={ACTION_TEXT_SX}
            iconWrapperSx={ACTION_ICON_WRAPPER_SX}
          />
        )}

        {showCloudAction && cloudActionLabel && (
          <Box sx={{ width: '100%' }}>
            <IconTextButton
              aria-label={cloudActionLabel}
              disabled={isCloudActionDisabled}
              icon={
                cloudActionKind === 'save' ? (
                  <SaveOutlinedIcon sx={{ width: 13, height: 13 }} />
                ) : (
                  <Login sx={{ width: 15, height: 13 }} />
                )
              }
              text={cloudActionLabel}
              onClick={onCloudAction}
              sx={getActionRowSx({
                isDisabled: isCloudActionDisabled,
              })}
              textSx={ACTION_TEXT_SX}
              iconWrapperSx={ACTION_ICON_WRAPPER_SX}
            />

            {lastSavedLabel && (
              <Typography
                sx={{
                  pl: '2rem',
                  pt: '0.1875rem',
                  fontSize: '0.5rem',
                  fontWeight: 400,
                  lineHeight: '0.75rem',
                  letterSpacing: '0.08em',
                  color: '#808080',
                }}
              >
                {lastSavedLabel}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default PlanActionFooter
