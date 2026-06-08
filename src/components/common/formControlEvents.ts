import type React from 'react'

export type FormSelectionEvent<Value = string> = Event & {
  target: {
    value: Value
    name: string
  }
}

export type FormCheckedChangeEvent = Event & {
  target: {
    checked: boolean
    name: string
    value?: string
  }
}

type BaseUIEventDetails = {
  event?: Event
}

export const createSelectionEvent = <Value,>({
  value,
  name,
  eventDetails,
}: {
  value: Value
  name?: string
  eventDetails?: BaseUIEventDetails
}): FormSelectionEvent<Value> => {
  const nativeEvent =
    eventDetails?.event ?? new Event('change', { bubbles: true })
  const target = {
    value,
    name: name ?? '',
  }

  return {
    nativeEvent,
    type: nativeEvent.type,
    target,
    currentTarget: target,
    preventDefault: () => nativeEvent.preventDefault(),
    stopPropagation: () => nativeEvent.stopPropagation(),
    defaultPrevented: nativeEvent.defaultPrevented,
  } as unknown as FormSelectionEvent<Value>
}

export const createCheckedChangeEvent = ({
  checked,
  name,
  value,
  eventDetails,
}: {
  checked: boolean
  name?: string
  value?: string
  eventDetails?: BaseUIEventDetails
}): FormCheckedChangeEvent => {
  const nativeEvent =
    eventDetails?.event ?? new Event('change', { bubbles: true })
  const target = {
    checked,
    name: name ?? '',
    value,
  }

  return {
    nativeEvent,
    type: nativeEvent.type,
    target,
    currentTarget: target,
    preventDefault: () => nativeEvent.preventDefault(),
    stopPropagation: () => nativeEvent.stopPropagation(),
    defaultPrevented: nativeEvent.defaultPrevented,
  } as unknown as FormCheckedChangeEvent
}

export type NativeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'children' | 'className' | 'style'
>

export type NativeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children' | 'className' | 'style'
>
