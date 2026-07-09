import React, { useMemo, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import { useTranslate } from '@tolgee/react'
import type { StyleSpecification } from 'maplibre-gl'

import {
  Box,
  toSxArray,
  type AppSystemStyleObject,
} from '#/common/style/theme'
import { ButtonBase } from '#/components/common/Button'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import TText from '#/components/common/TText'

import type {
  CalcFeatureCollection,
  GraphCalcType,
  MapGraphData,
  MapGraphDataSelectOption,
  PlanConfWithReportData,
} from 'applets/carbon/common/types'
import {
  ZONING_CODE_COL,
} from 'applets/carbon/common/types'
import CarbonMapGraphMap from './CarbonMapGraphMap'
import CarbonChangeLegend from '../CarbonChangeLegend'
import {
  getCarbonChangeColor,
  getCarbonValueForProperties,
  isZoningCodeValid,
} from 'applets/carbon/common/utils'
import { useZoningClasses } from 'applets/carbon/common/useZoningClasses'
import CarbonMapGraphTable from './CarbonMapGraphTable'
import ReadMoreModal from '../ReadMoreModal'

type Props = {
  planConfs: PlanConfWithReportData[]
  featureYears: string[]
  initialActiveDataOption?: MapGraphDataSelectOption
  initialAreaType?: string
  initialCalcType?: GraphCalcType
  initialYear?: string
  mapStyle?: StyleSpecification
}

const calcTypeOptions: {
  value: GraphCalcType
  keyName: string
}[] = [
  {
    value: 'total',
    keyName: 'report.map_graph.calc_select_total',
  },
  {
    value: 'bio',
    keyName: 'report.map_graph.calc_select_bio',
  },
  {
    value: 'ground',
    keyName: 'report.map_graph.calc_select_ground',
  },
]

const calcButtonSx = {
  borderRadius: '0.3125rem',
  border: '1px solid',
  borderColor: 'neutral.main',
  backgroundColor: 'neutral.lighter',
  color: 'neutral.darker',
  flexGrow: 1,
  flexShrink: 1,
  whiteSpace: 'normal',
  textTransform: 'none',
  wordBreak: 'break-word',
  mb: '0.75rem',
  px: '1.25rem',
  py: '0.6875rem',
  textAlign: 'left',
  display: 'flex',
  justifyContent: 'flex-start',
  typography: 'h5',
  letterSpacing: 'normal',
  '&[aria-pressed="true"]': {
    backgroundColor: 'neutral.light',
  },
  '&:hover': {
    backgroundColor: 'neutral.light',
  },
} satisfies AppSystemStyleObject

type CalcTypeButtonProps = {
  ariaLabel: string
  children: React.ReactNode
  isSelected: boolean
  onClick: () => void
  sx?: AppSystemStyleObject
}

const CalcTypeButton = ({
  ariaLabel,
  children,
  isSelected,
  onClick,
  sx,
}: CalcTypeButtonProps) => (
  <ButtonBase
    type="button"
    aria-label={ariaLabel}
    aria-pressed={isSelected}
    onClick={onClick}
    sx={[calcButtonSx, ...toSxArray(sx)]}
  >
    {children}
  </ButtonBase>
)

const CarbonMapGraph = ({
  planConfs,
  featureYears,
  initialActiveDataOption,
  initialAreaType = 'all',
  initialCalcType = 'total',
  initialYear,
  mapStyle,
}: Props) => {
  const { t } = useTranslate('hiilikartta')
  const [activePlanConfOption, setActivePlanConfOption] =
    useState<MapGraphDataSelectOption>({
      id: initialActiveDataOption?.id ?? planConfs[0]?.serverId ?? '',
      isCurrent: initialActiveDataOption?.isCurrent ?? false,
    })
  const [activeYear, setActiveYear] = useState(
    initialYear && featureYears.includes(initialYear)
      ? initialYear
      : featureYears[1]
  )
  const [calcType, setCalcType] =
    React.useState<GraphCalcType>(initialCalcType)
  const [areaType, setAreaType] = React.useState<string>(initialAreaType)
  const { zoningClasses, isLoading: isZoningClassesLoading } =
    useZoningClasses()

  const handleCalcTypeChange = (newCalcType: GraphCalcType) => {
    if (newCalcType !== calcType) {
      setCalcType(newCalcType)
    }
  }

  const handleAreaTypeChange = (event: DropDownValueChangeEvent) => {
    setAreaType(event.target.value)
  }

  const datas = useMemo(
    () =>
      cloneDeep(
        planConfs.map((planConf) => ({
          id: planConf.serverId,
          name: planConf.name,
          data: planConf.reportData.areas,
        }))
      ),
    [planConfs]
  )

  const activeDataOption = useMemo(() => {
    const dataIds = datas.map((data) => data.id)
    if (
      dataIds.length === 0 ||
      dataIds.includes(activePlanConfOption.id)
    ) {
      return activePlanConfOption
    }

    return { id: dataIds[0], isCurrent: false }
  }, [activePlanConfOption, datas])

  const localDatas = useMemo(() => {
    if (datas.length === 0 || isZoningClassesLoading) {
      return []
    }

    return updateDataWithColor({
      datas,
      year: activeYear,
      calcType,
      areaType,
    })
  }, [
    datas,
    activeYear,
    calcType,
    areaType,
    isZoningClassesLoading,
  ])

  const areaTypeOptions = useMemo(() => {
    const seen = new Set<string>()
    return [
      { value: 'all', label: t('report.map_graph.select_all_types') },
      ...zoningClasses
        .filter((zoningClass) => {
          if (zoningClass.code.length !== 1) {
            return false
          }
          const normalized = zoningClass.code.toUpperCase()
          if (seen.has(normalized)) {
            return false
          }
          seen.add(normalized)
          return true
        })
        .map((zoningClass) => {
          return {
            value: zoningClass.code,
            label: zoningClass.name,
          }
        }),
    ]
  }, [t, zoningClasses])

  return (
    <Box
      data-testid={
        localDatas.length > 0 ? 'carbon-map-graph-ready' : undefined
      }
    >
      <Box sx={{ mt: { mobile: 0, desktop: 2.5 }, ml: { mobile: 0, desktop: 2.5 } }}>
        <Box
          component="h2"
          sx={(theme) => ({
            m: 0,
            typography: theme.typography.h1,
            display: 'inline',
          })}
        >
          <TText keyName="report.map_graph.title" ns={'hiilikartta'}></TText>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { mobile: 'column', desktop: 'row' },
          flexWrap: { mobile: 'wrap', desktop: 'nowrap' },
          mt: 5,
        }}
      >
        {calcTypeOptions.map(({ value, keyName }, index) => (
          <CalcTypeButton
            key={value}
            ariaLabel={t(keyName)}
            isSelected={calcType === value}
            onClick={() => handleCalcTypeChange(value)}
            sx={{
              mr:
                index < calcTypeOptions.length - 1
                  ? { mobile: 0, desktop: '0.75rem' }
                  : 0,
            }}
          >
            <TText ns="hiilikartta" keyName={keyName}></TText>
          </CalcTypeButton>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { mobile: 'column', desktop: 'row' },
          border: '1px solid',
          borderColor: 'neutral.main',
          borderRadius: '0.3125rem',
          alignItems: { mobile: 'flex-start', desktop: 'center' },
          pt: '0.5rem',
          pb: '0.5rem',
          pl: '1.25rem',
          pr: '1.25rem',
        }}
      >
        <Box
          component="span"
          sx={{
            typography: 'h5',
            letterSpacing: 'normal',
            width: 'auto',
            mr: { mobile: 0, desktop: '3rem' },
          }}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.map_graph.select_zoning_type'}
          ></TText>
        </Box>
        <DropDownSelectWithLabel
          ariaLabel={t('report.map_graph.select_zoning_type')}
          options={areaTypeOptions}
          value={areaType}
          onChange={handleAreaTypeChange}
          sx={{ width: '100%', maxWidth: '300px' }}
          selectSx={{
            borderRadius: '0.3125rem',
            height: '2.5rem',
            typography: 'h5',
            lineHeight: '1.5rem',
            letterSpacing: 'normal',
          }}
          iconSx={{ fontSize: '1rem', mr: '0.5rem' }}
        ></DropDownSelectWithLabel>
      </Box>
      <CarbonChangeLegend
        sx={{
          backgroundColor: 'rgba(217, 217, 217, 0.90)',
          borderRadius: '0.3125rem',
          pl: { mobile: '0.75rem', desktop: '3rem' },
          pr: { mobile: '0.75rem', desktop: '3rem' },
          pt: '1rem',
          pb: '1rem',
          mt: '2rem',
        }}
      ></CarbonChangeLegend>
      <CarbonMapGraphMap
        datas={localDatas}
        activeYear={activeYear}
        featureYears={featureYears}
        setActiveYear={setActiveYear}
        activeDataOption={activeDataOption}
        setActiveDataOption={setActivePlanConfOption}
        mapStyle={mapStyle}
      />
      <CarbonMapGraphTable datas={localDatas} activeYear={activeYear} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          mt: 2,
        }}
      >
        {/* TODO: Create a singular component, or figure out */}
        <ReadMoreModal></ReadMoreModal>
      </Box>
    </Box>
  )
}

