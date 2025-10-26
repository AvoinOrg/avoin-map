'use client'
import React, { createContext, useContext, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'

type SlotKey = string | symbol
type Slots = Map<SlotKey, HTMLElement>

const SlotsContext = createContext<Slots | null>(null)

export const SlotsProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<Slots>(new Map()) // stable across renders
  return (
    <SlotsContext.Provider value={ref.current}>
      {children}
    </SlotsContext.Provider>
  )
}

export const useSlots = () => {
  const slots = useContext(SlotsContext)
  if (!slots) throw new Error('Wrap your app with <SlotsProvider>')
  return slots
}

export const useSlotContent = (name: SlotKey): boolean => {
  const slots = useSlots()
  return slots.has(name)
}

/** Host-side: place this where content should land */
export const Slot = ({ name }: { name: SlotKey }) => {
  const slots = useSlots()

  // Callback ref avoids extra renders and handles mount/unmount neatly
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        // dev-only sanity check for duplicate names:
        if (process.env.NODE_ENV !== 'production' && slots.has(name)) {
          // last-wins; warn if you expect uniqueness
          console.warn(
            `Slot "${String(name)}" already exists; replacing target.`
          )
        }
        slots.set(name, el)
      } else {
        slots.delete(name)
      }
    },
    [slots, name]
  )

  return <div ref={setRef} />
}

/** Consumer-side: portal children into a named slot, if/when it exists */
export const IntoSlot = ({
  name,
  children,
}: {
  name: SlotKey
  children: React.ReactNode
}) => {
  const slots = useSlots()
  const target = slots.get(name) ?? null
  return target ? createPortal(children, target) : null
}
