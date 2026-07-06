'use client'

import React, { useState } from 'react'

import { useUIStore } from '#/common/store/uiStore'
import { Box } from '#/common/style/theme'
import type { NotificationMessage } from '#/common/types/state'
import { Button } from '#/components/common/Button'
import { NumberInputField } from '#/components/common/NumberInputField'

import {
  BaselineExample,
  BaselineInlineGroup,
  BaselineSection,
} from './BaselineContent'

const notificationVariants: NotificationMessage['variant'][] = [
  'default',
  'info',
  'success',
  'warning',
  'error',
]

const normalizeDurationSeconds = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(Math.round(value), 0), 60)
}

const NotificationTriggerButton = ({
  notificationVariant,
  durationSeconds,
}: {
  notificationVariant: NotificationMessage['variant']
  durationSeconds: number
}) => {
  const notify = useUIStore((state) => state.notify)

  const handleClick = () => {
    const durationText =
      durationSeconds === 0
        ? 'persistent'
        : `${durationSeconds} second${durationSeconds === 1 ? '' : 's'}`

    void notify({
      message: `UI baseline ${notificationVariant} notification (${durationText}).`,
      variant: notificationVariant,
      ...(durationSeconds === 0
        ? { persist: true }
        : { duration: durationSeconds * 1000 }),
    })
  }

  return (
    <Button variant="outlined" onClick={handleClick}>
      {notificationVariant}
    </Button>
  )
}

const NotificationsContent = () => {
  const [durationSeconds, setDurationSeconds] = useState<number | null>(6)
  const normalizedDurationSeconds = normalizeDurationSeconds(durationSeconds)

  const handleDurationChange: React.ComponentProps<
    typeof NumberInputField
  >['onValueChange'] = (nextValue) => {
    if (typeof nextValue === 'number' || nextValue === null) {
      setDurationSeconds(nextValue)
    }
  }

  const handleDurationCommit: React.ComponentProps<
    typeof NumberInputField
  >['onValueCommitted'] = (nextValue) => {
    if (typeof nextValue === 'number' || nextValue === null) {
      setDurationSeconds(normalizeDurationSeconds(nextValue))
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <BaselineSection title="Notification duration">
        <BaselineExample title="Duration in seconds">
          <NumberInputField
            label="Duration"
            helperText="0 keeps the notification open until dismissed."
            min={0}
            max={60}
            step={1}
            value={durationSeconds}
            onValueChange={handleDurationChange}
            onValueCommitted={handleDurationCommit}
            inputSlotProps={{
              inputMode: 'numeric',
              'aria-label': 'Notification duration seconds',
            }}
            format={{ maximumFractionDigits: 0 }}
          />
        </BaselineExample>
      </BaselineSection>

      <BaselineSection title="Notification variants">
        <BaselineExample title="Trigger through UI store">
          <BaselineInlineGroup>
            {notificationVariants.map((notificationVariant) => (
              <NotificationTriggerButton
                key={notificationVariant}
                notificationVariant={notificationVariant}
                durationSeconds={normalizedDurationSeconds}
              />
            ))}
          </BaselineInlineGroup>
        </BaselineExample>
      </BaselineSection>
    </Box>
  )
}

export default NotificationsContent
