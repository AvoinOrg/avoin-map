import React, { useEffect, useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'

import {
  Box,
  toSxArray,
  type AppSystemStyleObject,
} from '#/common/style/theme'
import { ButtonBase } from '#/components/common/Button'
import TText from '#/components/common/TText'
import type { CalcFeatureCollection, UnitType } from '../../common/types'
import CarbonLineChartInner from './CarbonLineChartInner'

interface Props {
  data: CalcFeatureCollection[]
  featureYears: string[]
  planNames: string[]
}

const MIN_WIDTH = 700 // Define a minimum width for the chart

const unitSelectorButtonSx = {
  borderRadius: '0.3125rem',
  border: '1px solid',
  borderColor: 'primary.dark',
  color: 'neutral.darker',
  width: '8.5rem',
  whiteSpace: 'normal',
  textTransform: 'none',
  wordBreak: 'break-word',
  mb: '0.75rem',
  px: '1.25rem',
  py: '0.6875rem',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'flex-start',
  typography: 'body7',
  letterSpacing: 'normal',
  '&[aria-pressed="true"]': {
    borderColor: 'secondary.dark',
    backgroundColor: 'neutral.lighter',
  },
} satisfies AppSystemStyleObject

type UnitSelectorButtonProps = {
  children: React.ReactNode
  isSelected: boolean
  label: string
  onClick: () => void
  sx?: AppSystemStyleObject
}

const UnitSelectorButton = ({
  children,
  isSelected,
  label,
  onClick,
  sx,
}: UnitSelectorButtonProps) => (
  <ButtonBase
    type="button"
    aria-label={label}
    aria-pressed={isSelected}
    onClick={onClick}
    sx={[unitSelectorButtonSx, ...toSxArray(sx)]}
  >
    {children}
  </ButtonBase>
)

const CarbonLineChart = ({ data, featureYears, planNames }: Props) => {
  const [width, setWidth] = useState(800) // Start with a default width
  const [unitType, setUnitType] = useState<UnitType>('ha')
  const boxRef = useRef<HTMLElement | null>(null) // Ref for the container Box
  const { t } = useTranslate('hiilikartta')

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const observedWidth = entries[0]?.contentRect.width ?? MIN_WIDTH
      setWidth(Math.max(observedWidth, MIN_WIDTH))
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
  }, [])

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          mt: { mobile: 0, desktop: 2.5 },
          ml: { mobile: 0, desktop: 2.5 },
        }}
      >
        <Box
          component="h2"
          sx={(theme) => ({
            m: 0,
            typography: theme.typography.h1,
            display: 'inline',
          })}
        >
          <TText keyName="report.carbon_line_chart.title" ns="hiilikartta" />
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
        <UnitSelectorButton
          label={t('report.carbon_line_chart.unit_select_ha')}
          isSelected={unitType === 'ha'}
          onClick={() => setUnitType('ha')}
        >
          <TText
            ns="hiilikartta"
            keyName="report.carbon_line_chart.unit_select_ha"
          />
        </UnitSelectorButton>
        <UnitSelectorButton
          label={t('report.carbon_line_chart.unit_select_total')}
          isSelected={unitType === 'total'}
          onClick={() => setUnitType('total')}
          sx={{ ml: 0.5 }}
        >
          <TText
            ns="hiilikartta"
            keyName="report.carbon_line_chart.unit_select_total"
          />
        </UnitSelectorButton>
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

export default CarbonLineChart
