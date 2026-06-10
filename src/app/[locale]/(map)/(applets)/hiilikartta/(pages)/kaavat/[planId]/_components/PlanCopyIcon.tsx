import React from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'

type Props = {
  sx?: PandaStyleProp
}

const PlanCopyIcon = ({ sx }: Props) => {
  return (
    <Box
      component="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      sx={[
        {
          width: '1.5rem',
          height: '1.5rem',
          display: 'inline-block',
          flexShrink: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <path
        d="M8.25 7.25H5.5v12.25h11.25v-2.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.25 4.5h6.25l4 4v8.25H8.25V4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 4.5v4h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </Box>
  )
}

export default PlanCopyIcon
