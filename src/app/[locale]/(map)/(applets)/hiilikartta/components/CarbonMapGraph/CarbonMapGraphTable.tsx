import React, { useMemo } from 'react'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'
import TText from '#/components/common/TText'
import { pp } from '#/common/utils/general'

import { MapGraphData } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'

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
    <Box sx={{ mt: 4, overflowX: 'scroll' }}>
      <Box
        component="table"
        aria-label="simple table"
        sx={{
          borderCollapse: 'collapse',
          width: '100%',
          '& th, & td': {
            border: 0,
            p: '1rem',
            textAlign: 'left',
          },
        }}
      >
        <Box component="thead">
          <Box component="tr">
            <Box
              component="th"
              sx={{
                typography: 'h8',
                color: 'secondary.dark',
                verticalAlign: 'top',
              }}
            >
              <TText ns="hiilikartta" keyName="report.map_graph.year" />
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
            <FirstColumnCell>
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_ha_compared"
              />
            </FirstColumnCell>
            {co2HaRowData.map((rowData, index) => (
              <DataCell key={index}>
                {pp(rowData.planned, 0)}
              </DataCell>
            ))}
          </Box>
          <Box component="tr" key={'co2_total'}>
            <FirstColumnCell sx={{ typography: 'body7' }}>
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_total_compared"
              />
            </FirstColumnCell>
            {co2TotalRowData.map((rowData, index) => (
              <DataCell key={index}>
                {pp(rowData.planned, 0)}
              </DataCell>
            ))}
          </Box>
          <Box component="tr" sx={{ height: '2rem' }}></Box>
        </Box>
        <Box component="thead">
          <Box component="tr">
            <Box component="th"></Box>
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
                }}
                key={index}
              >
                <TText
                  ns="hiilikartta"
                  keyName="report.map_graph.table_current_situation"
                />
              </Box>
            ))}
          </Box>
        </Box>
        <Box component="tbody">
          <Box component="tr" key={'co2_ha'}>
            <FirstColumnCell>
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_ha_compared"
              />
            </FirstColumnCell>
            {co2HaRowData.map((rowData, index) => (
              <DataCell key={index}>
                {pp(rowData.nochange, 0)}
              </DataCell>
            ))}
          </Box>
          <Box component="tr" key={'co2_total'}>
            <FirstColumnCell sx={{ typography: 'body7' }}>
              <TText
                ns="hiilikartta"
                keyName="report.map_graph.unit_co2_total_compared"
              />
            </FirstColumnCell>
            {co2TotalRowData.map((rowData, index) => (
              <DataCell key={index}>
                {pp(rowData.nochange, 0)}
              </DataCell>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

const FirstColumnCell = ({
  children,
  sx,
}: {
  children: React.ReactNode
  sx?: PandaStyleProp
}) => (
  <Box component="th" scope="row" sx={[{ typography: 'body7' }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Box>
)

const DataCell = ({ children }: { children: React.ReactNode }) => (
  <Box
    component="td"
    sx={{
      typography: 'h2',
      fontSize: '1.25rem',
      letterSpacing: '0.125rem',
    }}
  >
    {children}
  </Box>
)

export default CarbonMapGraphTable
