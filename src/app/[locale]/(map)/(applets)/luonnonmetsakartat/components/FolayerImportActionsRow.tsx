import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css } from 'styled-system/css'

import { appTypography } from '#/common/style/theme/tokens'
import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'

const acceptButtonClass = css({
  m: 0,
  p: 0,
  border: 0,
  backgroundColor: 'transparent',
  ...appTypography.h3,
  textDecoration: 'underline',
  color: 'inherit',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'secondary.main',
    outlineOffset: '2px',
  },
  '&[data-disabled]': {
    color: 'neutral.main',
    cursor: 'default',
  },
})

const FolayerImportActionsRow = ({
  onClickAccept,
  isAcceptDisabled,
}: {
  onClickAccept: () => void
  isAcceptDisabled: boolean
}) => {
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
      <BaseButton
        type="button"
        aria-label="Accept imported forest layer"
        disabled={isAcceptDisabled}
        className={acceptButtonClass}
        onClick={isAcceptDisabled ? undefined : onClickAccept}
      >
        <TText keyName="sidebar.admin.create.accept" ns="luonnonmetsakartat" />
      </BaseButton>
    </Box>
  )
}

export default FolayerImportActionsRow
