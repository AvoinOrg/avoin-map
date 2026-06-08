import type { SystemStyleObject } from 'styled-system/types'

export type PandaStyleObject = SystemStyleObject
export type PandaStyleProp = PandaStyleObject | PandaStyleObject[] | undefined

// Import `css` and `cx` directly from `styled-system/css` in migrated files.
// Use `css(baseStyle, overrideStyle)` as the Panda equivalent of MUI sx arrays.
