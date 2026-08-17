import React, { useMemo } from 'react'

import {
  Box,
  toSxArray,
  type AppSystemStyleObject,
} from '#/common/style/theme'
import TText from '#/components/common/TText'
import { pp } from '#/common/utils/general'

import type { MapGraphData } from 'applets/carbon/common/types'

type Props = {
  datas: MapGraphData[]
  activeYear: string
}

const CarbonMapGraphTable = ({ datas, activeYear }: Props) => {
  const co2HaRowData = useMemo(() => {
    return datas.map((data) => {
      const totalArea = data.data.features.reduce((acc, feature) => {
        const properties = feature.properties
        if (!properties.isHidden) {
          return acc + properties.area
        }
        return acc
      }, 0)

      if (totalArea === 0) {
        return { planned: 0, nochange: 0 }
      }

      const weightedAreaHa = data.data.features.reduce(
        (acc, feature) => {
          const properties = feature.properties
          if (!properties.isHidden) {
            return {
              planned:
                acc.planned +
                properties.valueHa * (properties.area / totalArea),
              nochange:
                acc.nochange +
                properties.valueHaNochange * (properties.area / totalArea),
            }
          }
          return acc
        },
        { planned: 0, nochange: 0 }
      )

      return weightedAreaHa
    })
  }, [datas])

  const co2TotalRowData = useMemo(() => {
    return datas.map((data) => {
      const totals = data.data.features.reduce(
        (acc, feature) => {
          const properties = feature.properties
          if (!properties.isHidden) {
            return {
              planned: acc.planned + properties.valueTotal,
              nochange: acc.nochange + properties.valueTotalNochange,
            }
          }
          return acc
        },
        { planned: 0, nochange: 0 }
      )

      return totals
    })
  }, [datas])

  return (
    <Box sx={{ mt: 4, overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          borderCollapse: 'collapse',
          'th, td': { border: 0 },
        }}
        aria-label="report carbon map graph summary table"
      >
        <Box component="thead">
          <Box component="tr">
            <Box
              component="th"
              sx={{
                typography: 'h8',
                color: 'secondary.dark',
                verticalAlign: 'top',
                p: '16px',
                textAlign: 'left',
                fontWeight: 400,
              }}
            >
              <TText ns="hiilikartta" keyName="report.map_graph.year"></TText>
              <b>{' ' + activeYear}</b>
            </Box>
            {datas.map((data, index) => (
              <Box
                component="th"
                sx={{
                  typography: 'h7',
                  lineHeight: 'normal',
                  verticalAlign: 'top',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  minWidth: '8rem',
                  p: '16px',
                  textAlign: 'left',
                }}
                key={index}
              >
                {data.name}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr" key={'co2_ha'}>
            <FirstColumnCell component="th" scope="row">
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_ha_compared"
              ></TText>
            </FirstColumnCell>
            {co2HaRowData.map((rowData, index) => (
              <DataCell key={index}>{pp(rowData.planned, 0)}</DataCell>
            ))}
          </Box>
          <Box component="tr" key={'co2_total'}>
            <FirstColumnCell sx={{ typography: 'body7' }} component="th" scope="row">
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_total_compared"
              ></TText>
            </FirstColumnCell>
            {co2TotalRowData.map((rowData, index) => (
              <DataCell key={index}>{pp(rowData.planned, 0)}</DataCell>
            ))}
          </Box>
          <Box component="tr" sx={{ height: '2rem' }}>
            <DataCell
              colSpan={datas.length + 1}
              sx={{ p: 0, border: 0 }}
            />
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr">
            <Box component="th" sx={{ p: '16px', textAlign: 'left' }}></Box>
            {datas.map((data, index) => (
              <Box
                component="th"
                sx={{
                  typography: 'h7',
                  lineHeight: 'normal',
                  verticalAlign: 'top',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  minWidth: '8rem',
                  p: '16px',
                  textAlign: 'left',
                }}
                key={index}
              >
                <TText
                  ns="hiilikartta"
                  keyName="report.map_graph.table_current_situation"
                ></TText>
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr" key={'co2_ha'}>
            <FirstColumnCell component="th" scope="row">
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_ha_compared"
              ></TText>
            </FirstColumnCell>
            {co2HaRowData.map((rowData, index) => (
              <DataCell key={index}>{pp(rowData.nochange, 0)}</DataCell>
            ))}
          </Box>
          <Box component="tr" key={'co2_total'}>
            <FirstColumnCell sx={{ typography: 'body7' }} component="th" scope="row">
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_total_compared"
              ></TText>
            </FirstColumnCell>
            {co2TotalRowData.map((rowData, index) => (
              <DataCell key={index}>{pp(rowData.nochange, 0)}</DataCell>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

type TableCellProps = {
  children?: React.ReactNode
  component?: 'td' | 'th'
  colSpan?: number
  scope?: string
  sx?: AppSystemStyleObject
}

const firstColumnCellSx = {
  display: 'table-cell',
  typography: 'body7',
  fontWeight: 400,
  p: '16px',
  textAlign: 'left',
  verticalAlign: 'middle',
} satisfies AppSystemStyleObject

const dataCellSx = {
  display: 'table-cell',
  typography: 'h2',
  fontSize: '1.25rem',
  letterSpacing: '0.125rem',
  p: '16px',
  textAlign: 'left',
  verticalAlign: 'middle',
} satisfies AppSystemStyleObject

const FirstColumnCell = ({
  children,
  component = 'td',
  sx,
  ...props
}: TableCellProps) => (
  <Box
    {...props}
    component={component}
    sx={[firstColumnCellSx, ...toSxArray(sx)]}
  >
    {children}
  </Box>
)

const DataCell = ({
  children,
  component = 'td',
  sx,
  ...props
}: TableCellProps) => (
  <Box
    {...props}
    component={component}
    sx={[dataCellSx, ...toSxArray(sx)]}
  >
    {children}
  </Box>
)

export default CarbonMapGraphTable
