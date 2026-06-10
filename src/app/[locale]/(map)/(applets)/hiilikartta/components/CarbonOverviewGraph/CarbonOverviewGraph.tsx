import React, { useState } from 'react'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'
import { pp } from '#/common/utils/general'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import TText from '#/components/common/TText'

import { PlanConfWithReportData } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import GeomGraphic from './GeomGraphic'
import CarbonChangeLegend from '../CarbonChangeLegend'
import ReadMoreModal from '../ReadMoreModal'

type Props = {
  planConfs: PlanConfWithReportData[]
  featureYears: string[]
  styleProps?: PandaStyleProp
}

const CarbonOverviewGraph = ({ planConfs, featureYears, styleProps }: Props) => {
  const [activeYear, setActiveYear] = useState(featureYears[1])

  const handleYearChange = (event: FormSelectionEvent<string>) => {
    setActiveYear(event.target.value)
  }

  return (
    <Box styleProps={[...(Array.isArray(styleProps) ? styleProps : [styleProps])]}>
      <Row>
        <Col>
          <Row styleProps={{ justifyContent: 'flex-start' }}>
            <Box
              component="h2"
              styleProps={{
                m: 0,
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
              styleProps={{
                height: '1.1rem',
                mt: 'auto',
                mb: '0.28rem',
                ml: '0.85rem',
              }}
            ></Info> */}
          </Row>
          <Row styleProps={{ justifyContent: 'flex-start', mt: 0.5 }}>
            <Box
              component="span"
              styleProps={{
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
              iconSx={{
                mt: 0.2,
                height: '0.75rem',
              }}
            ></DropDownSelectMinimal>
          </Row>
        </Col>
      </Row>
      <Row
        styleProps={{
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
              styleProps={{
                flex: { xs: 1, md: 0.5 },
                maxWidth: '500px',
                border: '1px solid',
                borderRadius: '0.3125rem',
                borderColor: 'primary.dark',
                pt: '2rem',
                pb: '2rem',
                pl: '1.75rem',
                pr: '1.75rem',
                boxShadow: '1px 1px 4px 1px rgba(217, 217, 217, 0.50)',
              }}
              key={planConf.serverId}
            >
              <Col>
                <Box component="span" styleProps={{ typography: 'h8' }}>
                  <TText
                    keyName="report.overview_graph.plan"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box
                  component="span"
                  styleProps={{
                    typography: 'h7',
                    display: 'inline',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    maxWidth: '250px',
                  }}
                >
                  {planConf?.name}
                </Box>
                <Box component="span" styleProps={{ typography: 'h5', mt: 2 }}>
                  <TText
                    keyName="report.overview_graph.carbon_stock_decreases"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box component="span" styleProps={{ mt: 4, typography: 'h5' }}>
                  <TText
                    keyName="report.overview_graph.carbon_eqv_unit"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box component="span" styleProps={{ mt: 1, typography: 'h1' }}>
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
                <Box component="span" styleProps={{ mt: 3, typography: 'h5' }}>
                  <TText
                    keyName="report.overview_graph.carbon_eqv_unit_hectare"
                    ns="hiilikartta"
                  ></TText>
                </Box>
                <Box component="span" styleProps={{ mt: 1, typography: 'h1' }}>
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
              <Col styleProps={{ ml: 2 }}>
                <GeomGraphic
                  calcFeatures={planConf.reportData.areas}
                  year={activeYear}
                  width={120}
                  height={200}
                  styleProps={{ mt: 3 }}
                ></GeomGraphic>
              </Col>
            </Row>
          )
        })}
      </Row>
      <CarbonChangeLegend></CarbonChangeLegend>
      <Col styleProps={{ alignItems: 'flex-end', mt: 2 }}>
        <ReadMoreModal></ReadMoreModal>
      </Col>
    </Box>
  )
}

export default CarbonOverviewGraph

const Row = ({
  children,
  styleProps,
}: {
  children: React.ReactNode
  styleProps?: PandaStyleProp
}) => (
  <Box
    styleProps={[
      {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
  >
    {children}
  </Box>
)

const Col = ({
  children,
  styleProps,
}: {
  children: React.ReactNode
  styleProps?: PandaStyleProp
}) => (
  <Box
    styleProps={[
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
  >
    {children}
  </Box>
)
