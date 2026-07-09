import React, { useState } from 'react'

import { pp } from '#/common/utils/general'
import { Box, toSxArray } from '#/common/style/theme/system'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import TText from '#/components/common/TText'

import type { PlanConfWithReportData } from 'applets/carbon/common/types'
import GeomGraphic from './GeomGraphic'
import CarbonChangeLegend from '../CarbonChangeLegend'
import ReadMoreModal from '../ReadMoreModal'

type Props = {
  planConfs: PlanConfWithReportData[]
  featureYears: string[]
  sx?: React.ComponentProps<typeof Box>['sx']
}

const CarbonOverviewGraph = ({ planConfs, featureYears, sx }: Props) => {
  const [activeYear, setActiveYear] = useState(featureYears[1])

  const handleYearChange = (event: DropDownValueChangeEvent) => {
    setActiveYear(event.target.value)
  }

  return (
    <Box sx={toSxArray(sx)}>
      <Row>
        <Col>
          <Row sx={{ justifyContent: 'flex-start' }}>
            <Box
              component="span"
              sx={{
                typography: 'h1',
                display: 'inline',
              }}
            >
              <TText
                keyName="report.overview_graph.impact_on_carbon_stock"
                ns={'hiilikartta'}
              ></TText>{' '}
            </Box>
            {/* <Info
              sx={{
                height: '1.1rem',
                mt: 'auto',
                mb: '0.28rem',
                ml: '0.85rem',
              }}
            ></Info> */}
          </Row>
          <Row sx={{ justifyContent: 'flex-start', mt: 0.5 }}>
            <Box
              component="span"
              sx={{
                typography: 'h1',
                display: 'inline',
              }}
            >
              <TText
                keyName="report.overview_graph.on_year"
                ns={'hiilikartta'}
              ></TText>{' '}
            </Box>
            <DropDownSelectMinimal
              ariaLabel="Select overview graph year"
              options={featureYears.map((featureYear) => ({
                label: featureYear,
                value: featureYear,
              }))}
              value={activeYear}
              onChange={handleYearChange}
              optionSx={{
                typography: 'h1',
                display: 'inline',
              }}
            ></DropDownSelectMinimal>
          </Row>
        </Col>
      </Row>
      <Row
        sx={{
          mt: 3,
          mb: 5,
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          gap: '1.75rem',
        }}
      >
        {planConfs.map((planConf) => {
          return (
            <Row
              sx={{
                flex: { xs: 1, md: 0.5 },
                maxWidth: '500px',
                border: '1px solid',
                borderRadius: '0.3125rem',
                borderColor: 'primary.dark',
                pt: '2rem',
                pb: '2rem',
                pl: '1.75rem',
                pr: '1.75rem',
                boxShadow: '1px 1px 4px 1px rgba(217, 217, 217, 0.50);',
              }}
              key={planConf.serverId}
            >
              <Col>
                <Box component="span" sx={{ typography: 'h8' }}>
                  <TText
                    keyName="report.overview_graph.plan"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box
                  component="span"
                  sx={{
                    typography: 'h7',
                    display: 'inline',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    maxWidth: '250px',
                  }}
                >
                  {planConf?.name}
                </Box>
                <Box component="span" sx={{ mt: 2, typography: 'h5' }}>
                  <TText
                    keyName="report.overview_graph.carbon_stock_decreases"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box component="span" sx={{ mt: 4, typography: 'h5' }}>
                  <TText
                    keyName="report.overview_graph.carbon_eqv_unit"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box component="span" sx={{ mt: 1, typography: 'h1' }}>
                  {pp(
                    planConf.reportData.agg.totals.bio_carbon_total_diff[
                      activeYear
                    ] +
                      planConf.reportData.agg.totals.ground_carbon_total_diff[
                        activeYear
                      ],
                    0
                  )}
                </Box>
                <Box component="span" sx={{ mt: 3, typography: 'h5' }}>
                  <TText
                    keyName="report.overview_graph.carbon_eqv_unit_hectare"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box component="span" sx={{ mt: 1, typography: 'h1' }}>
                  {pp(
                    planConf.reportData.agg.totals.bio_carbon_ha_diff[
                      activeYear
                    ] +
                      planConf.reportData.agg.totals.ground_carbon_ha_diff[
                        activeYear
                      ],
                    0
                  )}
                </Box>
              </Col>
              <Col sx={{ ml: 2 }}>
                <GeomGraphic
                  calcFeatures={planConf.reportData.areas}
                  year={activeYear}
                  width={120}
                  height={200}
                  sx={{ mt: 3 }}
                ></GeomGraphic>
              </Col>
            </Row>
          )
        })}
      </Row>
      <CarbonChangeLegend></CarbonChangeLegend>
      <Col sx={{ alignItems: 'flex-end', mt: 2 }}>
        <ReadMoreModal></ReadMoreModal>
      </Col>
    </Box>
  )
}

export default CarbonOverviewGraph

type LayoutProps = {
  children: React.ReactNode
  sx?: React.ComponentProps<typeof Box>['sx']
}

const Row = ({ children, sx }: LayoutProps) => (
  <Box
    sx={[
      {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)

const Col = ({ children, sx }: LayoutProps) => (
  <Box
    sx={[
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
      },
      ...toSxArray(sx),
    ]}
  >
    {children}
  </Box>
)
