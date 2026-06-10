import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { css } from 'styled-system/css'

type TableRow = {
  name: React.ReactNode
  value: React.ReactNode
}

type SimpleTableProps = {
  rows: TableRow[]
}

type HeaderTableProps = SimpleTableProps & {
  title: React.ReactNode
  onFitLayerBounds: () => void
}

const tableContainerClass = css({
  width: '100%',
  overflowX: 'auto',
  backgroundColor: '#ffffff',
  boxShadow: 'button',
})

const tableClass = css({
  width: '100%',
  borderCollapse: 'collapse',
})

const tableCellClass = css({
  px: 2,
  py: 1,
  backgroundColor: '#F7F9FA',
  borderBottom: '1px solid var(--colors-divider)',
  textStyle: 'body2',
  verticalAlign: 'middle',
  '&[data-head="true"]': {
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  '&[data-align="right"]': {
    textAlign: 'right',
  },
})

const fitButtonClass = css({
  m: 0,
  p: 0.5,
  border: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  backgroundColor: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
  '&:focus-visible': {
    outline: '2px solid var(--colors-secondary-main)',
    outlineOffset: '2px',
  },
})

const GpsFixedIcon = () => (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M18.36 5.64l-2.12 2.12M7.76 16.24l-2.12 2.12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

const renderRows = (rows: TableRow[]) =>
  rows.map((row) => (
    <tr key={String(row.name)}>
      <th scope="row" className={tableCellClass}>
        {row.name}
      </th>
      <td className={tableCellClass} data-align="right">
        {row.value}
      </td>
    </tr>
  ))

export const SimpleTable = ({ rows }: SimpleTableProps) => {
  return (
    <div className={tableContainerClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={tableCellClass} data-head="true">
              Statistic
            </th>
            <th className={tableCellClass} data-head="true" data-align="right">
              Value
            </th>
          </tr>
        </thead>
        <tbody>{renderRows(rows)}</tbody>
      </table>
    </div>
  )
}

export const HeaderTable = ({
  title,
  onFitLayerBounds,
  rows,
}: HeaderTableProps) => {
  return (
    <div className={tableContainerClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={tableCellClass} data-head="true">
              {title}
            </th>
            <th className={tableCellClass} data-head="true" data-align="right">
              <BaseButton
                type="button"
                className={fitButtonClass}
                onClick={onFitLayerBounds}
                aria-label="Fit selected forest area"
              >
                <GpsFixedIcon />
              </BaseButton>
            </th>
          </tr>
        </thead>
        <tbody>{renderRows(rows)}</tbody>
      </table>
    </div>
  )
}
