import React, { useMemo, useState } from 'react'
import { cloneDeep } from 'lodash-es'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import TText from '#/components/common/TText'

import {
  CalcFeatureCollection,
  MapGraphData,
  MapGraphDataSelectOption,
  PlanConfWithReportData,
  ZONING_CODE_COL,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import CarbonMapGraphMap from './CarbonMapGraphMap'
import CarbonChangeLegend from '../CarbonChangeLegend'
import { GraphCalcType } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import {
  getCarbonChangeColor,
  getCarbonValueForProperties,
  isZoningCodeValid,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'
import { useZoningClasses } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/useZoningClasses'
import CarbonMapGraphTable from './CarbonMapGraphTable'
import ReadMoreModal from '../ReadMoreModal'

type Props = {
  planConfs: PlanConfWithReportData[]
  featureYears: string[]
}

const CarbonMapGraph = ({ planConfs, featureYears }: Props) => {
  const { t } = useTranslate('hiilikartta')
  const [activePlanConfOption, setActivePlanConfOption] =
    useState<MapGraphDataSelectOption>({
      id: planConfs[0].serverId,
      isCurrent: false,
    })
  const [activeYear, setActiveYear] = useState(featureYears[1])
  const [calcType, setCalcType] = React.useState<GraphCalcType>('total')
  const [areaType, setAreaType] = React.useState<string>('all')
  const { zoningClasses, isLoading: isZoningClassesLoading } =
    useZoningClasses()

  const handleCalcTypeChange = (newCalcType: GraphCalcType) => {
    setCalcType(newCalcType)
  }

  const handleAreaTypeChange = (event: FormSelectionEvent<string>) => {
    setAreaType(event.target.value)
  }

  const datas = useMemo(() => {
    const datas = planConfs.map((planConf) => ({
      id: planConf.serverId,
      name: planConf.name,
      data: planConf.reportData.areas,
    }))

    return cloneDeep(datas)
  }, [planConfs])

  const activeDataOption = useMemo(() => {
    const dataIds = datas.map((data) => data.id)
    return dataIds.includes(activePlanConfOption.id)
      ? activePlanConfOption
      : { id: dataIds[0] ?? '', isCurrent: false }
  }, [activePlanConfOption, datas])

  const localDatas = useMemo(() => {
    if (datas.length === 0 || isZoningClassesLoading) return []
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
    <Box>
      <Box styleProps={{ mt: { xs: 0, md: 2.5 }, ml: { xs: 0, md: 2.5 } }}>
        <Box
          component="h2"
          styleProps={{
            m: 0,
            typography: 'h1',
            display: 'inline',
          }}
        >
          <TText keyName="report.map_graph.title" ns={'hiilikartta'}></TText>
        </Box>
      </Box>
      <Box
        styleProps={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          mt: 5,
        }}
      >
        <StyledToggleButton
          type="button"
          aria-label="total"
          styleProps={{
            mr: { xs: 0, md: '0.75rem' },
            typography: 'h5',
            letterSpacing: 'normal',
          }}
          aria-pressed={calcType === 'total'}
          data-selected={calcType === 'total' ? 'true' : undefined}
          onClick={() => handleCalcTypeChange('total')}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.map_graph.calc_select_total'}
          ></TText>
        </StyledToggleButton>
        <StyledToggleButton
          type="button"
          aria-label="bio"
          styleProps={{
            mr: { xs: 0, md: '0.75rem' },
            typography: 'h5',
            letterSpacing: 'normal',
          }}
          aria-pressed={calcType === 'bio'}
          data-selected={calcType === 'bio' ? 'true' : undefined}
          onClick={() => handleCalcTypeChange('bio')}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.map_graph.calc_select_bio'}
          ></TText>
        </StyledToggleButton>
        <StyledToggleButton
          type="button"
          aria-label="ground"
          styleProps={{ typography: 'h5', letterSpacing: 'normal' }}
          aria-pressed={calcType === 'ground'}
          data-selected={calcType === 'ground' ? 'true' : undefined}
          onClick={() => handleCalcTypeChange('ground')}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.map_graph.calc_select_ground'}
          ></TText>
        </StyledToggleButton>
      </Box>
      <Box
        styleProps={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          border: '1px solid',
          borderColor: 'neutral.main',
          borderRadius: '0.3125rem',
          alignItems: { xs: 'flex-start', sm: 'center' },
          pt: '0.5rem',
          pb: '0.5rem',
          pl: '1.25rem',
          pr: '1.25rem',
        }}
      >
        <Box
          component="span"
          styleProps={{
            typography: 'h5',
            letterSpacing: 'normal',
            width: 'auto',
            mr: { xs: 0, sm: '3rem' },
          }}
        >
          <TText
            ns="hiilikartta"
            keyName={'report.map_graph.select_zoning_type'}
          ></TText>
        </Box>
        <DropDownSelectWithHeader
          options={areaTypeOptions}
          value={areaType}
          onChange={handleAreaTypeChange}
          styleProps={{ width: '100%', maxWidth: '300px' }}
          selectSx={{
            borderRadius: '0.3125rem',
            height: '2.5rem',
            typography: 'h5',
            lineHeight: '1.5rem',
            letterSpacing: 'normal',
          }}
          iconSx={{ fontSize: '1rem', mr: '0.5rem' }}
        ></DropDownSelectWithHeader>
      </Box>
      <CarbonChangeLegend
        styleProps={{
          backgroundColor: 'rgba(217, 217, 217, 0.90)',
          borderRadius: '0.3125rem',
          pl: { xs: '0.75rem', md: '3rem' },
          pr: { xs: '0.75rem', md: '3rem' },
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
        activeCalcType={calcType}
        activeAreaType={areaType}
      />
      <CarbonMapGraphTable datas={localDatas} activeYear={activeYear} />
      <Box
        styleProps={{
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

const StyledToggleButton = ({
  children,
  styleProps,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  styleProps?: PandaStyleProp
}) => (
  <Box
    component="button"
    styleProps={[
      {
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
        pl: '1.25rem',
        pr: '1.25rem',
        py: '0.375rem',
        textAlign: 'left',
        display: 'flex',
        justifyContent: 'flex-start',
        cursor: 'pointer',
        '&[data-selected="true"]': {
          backgroundColor: 'neutral.light',
        },
        '&:focus-visible': {
          outline: '2px solid rgba(39, 74, 255, 0.45)',
          outlineOffset: '2px',
        },
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
    {...props}
  >
    {children}
  </Box>
)

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