const updateDataWithColor = ({
  datas,
  year,
  calcType,
  areaType,
}: {
  datas: {
    id: string
    name: string
    data: CalcFeatureCollection
  }[]
  year: string
  calcType: GraphCalcType
  areaType: string
}): MapGraphData[] => {
  const newDatas = datas.map((data) => {
    const updatedFeatures = data.data.features.map((feature) => {
      const valueHa =
        getCarbonValueForProperties(feature.properties, year, calcType, true) ||
        0

      const valueTotal =
        getCarbonValueForProperties(
          feature.properties,
          year,
          calcType,
          false
        ) || 0

      const color = getCarbonChangeColor(valueHa)

      const valueHaNochange =
        getCarbonValueForProperties(
          feature.properties,
          year,
          calcType,
          true,
          false
        ) || 0

      const valueTotalNochange =
        getCarbonValueForProperties(
          feature.properties,
          year,
          calcType,
          false,
          false
        ) || 0

      const colorNochange = getCarbonChangeColor(valueHaNochange)

      let isHidden = false
      if (areaType !== 'all') {
        const zoningCode = feature.properties[ZONING_CODE_COL]
        if (
          !isZoningCodeValid(zoningCode) ||
          !feature.properties[ZONING_CODE_COL].startsWith(areaType)
        )
          isHidden = true
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          color,
          valueTotal,
          valueHa,
          colorNochange,
          valueTotalNochange,
          valueHaNochange,
          isHidden,
        },
      }
    })

    return { ...data, data: { ...data.data, features: updatedFeatures } }
  })

  return newDatas
}

export default CarbonMapGraph
