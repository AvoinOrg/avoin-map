import type { AppSxProps } from '#/common/style/theme'
import { Box as ThemeBox } from '#/common/style/theme'
import type { ComponentProps, ComponentType, ElementType } from 'react'

export type SharedSvgIconProps = {
  sx?: AppSxProps
  component?: ElementType
}

export const SharedSvgIcon =
  ThemeBox as unknown as ComponentType<
    ComponentProps<'svg'> & SharedSvgIconProps
  >
