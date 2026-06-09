import React from 'react'
import { css, cx } from 'styled-system/css'

const tableClass = css({
  width: '100%',
  borderCollapse: 'collapse',
  borderSpacing: 0,
  color: 'inherit',
  fontSize: '0.875rem',
  lineHeight: 1.43,
  '& td, & th': {
    px: '1rem',
    py: '0.375rem',
    borderBottom: '1px solid rgba(224, 224, 224, 1)',
    verticalAlign: 'middle',
    textAlign: 'left',
    fontWeight: 400,
  },
})

type PopupTableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  children: React.ReactNode
}

export const PopupTable = ({
  children,
  className,
  ...props
}: PopupTableProps) => (
  <table className={cx(tableClass, className)} {...props}>
    <tbody>{children}</tbody>
  </table>
)
