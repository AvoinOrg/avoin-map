'use client'

import { useEffect, useRef, useState } from 'react'

import { useUIStore } from '#/common/store/uiStore'
import { Box } from '#/common/style/theme'
import { Button } from '#/components/common/Button'
import { LoadingModal } from '#/components/Loading'
import { ClickableModal } from '#/components/Modal'

import {
  BaselineExample,
  BaselineInlineGroup,
  BaselineSection,
} from './BaselineContent'

const loadingModalDisplayMs = 2000

const clickableModalBody = (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      color: '#111111',
      lineHeight: 1.5,
    }}
  >
    <Box component="h2" sx={{ m: 0, fontSize: '1.25rem', lineHeight: 1.25 }}>
      Shared ClickableModal
    </Box>
    <Box component="p" sx={{ m: 0 }}>
      This body is rendered by the shared ClickableModal component.
    </Box>
  </Box>
)

const ModalsContent = () => {
  const setIsLoginModalOpen = useUIStore((state) => state.setIsLoginModalOpen)
  const triggerConfirmationDialog = useUIStore(
    (state) => state.triggerConfirmationDialog
  )
  const [confirmationStatus, setConfirmationStatus] = useState('Not opened')
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const loadingModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    return () => {
      if (loadingModalTimeoutRef.current != null) {
        clearTimeout(loadingModalTimeoutRef.current)
      }
    }
  }, [])

  const openConfirmationDialog = () => {
    setConfirmationStatus('Waiting for action')
    void triggerConfirmationDialog({
      title: 'Confirm baseline action?',
      content:
        'This dialog is opened through the global confirmation dialog store.',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        setConfirmationStatus('Confirmed')
      },
      onCancel: () => {
        setConfirmationStatus('Cancelled')
      },
    })
  }

  const openLoadingModal = () => {
    if (loadingModalTimeoutRef.current != null) {
      clearTimeout(loadingModalTimeoutRef.current)
    }

    setIsLoadingModalOpen(true)
    loadingModalTimeoutRef.current = setTimeout(() => {
      setIsLoadingModalOpen(false)
      loadingModalTimeoutRef.current = null
    }, loadingModalDisplayMs)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <BaselineSection title="Shared modal components">
        <BaselineExample title="ClickableModal">
          <ClickableModal
            triggerAriaLabel="Open ClickableModal baseline modal"
            modalBody={clickableModalBody}
          >
            Open ClickableModal
          </ClickableModal>
        </BaselineExample>

        <BaselineExample title="LoadingModal">
          <BaselineInlineGroup>
            <Button variant="outlined" onClick={openLoadingModal}>
              Show LoadingModal
            </Button>
            <Box
              component="span"
              sx={{
                color: '#111111',
                fontSize: '0.8125rem',
                lineHeight: 1.35,
              }}
            >
              {isLoadingModalOpen ? 'Visible' : 'Hidden'}
            </Box>
          </BaselineInlineGroup>
          {isLoadingModalOpen && <LoadingModal />}
        </BaselineExample>
      </BaselineSection>

      <BaselineSection title="Global modal store triggers">
        <BaselineExample title="LoginModal">
          <Button
            variant="outlined"
            onClick={() => setIsLoginModalOpen(true)}
          >
            Open LoginModal
          </Button>
        </BaselineExample>

        <BaselineExample title="ConfirmationDialog">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button variant="outlined" onClick={openConfirmationDialog}>
              Open ConfirmationDialog
            </Button>
            <Box
              component="span"
              sx={{
                color: '#111111',
                fontSize: '0.8125rem',
                lineHeight: 1.35,
              }}
            >
              Confirmation status: {confirmationStatus}
            </Box>
          </Box>
        </BaselineExample>
      </BaselineSection>
    </Box>
  )
}

export default ModalsContent
