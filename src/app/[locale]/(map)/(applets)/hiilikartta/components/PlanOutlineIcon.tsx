import React from 'react'

import { Box, type AppSystemStyleObject } from '#/common/style/theme'

type Props = {
  sx?: AppSystemStyleObject
  variant?: 'small' | 'large'
}

const LARGE_VIEWBOX = '0 0 17 12.5'
const LARGE_PATH =
  'M16.5 6.60224V1C16.5 0.723858 16.2761 0.5 16 0.5H1C0.723858 0.5 0.5 0.723858 0.5 1V11.5C0.5 11.7761 0.723858 12 1 12H8.1703C8.37032 12 8.55109 11.8808 8.62987 11.697L9.90006 8.73319C9.96288 8.58662 10.0918 8.47881 10.2472 8.44295L16.1124 7.08944C16.3393 7.03709 16.5 6.83507 16.5 6.60224Z'
const SMALL_VIEWBOX = '0 0 12 9'
const SMALL_PATH =
  'M11.5 4.62504V1C11.5 0.723858 11.2761 0.5 11 0.5H1C0.723858 0.5 0.5 0.723858 0.5 1V8C0.5 8.27614 0.723857 8.5 1 8.5H5.66878C5.86956 8.5 6.05087 8.37989 6.12918 8.195L6.9321 6.29931C6.9944 6.15221 7.12325 6.04374 7.27881 6.00741L11.1137 5.11194C11.34 5.05911 11.5 4.85738 11.5 4.62504Z'

const SvgBox = Box as unknown as React.ComponentType<
  React.ComponentProps<'svg'> & {
    component?: 'svg'
    sx?: AppSystemStyleObject
  }
>

const PlanOutlineIcon = ({ sx, variant = 'small' }: Props) => {
  const isLarge = variant === 'large'

  return (
    <SvgBox
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={isLarge ? LARGE_VIEWBOX : SMALL_VIEWBOX}
      sx={[
        {
          display: 'block',
          width: isLarge ? '1rem' : '0.8125rem',
          height: isLarge ? '0.75rem' : '0.625rem',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <path
        d={isLarge ? LARGE_PATH : SMALL_PATH}
        stroke="currentColor"
        strokeLinecap={isLarge ? 'round' : undefined}
        strokeDasharray={isLarge ? '3 3' : '1 1'}
      />
    </SvgBox>
  )
}

export default PlanOutlineIcon
