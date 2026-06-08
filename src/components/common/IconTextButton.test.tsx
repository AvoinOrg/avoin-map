import '@testing-library/jest-dom'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'

import Cross from '#/components/icons/Cross'
import IconTextButton from './IconTextButton'

type TooltipChangeDetails = {
  reason: string
  event: Event
  cancel: () => void
  allowPropagation: () => void
  isCanceled: boolean
  isPropagationAllowed: boolean
  trigger: Element | undefined
  preventUnmountOnClose: () => void
}

jest.mock('@base-ui/react/tooltip', () => {
  const React = jest.requireActual<typeof import('react')>('react')

  type TooltipContextValue = {
    disabled?: boolean
    open: boolean
    onOpenChange?: (open: boolean, eventDetails: TooltipChangeDetails) => void
  }

  const TooltipContext = React.createContext<TooltipContextValue>({
    open: false,
  })

  const getNativeEvent = (event: React.SyntheticEvent): Event => {
    return event.nativeEvent instanceof Event
      ? event.nativeEvent
      : new Event(event.type)
  }

  const createDetails = (
    reason: string,
    event: React.SyntheticEvent
  ): TooltipChangeDetails => {
    const nativeEvent = getNativeEvent(event)
    const target = nativeEvent.target

    return {
      reason,
      event: nativeEvent,
      cancel: () => undefined,
      allowPropagation: () => undefined,
      isCanceled: false,
      isPropagationAllowed: false,
      trigger: target instanceof Element ? target : undefined,
      preventUnmountOnClose: () => undefined,
    }
  }

  const Root = ({
    children,
    disabled,
    onOpenChange,
    open = false,
  }: React.PropsWithChildren<TooltipContextValue>) =>
    React.createElement(
      TooltipContext.Provider,
      { value: { disabled, onOpenChange, open } },
      children
    )

  const Trigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      closeDelay?: number
      delay?: number
    }
  >(
    (
      {
        children,
        closeDelay: _closeDelay,
        delay: _delay,
        disabled,
        onBlur,
        onClick,
        onFocus,
        onMouseEnter,
        onMouseLeave,
        ...props
      },
      ref
    ) => {
      const context = React.useContext(TooltipContext)
      const isDisabled = Boolean(disabled || context.disabled)
      void _closeDelay
      void _delay

      return React.createElement(
        'button',
        {
          ...props,
          disabled: isDisabled,
          onBlur: (event: React.FocusEvent<HTMLButtonElement>) => {
            onBlur?.(event)
            if (!isDisabled) {
              context.onOpenChange?.(false, createDetails('trigger-focus', event))
            }
          },
          onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
            if (!isDisabled) {
              context.onOpenChange?.(true, createDetails('trigger-press', event))
            }
            onClick?.(event)
          },
          onFocus: (event: React.FocusEvent<HTMLButtonElement>) => {
            onFocus?.(event)
            if (!isDisabled) {
              context.onOpenChange?.(true, createDetails('trigger-focus', event))
            }
          },
          onMouseEnter: (event: React.MouseEvent<HTMLButtonElement>) => {
            onMouseEnter?.(event)
            if (!isDisabled) {
              context.onOpenChange?.(true, createDetails('trigger-hover', event))
            }
          },
          onMouseLeave: (event: React.MouseEvent<HTMLButtonElement>) => {
            onMouseLeave?.(event)
            if (!isDisabled) {
              context.onOpenChange?.(false, createDetails('trigger-hover', event))
            }
          },
          ref,
        },
        children
      )
    }
  )

  Trigger.displayName = 'MockTooltipTrigger'

  const Portal = ({ children }: React.PropsWithChildren) =>
    React.createElement(React.Fragment, null, children)

  const Positioner = ({
    children,
    collisionPadding: _collisionPadding,
    positionMethod: _positionMethod,
    side: _side,
    sideOffset: _sideOffset,
    ...props
  }: React.PropsWithChildren<
    React.HTMLAttributes<HTMLDivElement> & {
      collisionPadding?: number
      positionMethod?: string
      side?: string
      sideOffset?: number
    }
  >) => {
    const context = React.useContext(TooltipContext)
    void _collisionPadding
    void _positionMethod
    void _side
    void _sideOffset

    if (!context.open) {
      return null
    }

    return React.createElement('div', props, children)
  }

  const Popup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(({ children, ...props }, ref) =>
    React.createElement('div', { ...props, ref, role: 'tooltip' }, children)
  )

  Popup.displayName = 'MockTooltipPopup'

  const Arrow = (props: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', props)

  return {
    Tooltip: {
      Arrow,
      Popup,
      Portal,
      Positioner,
      Root,
      Trigger,
    },
  }
})

describe('IconTextButton', () => {
  it('opens the helper on hover and focus, then closes it when the trigger leaves', () => {
    render(
      <IconTextButton
        icon={<Cross />}
        text="Import plan"
        helperText="Helpful import context"
        helperAriaLabel="Show import help"
      />
    )

    const helperTrigger = screen.getByRole('button', {
      name: 'Show import help',
    })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.mouseEnter(helperTrigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful import context'
    )

    fireEvent.mouseLeave(helperTrigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.focus(helperTrigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful import context'
    )

    fireEvent.blur(helperTrigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('keeps click-open helper content pinned until outside click or Escape', () => {
    render(
      <IconTextButton
        icon={<Cross />}
        text="Import plan"
        helperText="Helpful import context"
        helperAriaLabel="Show import help"
      />
    )

    const helperTrigger = screen.getByRole('button', {
      name: 'Show import help',
    })

    fireEvent.click(helperTrigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful import context'
    )

    fireEvent.mouseLeave(helperTrigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful import context'
    )

    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    fireEvent.click(helperTrigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Helpful import context'
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('does not open the helper while disabled', () => {
    render(
      <IconTextButton
        icon={<Cross />}
        text="Import plan"
        helperText="Helpful import context"
        helperAriaLabel="Show import help"
        disabled
      />
    )

    const helperTrigger = screen.getByRole('button', {
      name: 'Show import help',
    })

    expect(helperTrigger).toBeDisabled()

    fireEvent.mouseEnter(helperTrigger)
    fireEvent.click(helperTrigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
