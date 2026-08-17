import React from 'react'

import {
  AppSxProps,
  Box,
  toSxArray,
} from '#/common/style/theme/system'

type PopupTableProps = {
  children: React.ReactNode
  sx?: AppSxProps
}

type PopupTableCellProps = PopupTableProps & {
  component?: 'td' | 'th'
  colSpan?: number
  rowSpan?: number
  scope?: string
}

export const PopupTable = ({ children, sx }: PopupTableProps) => (
  <Box
    component="table"
    sx={[
      {
        width: '100%',
        borderCollapse: 'collapse',
        borderSpacing: 0,
        color: 'inherit',
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)

export const PopupTableBody = ({ children, sx }: PopupTableProps) => (
  <Box
    component="tbody"
    sx={[
      {
        '& th, & td': {
          color: 'inherit',
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          fontSize: '0.875rem',
          lineHeight: 1.43,
          textAlign: 'left',
          verticalAlign: 'inherit',
          padding: '0.375rem 1rem',
        },
        '& th': {
          fontWeight: 400,
        },
        '& tr:last-child th, & tr:last-child td': {
          borderBottom: 0,
        },
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)

export const PopupTableRow = ({ children, sx }: PopupTableProps) => (
  <Box component="tr" sx={sx}>
    {children}
  </Box>
)

export const PopupTableCell = ({
  children,
  component = 'td',
  sx,
  ...props
}: PopupTableCellProps) => (
  <Box
    {...props}
    component={component}
    sx={[
      {
        display: 'table-cell',
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)
