'use client'
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type SlotKey = string | symbol
type Slots = Map<SlotKey, HTMLElement>

type SlotsContextValue = {
  slots: Slots
  revision: number
  bumpRevision: () => void
}

const SlotsContext = createContext<SlotsContextValue | null>(null)

export const SlotsProvider = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<Slots>(new Map()) // stable across renders
  const [revision, setRevision] = useState(0)
  const bumpRevision = useCallback(() => {
    setRevision((previous) => previous + 1)
  }, [])
  const value = useMemo(
    () => ({
      slots: ref.current,
      revision,
      bumpRevision,
    }),
    [bumpRevision, revision]
  )

  return (
    <SlotsContext.Provider value={value}>
      {children}
    </SlotsContext.Provider>
  )
}

export const useSlots = () => {
  const context = useContext(SlotsContext)
  if (!context) throw new Error('Wrap your app with <SlotsProvider>')
  return context.slots
}

export const useSlotContent = (name: SlotKey): boolean => {
  const context = useContext(SlotsContext)
  if (!context) throw new Error('Wrap your app with <SlotsProvider>')
  const { slots, revision } = context
  void revision
  return slots.has(name)
}

/** Host-side: place this where content should land */
export const Slot = ({
  name,
  className,
  style,
}: {
  name: SlotKey
  className?: string
  style?: React.CSSProperties
}) => {
  const context = useContext(SlotsContext)
  if (!context) throw new Error('Wrap your app with <SlotsProvider>')
  const { slots, bumpRevision } = context

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
        bumpRevision()
      } else {
        slots.delete(name)
        bumpRevision()
      }
    },
    [bumpRevision, slots, name]
  )

  return <div ref={setRef} className={className} style={style} />
}

/** Consumer-side: portal children into a named slot, if/when it exists */
export const IntoSlot = ({
  name,
  children,
}: {
  name: SlotKey
  children: React.ReactNode
}) => {
  const context = useContext(SlotsContext)
  if (!context) throw new Error('Wrap your app with <SlotsProvider>')
  const { slots, revision } = context
  void revision
  const target = slots.get(name) ?? null
  return target ? createPortal(children, target) : null
}
