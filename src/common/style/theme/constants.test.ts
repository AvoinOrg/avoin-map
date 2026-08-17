import {
  SIDEBAR_CONTENT_BOX_PADDING_X,
  SIDEBAR_HEADER_EDGE_INSET_REM,
  SIDEBAR_HEADER_TITLE_PADDING_X,
} from './constants'

const remValue = (value: string) => Number.parseFloat(value)

describe('sidebar spacing constants', () => {
  it.each(['mobile', 'desktop'] as const)(
    'aligns %s content with the sidebar header title',
    (breakpoint) => {
      expect(remValue(SIDEBAR_CONTENT_BOX_PADDING_X[breakpoint])).toBe(
        SIDEBAR_HEADER_EDGE_INSET_REM +
          remValue(SIDEBAR_HEADER_TITLE_PADDING_X[breakpoint])
      )
    }
  )
})
