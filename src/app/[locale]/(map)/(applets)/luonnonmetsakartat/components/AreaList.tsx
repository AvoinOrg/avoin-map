'use client'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Theme,
  SxProps,
} from '@mui/material'

import { FeatureProperties, FolayerFeature } from '../common/types'

interface Props {
  data: FolayerFeature[] | undefined
  sx?: SxProps<Theme>
}
const columns: ColumnDef<FolayerFeature>[] = [
  {
    accessorFn: (row) => row.properties.name,
    id: 'name',
    cell: (info) => info.getValue(), // Render the raw value retrieved by accessorF
  },
  // --- Example: Add Municipality Column ---
  // {
  //   accessorFn: (row) => row.properties.municipality,
  //   id: 'municipality',
  //   // header: 'Municipality', // Uncomment if you want a header later
  //   cell: (info) => info.getValue() ?? 'N/A', // Handle potentially undefined municipality
  // },
]

const AreaList = ({ data = [], sx }: Props) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Handle case where data might still be loading or empty
  if (!data || data.length === 0) {
    return null
  }

  return (
    <TableContainer
      component={Paper}
      sx={{ width: '100%', mt: 2, minHeight: '400px' }}
    >
      {' '}
      {/* Added margin top */}
      <Table aria-label="area list">
        {/* No TableHead needed */}
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              // Use the feature's properties.id or the feature's own id if available for a stable key
              key={row.original.properties.id || row.id}
              sx={[
                {
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                },
                ...(Array.isArray(sx) ? sx : [sx]),
              ]}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} component="td" scope="row">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default AreaList
