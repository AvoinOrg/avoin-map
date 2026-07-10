import React from 'react'
import { closeSnackbar } from 'notistack'

import type { ComponentFixture } from '#/common/component-fixtures/types'
import { Box } from '#/common/style/theme'
import { useUIStore } from '#/common/store/uiStore'
import type { NotificationMessage } from '#/common/types/state'
import ConfirmationDialog from '#/components/Notification/ConfirmationDialog'

type NotificationStateId = 'visible' | 'link' | 'persistent'

const notificationByState: Record<NotificationStateId, NotificationMessage> = {
  visible: {
    message: 'Fixture notification is visible.',
    variant: 'success',
    duration: 120000,
  },
  link: {
    message: 'Fixture notification includes a link.',
    variant: 'info',
    duration: 120000,
    link: {
      href: '/en/dev/component-fixtures',
      label: 'Open fixture index',
    },
  },
  persistent: {
    message: 'Persistent fixture notification stays open.',
    variant: 'warning',
    persist: true,
  },
}

const resetFeedbackState = () => {
  closeSnackbar()
  useUIStore.setState({
    notifications: {},
    confirmationDialogOptions: { id: null },
  })
}

const FixtureCanvasLabel = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 320,
      minHeight: 96,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#243124',
      fontSize: '0.875rem',
      lineHeight: 1.5,
      textAlign: 'center',
    }}
  >
    {children}
  </Box>
)

const NotificationFixtureState = ({
  stateId,
}: {
  stateId: NotificationStateId
}) => {
  React.useEffect(() => {
    resetFeedbackState()
    void useUIStore.getState().notify(notificationByState[stateId])

    return () => {
      resetFeedbackState()
    }
  }, [stateId])

  return (
    <FixtureCanvasLabel>
      The seeded snackbar renders through the global notification provider.
    </FixtureCanvasLabel>
  )
}

const ConfirmationFixtureState = () => {
  const [status, setStatus] = React.useState('Waiting for action')

  React.useEffect(() => {
    resetFeedbackState()
    void useUIStore.getState().triggerConfirmationDialog({
      title: 'Discard fixture changes?',
      content:
        'This confirmation dialog is seeded from the global UI store for fixture coverage.',
      confirmText: 'Discard',
      cancelText: 'Keep editing',
      onConfirm: () => {
        setStatus('Confirmed')
      },
      onCancel: () => {
        setStatus('Cancelled')
      },
    })

    return () => {
      resetFeedbackState()
    }
  }, [])

  return (
    <>
      <FixtureCanvasLabel>Confirmation status: {status}</FixtureCanvasLabel>
      <ConfirmationDialog />
    </>
  )
}

export const notificationFeedbackFixture: ComponentFixture = {
  id: 'notification-feedback',
  label: 'Notification feedback',
  description:
    'Global snackbar and confirmation dialog states for feedback migration coverage.',
  sourceGlobs: [
    'src/components/Notification/NotificationProvider.tsx',
    'src/components/Notification/NotificationManager.tsx',
    'src/components/Notification/ConfirmationDialog.tsx',
    'src/common/component-fixtures/fixtures/NotificationFeedbackFixture.tsx',
  ],
  states: [
    {
      id: 'snackbar-visible',
      label: 'Snackbar visible',
      description: 'Visible default notification with a long auto-hide duration.',
      waitFor: 'text=Fixture notification is visible.',
      render: () => <NotificationFixtureState stateId="visible" />,
    },
    {
      id: 'snackbar-link',
      label: 'Snackbar link',
      description: 'Visible notification with an underlined link action.',
      waitFor: 'text=Open fixture index',
      render: () => <NotificationFixtureState stateId="link" />,
    },
    {
      id: 'snackbar-persistent',
      label: 'Snackbar persistent',
      description: 'Persistent notification that remains until closed.',
      waitFor: 'text=Persistent fixture notification stays open.',
      render: () => <NotificationFixtureState stateId="persistent" />,
    },
    {
      id: 'confirmation-open',
      label: 'Confirmation open',
      description: 'Open confirmation dialog seeded from the UI store.',
      waitFor: 'role=dialog',
      render: () => <ConfirmationFixtureState />,
    },
  ],
}
