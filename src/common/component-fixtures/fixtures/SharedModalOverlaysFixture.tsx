'use client'

import React from 'react'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import { useUIStore } from '#/common/store/uiStore'
import { ClickableModal, LoginModal } from '#/components/Modal'

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
      Shared modal body
    </Box>
    <Box component="p" sx={{ m: 0 }}>
      The migrated modal keeps the trigger semantics, close control, focus
      boundary, and scrollable content surface while using Base UI dialog
      primitives.
    </Box>
    <Box component="p" sx={{ m: 0 }}>
      This text is intentionally long enough to make the desktop width and
      scrollable content area easy to inspect in fixture screenshots.
    </Box>
  </Box>
)

const OpenClickableModal = ({
  triggerAriaLabel,
  sx,
}: {
  triggerAriaLabel: string
  sx?: React.ComponentProps<typeof ClickableModal>['sx']
}) => {
  return (
    <ClickableModal
      defaultOpen
      triggerAriaLabel={triggerAriaLabel}
      modalBody={clickableModalBody}
      sx={sx}
      textContainerSx={{ maxWidth: 680 }}
    >
      Open shared modal
    </ClickableModal>
  )
}

const LoginModalFixtureState = ({
  isSidebarOpen,
  sidebarWidth,
}: {
  isSidebarOpen: boolean
  sidebarWidth?: number
}) => {
  React.useEffect(() => {
    useUIStore.setState({
      isLoginModalOpen: true,
      isSidebarOpen,
      sidebarWidth,
    })

    return () => {
      useUIStore.setState({
        isLoginModalOpen: false,
        isSidebarOpen: true,
        sidebarWidth: undefined,
      })
    }
  }, [isSidebarOpen, sidebarWidth])

  return (
    <Box sx={{ minWidth: 320, minHeight: 180 }}>
      <LoginModal iframeSrc="about:blank" />
    </Box>
  )
}

export const sharedModalOverlaysFixture: ComponentFixture = {
  id: 'shared-modal-overlays',
  label: 'Shared modal overlays',
  description:
    'Shared modal overlay states for Base UI dialog migration coverage.',
  sourceGlobs: [
    'src/components/Modal/ClickableModal.tsx',
    'src/components/Modal/LoginModal.tsx',
    'src/components/Modal/index.ts',
    'src/components/Modal/ClickableModal.test.tsx',
    'src/components/Modal/LoginModal.test.tsx',
    'src/common/component-fixtures/fixtures/SharedModalOverlaysFixture.tsx',
  ],
  states: [
    {
      id: 'clickable-closed-trigger',
      label: 'Clickable closed trigger',
      description:
        'Closed ClickableModal with only the native button trigger visible.',
      render: () => (
        <ClickableModal
          triggerAriaLabel="Open fixture modal"
          modalBody={clickableModalBody}
        >
          Open shared modal
        </ClickableModal>
      ),
    },
    {
      id: 'clickable-open-modal',
      label: 'Clickable open modal',
      description:
        'ClickableModal after the trigger opens the Base UI dialog popup.',
      waitFor: 'role=dialog',
      render: () => (
        <OpenClickableModal triggerAriaLabel="Open fixture modal state" />
      ),
    },
    {
      id: 'clickable-desktop-width',
      label: 'Clickable desktop width',
      description:
        'Open ClickableModal with representative copy for the 800px desktop surface.',
      waitFor: 'role=dialog',
      render: () => (
        <OpenClickableModal triggerAriaLabel="Open desktop width modal" />
      ),
    },
    {
      id: 'clickable-mobile-fullscreen-width',
      label: 'Clickable mobile full width',
      description:
        'Open ClickableModal state for mobile full-width and viewport-height behavior.',
      waitFor: 'role=dialog',
      render: () => (
        <OpenClickableModal
          triggerAriaLabel="Open mobile full width modal"
          sx={{ minHeight: { mobile: '100vh', desktop: 'auto' } }}
        />
      ),
    },
    {
      id: 'login-desktop-sidebar-offset',
      label: 'Login desktop sidebar offset',
      description:
        'Open LoginModal seeded from the UI store with a desktop sidebar offset.',
      waitFor: 'role=dialog',
      render: () => (
        <LoginModalFixtureState isSidebarOpen sidebarWidth={360} />
      ),
    },
    {
      id: 'login-mobile-fullscreen',
      label: 'Login mobile fullscreen',
      description:
        'Open LoginModal seeded from the UI store for mobile fullscreen coverage.',
      waitFor: 'role=dialog',
      render: () => <LoginModalFixtureState isSidebarOpen={false} />,
    },
  ],
}
