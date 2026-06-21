'use client'

import React from 'react'

import { Box, type AppBoxProps } from '#/common/style/theme'
import IconTextButton from '#/components/common/IconTextButton'
import TText from '#/components/common/TText'
import { Delete, FolderCopy, Login, Save } from '#/components/icons'

export const PLAN_ACTION_BUTTON_COLOR = '#666666'
export const PLAN_ACTION_BUTTON_HOVER_COLOR = '#4F4F4F'

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
  sx?: AppBoxProps['sx']
}

const getActionRowSx = ({ isDisabled = false }: { isDisabled?: boolean }) => ({
  color: isDisabled ? 'rgba(102, 102, 102, 0.56)' : PLAN_ACTION_BUTTON_COLOR,
  '&:hover': isDisabled
    ? undefined
    : {
        color: PLAN_ACTION_BUTTON_HOVER_COLOR,
      },
  '&:disabled, &[data-disabled], &[aria-disabled="true"]': {
    color: 'inherit',
    opacity: 1,
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
            icon={<FolderCopy sx={{ width: 13, height: 13 }} />}
            text={
              <TText keyName="sidebar.plan_settings.copy" ns="hiilikartta" />
            }
            onClick={onCopy}
            sx={getActionRowSx({})}
            textSx={ACTION_TEXT_SX}
            iconWrapperSx={ACTION_ICON_WRAPPER_SX}
          />
        )}

        {showDelete && (
          <IconTextButton
            icon={<Delete sx={{ width: 12, height: 12 }} />}
            text={
              <TText keyName="sidebar.plan_settings.delete" ns="hiilikartta" />
            }
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
                  <Save sx={{ width: 13, height: 13 }} />
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
              <Box
                component="p"
                sx={{
                  m: 0,
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
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default PlanActionFooter
