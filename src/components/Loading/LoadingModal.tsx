import React from 'react'
import { css } from 'styled-system/css'

import { LoadingSpinner } from './LoadingSpinner'

const modalClass = css({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  padding: '64px 10px 200px 10px',
  zIndex: 'calc(var(--z-index-modal) + 1)',
  backgroundColor: 'white',
  overflowY: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const LoadingModal = () => {
  return (
    <div className={modalClass}>
      <LoadingSpinner color="secondary" size={200} />
    </div>
  )
}
