import React, { useState, useEffect, useRef } from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'
import TText from '#/components/common/TText'
import { CalcFeatureCollection, UnitType } from '../../common/types'
import CarbonLineChartInner from './CarbonLineChartInner'

interface Props {
  data: CalcFeatureCollection[]
  featureYears: string[]
  planNames: string[]
}

const MIN_WIDTH = 700 // Define a minimum width for the chart

const CarbonLineChart = ({ data, featureYears, planNames }: Props) => {
  const [width, setWidth] = useState(800) // Start with a default width
  const [unitType, setUnitType] = React.useState<UnitType>('ha')
  const boxRef = useRef(null) // Ref for the container Box

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0].contentRect.width > MIN_WIDTH) {
        setWidth(entries[0].contentRect.width)
      } else {
        setWidth(MIN_WIDTH)
      }
    })

    const observedElement = boxRef.current
    if (observedElement) {
      resizeObserver.observe(observedElement)
    }

    return () => {
      if (observedElement) {
        resizeObserver.unobserve(observedElement)
      }
    }
  }, [boxRef])

  const handleUnitTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newCalcType: UnitType
  ) => {
    setUnitType(newCalcType)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mt: { xs: 0, md: 2.5 }, ml: { xs: 0, md: 2.5 } }}>
        <Box
          component="h2"
          sx={{
            m: 0,
            typography: 'h1',
            display: 'inline',
          }}
        >
          <TText keyName="report.carbon_line_chart.title" ns={'hiilikartta'} />{' '}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'row',
          mt: 10,
          ml: 10,
        }}
      >
        <StyledToggleButton
          type="button"
          aria-label="ha"
          sx={{ typography: 'body7', letterSpacing: 'normal' }}
          aria-pressed={unitType === 'ha'}
          data-selected={unitType === 'ha' ? 'true' : undefined}
          onClick={(event) => handleUnitTypeChange(event, 'ha')}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.carbon_line_chart.unit_select_ha'}
          />
        </StyledToggleButton>
        <StyledToggleButton
          type="button"
          aria-label="total"
          sx={{
            typography: 'body7',
            letterSpacing: 'normal',
            ml: 0.5,
          }}
          aria-pressed={unitType === 'total'}
          data-selected={unitType === 'total' ? 'true' : undefined}
          onClick={(event) => handleUnitTypeChange(event, 'total')}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.carbon_line_chart.unit_select_total'}
          />
        </StyledToggleButton>
      </Box>
      <Box ref={boxRef} sx={{ width: '100%', overflowX: 'auto', pb: 2.5 }}>
        <CarbonLineChartInner
          data={data}
          featureYears={featureYears}
          planNames={planNames}
          unitType={unitType}
          width={width}
          height={500}
        />
      </Box>
    </Box>
  )
}

const StyledToggleButton = ({
  children,
  sx,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  sx?: PandaStyleProp
}) => (
  <Box
    component="button"
    sx={[
      {
        borderRadius: '0.3125rem',
        border: '1px solid',
        borderColor: 'primary.dark',
        backgroundColor: 'transparent',
        color: 'neutral.darker',
        width: '8.5rem',
        whiteSpace: 'normal',
        textTransform: 'none',
        wordBreak: 'break-word',
        mb: '0.75rem',
        pl: '1.25rem',
        pr: '1.25rem',
        py: '0.375rem',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        '&[data-selected="true"]': {
          borderColor: 'secondary.dark',
          backgroundColor: 'neutral.lighter',
        },
        '&:focus-visible': {
          outline: '2px solid rgba(39, 74, 255, 0.45)',
          outlineOffset: '2px',
        },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...props}
  >
    {children}
  </Box>
)

export default CarbonLineChart
