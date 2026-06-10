import React from 'react'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'

type Props = {
  styleProps?: PandaStyleProp
}

const SaveIcon = ({ styleProps }: Props) => {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      styleProps={[
        {
          width: '1.5rem',
          height: '1.5rem',
          display: 'inline-block',
          flexShrink: 0,
        },
        ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
      ]}
    >
      <path
        d="M5 3.5h11.25L19 6.25V20.5H5V3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8 3.5v5h7v-5M8 20.5v-7h8v7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Box>
  )
}

export default SaveIcon
