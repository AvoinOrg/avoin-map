import { round } from 'lodash-es'
import { ColorStop } from '../types/map'

//TODO: FIX PP to format numbers correctly
export const pp = (x: number, precision = 2) => round(x, precision)

export const assert = (expr: any, message: any) => {
  if (!expr) throw new Error(`Assertion error: ${message}`)
}

export const generateUUID = () => {
  let d = new Date().getTime()
  let d2 =
    (typeof performance !== 'undefined' &&
      performance.now &&
      performance.now() * 1000) ||
    0

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16
    if (d > 0) {
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c == 'x' ? r : (r & 0x7) | 0x8).toString(16)
  })
}

export const generateShortId = () => {
  let id = generateUUID()
  id = id.replaceAll('-', '')
  id = id.substring(0, 20)

  return id
}

export const mergeArraysAlternate = <T>(a: T[], b: T[]) => {
  const result = []

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) result.push(a[i])
    if (i < b.length) result.push(b[i])
  }

  return result
}

export const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '').trim()
  const n =
    h.length === 3
      ? h
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : h
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return [r, g, b]
}

const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * t
}

export const lerpColor = (c0: string, c1: string, t: number): string => {
  const [r0, g0, b0] = hexToRgb(c0)
  const [r1, g1, b1] = hexToRgb(c1)
  const r = Math.round(lerp(r0, r1, t))
  const g = Math.round(lerp(g0, g1, t))
  const b = Math.round(lerp(b0, b1, t))
  return `rgba(${r},${g},${b},1)`
}

export const colorAtValue = (stops: ColorStop[], v: number): string => {
  // assumes stops sorted by value
  if (v <= stops[0].value) return stops[0].color
  const last = stops[stops.length - 1]
  if (v >= last.value) return last.color
  // find bracketing segment
  let i = 0
  while (
    i < stops.length - 1 &&
    !(v >= stops[i].value && v <= stops[i + 1].value)
  )
    i++
  const a = stops[i],
    b = stops[i + 1]
  const t = (v - a.value) / (b.value - a.value)
  return lerpColor(a.color, b.color, t)
}
