import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { T } from '@tolgee/react'
import { css } from 'styled-system/css'

import { Box } from '#/components/common/PandaBox'

const acceptButtonClass = css({
  width: 'fit-content',
  minWidth: '5.125rem',
  height: '1.25rem',
  px: '0.75rem',
  py: 0,
  border: '0.2px solid #0A4835',
  borderRadius: '0.625rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textTransform: 'none',
  fontSize: '0.625rem',
  fontWeight: 700,
  lineHeight: '0.875rem',
  letterSpacing: '0.1em',
  backgroundColor: '#BCE9B4',
  color: '#111111',
  boxShadow: 'none',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#BCE9B4',
    boxShadow: 'none',
  },
  '&:disabled': {
    borderColor: 'rgba(10, 72, 53, 0.35)',
    backgroundColor: 'rgba(188, 233, 180, 0.5)',
    color: 'rgba(17, 17, 17, 0.56)',
    cursor: 'default',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(17,17,17,0.4)',
    outlineOffset: '2px',
  },
})

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
      <BaseButton
        type="button"
        aria-label="Accept imported plan"
        disabled={isAcceptDisabled}
        onClick={isAcceptDisabled ? undefined : onClickAccept}
        className={acceptButtonClass}
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
      </BaseButton>
    </Box>
  )
}

export default PlanImportActionsRow
