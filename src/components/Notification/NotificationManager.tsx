import React, { useEffect } from 'react'
import { Toast as BaseToast } from '@base-ui/react/toast'
import { css } from 'styled-system/css'

import { useUIStore } from '#/common/store/uiStore'
import { useTranslate } from '@tolgee/react'

const messageContentClass = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

const messageClass = css({
  whiteSpace: 'pre-line',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
})

const linkClass = css({
  cursor: 'pointer',
  color: 'inherit',
  fontFamily: 'var(--font-arimo)',
  fontSize: '0.875rem',
  fontWeight: 500,
  lineHeight: 'normal',
  letterSpacing: '0.0875rem',
  textDecoration: 'underline',
})

const NotificationContent = ({
  message,
  link,
}: {
  message: string
  link?: {
    href: string
    label: string
  }
}) => {
  return (
    <div className={messageContentClass}>
      <span className={messageClass}>{message}</span>
      {link != null && (
        <a className={linkClass} href={link.href}>
          {link.label}
        </a>
      )}
    </div>
  )
}

const NotificationManager = () => {
  const toastManager = BaseToast.useToastManager()
  const { t } = useTranslate('avoin-map')
  const notifications = useUIStore((state) => state.notifications)
  const updateNotification = useUIStore((state) => state.updateNotification)

  useEffect(() => {
    if (notifications != null) {
      Object.values(notifications).forEach((notification) => {
        if (!notification.shown) {
          const message =
            notification.message ??
            (notification.keyName
              ? t(
                  notification.keyName,
                  notification.ns ? { ns: notification.ns } : undefined
                )
              : '')
          if (!message) {
            console.warn(
              '[NotificationManager] Notification missing message/keyName:',
              notification.id
            )
            updateNotification(notification.id, { shown: true })
            return
          }
          updateNotification(notification.id, { shown: true })

          const linkLabel =
            notification.link?.label ??
            (notification.link?.keyName
              ? t(
                  notification.link.keyName,
                  notification.link.ns
                    ? { ns: notification.link.ns }
                    : undefined
                )
              : undefined)

          toastManager.add({
            id: notification.id,
            type: notification.variant || 'default',
            timeout: notification.persist ? 0 : notification.duration,
            priority: notification.variant === 'error' ? 'high' : 'low',
            description: (
              <NotificationContent
                message={message}
                link={
                  notification.link != null && linkLabel != null
                    ? {
                        href: notification.link.href,
                        label: linkLabel,
                      }
                    : undefined
                }
              />
            ),
          })
        }
      })
    }
  }, [notifications, toastManager, t, updateNotification])

  return <></>
}

export default NotificationManager
