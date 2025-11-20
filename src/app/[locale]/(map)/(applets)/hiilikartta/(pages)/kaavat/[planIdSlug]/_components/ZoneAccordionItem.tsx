import {
  memo,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react'
import {
  AccordionDetails,
  Box,
  ButtonBase,
  Collapse,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { T, useTranslate } from '@tolgee/react'

import DropDownSelect from '#/components/common/DropDownSelect'
import CustomAccordion from '#/components/common/CustomAccordion'
import CustomAccordionSummary from '#/components/common/CustomAccordionSummary'
import { ArrowDown, ArrowUp } from '#/components/icons'

import {
  CUSTOM_ZONING_CODE,
  ZONING_CLASSES,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/constants'
import { PlanDataFeature } from '#/app/[locale]/(map)/(applets)/hiilikartta/common/types'
import ZoneAccordionItemTitle from './ZoneAccordionItemTitle'
import {
  checkIsValidLandUseDistribution,
  checkIsValidZoningCode,
} from '#/app/[locale]/(map)/(applets)/hiilikartta/common/utils'

const zoningCodeOptions = ZONING_CLASSES.map((zoning) => ({
  value: zoning.code,
  label: `${zoning.name} (${zoning.code})`,
}))

const landUseFields = [
  {
    key: 'new_land_use_without_vegetation',
    translationKey:
      'sidebar.plan_settings.zones.new_land_use_without_vegetation',
  },
  {
    key: 'new_land_use_with_vegetation',
    translationKey: 'sidebar.plan_settings.zones.new_land_use_with_vegetation',
  },
  {
    key: 'remaining_existing_land_use',
    translationKey: 'sidebar.plan_settings.zones.remaining_existing_land_use',
  },
] as const

type LandUseFieldKey = (typeof landUseFields)[number]['key']

interface CustomAccordionProps {
  feature: PlanDataFeature
  index: number
  expanded: boolean
  onChange: (
    featureId: string
  ) => (event: SyntheticEvent, isExpanded: boolean) => void
  accordionRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement | null
  }>
  updateFeature: (id: string, feature: Partial<PlanDataFeature>) => void
}

const ZoneAccordionItem = memo(
  ({
    feature,
    index,
    expanded,
    onChange,
    accordionRefs,
    updateFeature,
  }: CustomAccordionProps) => {
    const { t } = useTranslate('hiilikartta')
    const [isLandUseExpanded, setIsLandUseExpanded] = useState(
      feature.properties.zoning_code?.toUpperCase() === CUSTOM_ZONING_CODE
    )

    useEffect(() => {
      if (
        feature.properties.zoning_code?.toUpperCase() === CUSTOM_ZONING_CODE
      ) {
        setIsLandUseExpanded(true)
      }
    }, [feature.properties.zoning_code])

    const isZoningCodeValid = useMemo(
      () => checkIsValidZoningCode(feature.properties.zoning_code),
      [feature.properties.zoning_code]
    )

    const isLandUseDistributionValid = useMemo(
      () => checkIsValidLandUseDistribution(feature.properties),
      [feature.properties]
    )

    const isItemValid = isZoningCodeValid && isLandUseDistributionValid

    const handleZoningCodeChange = (event: any) => {
      const zoningCode = event.target.value

      if (zoningCode != null) {
        updateFeature(feature.properties.id, {
          properties: { ...feature.properties, zoning_code: zoningCode },
        })
      }
    }

    const handleNameChange = (event: any) => {
      const name = event.target.value

      if (name != null && name != '') {
        updateFeature(feature.properties.id, {
          properties: { ...feature.properties, name: name },
        })
      }
    }

    const handleLandUseValueChange =
      (key: LandUseFieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value
        const parsedValue = rawValue === '' ? null : Number(rawValue)

        if (parsedValue !== null && Number.isNaN(parsedValue)) {
          return
        }

        updateFeature(feature.properties.id, {
          properties: { ...feature.properties, [key]: parsedValue },
        })
      }

    return (
      <CustomAccordion
        key={feature.properties.id}
        slotProps={{ transition: { unmountOnExit: true } }}
        expanded={expanded}
        onChange={onChange(feature.properties.id)}
        ref={(el) => (accordionRefs.current[feature.properties.id] = el)}
      >
        <CustomAccordionSummary
          aria-controls={`panel${index + 1}-content`}
          id={`panel${index + 1}-header`}
          sx={{
            '& .MuiAccordionSummary-content': {
              width: '100%',
              display: 'flex',
              flexGrow: 1,
            },
          }}
        >
          <ZoneAccordionItemTitle
            name={feature.properties.name}
            zoningCode={feature.properties.zoning_code}
            isValid={isItemValid}
            onChange={handleNameChange}
          ></ZoneAccordionItemTitle>
        </CustomAccordionSummary>
        <AccordionDetails sx={{ display: 'flex', flexDirection: 'column' }}>
          <Row>
            <T
              keyName={'sidebar.plan_settings.zones.area_information'}
              ns="hiilikartta"
            ></T>
          </Row>
          <DropDownSelect
            value={feature.properties.zoning_code}
            options={zoningCodeOptions}
            onChange={handleZoningCodeChange}
            sx={{
              backgroundColor: 'neutral.lighter',
              borderColor: 'primary.light',
              mt: 1,
            }}
          ></DropDownSelect>
          <Box sx={{ mt: 2 }}>
            <ButtonBase
              onClick={() => setIsLandUseExpanded((prev) => !prev)}
              sx={{
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex',
                borderRadius: 1,
                py: 0.5,
                textAlign: 'left',
                color: isLandUseDistributionValid
                  ? 'text.secondary'
                  : 'warning.main',
              }}
            >
              <Typography variant="body2">
                {t('sidebar.plan_settings.zones.land_use_distribution')}
              </Typography>
              {isLandUseExpanded ? (
                <ArrowUp sx={{ fontSize: 16 }} />
              ) : (
                <ArrowDown sx={{ fontSize: 16 }} />
              )}
            </ButtonBase>
            <Collapse in={isLandUseExpanded} timeout="auto" unmountOnExit>
              <Box
                sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {landUseFields.map((field) => (
                  <TextField
                    key={field.key}
                    type="number"
                    value={feature.properties[field.key] ?? ''}
                    onChange={handleLandUseValueChange(field.key)}
                    label={t(field.translationKey)}
                    fullWidth
                    size="small"
                    error={!isLandUseDistributionValid}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">%</InputAdornment>
                      ),
                    }}
                  />
                ))}
              </Box>
            </Collapse>
          </Box>
        </AccordionDetails>
      </CustomAccordion>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.expanded === nextProps.expanded &&
      prevProps.feature.properties.zoning_code ===
        nextProps.feature.properties.zoning_code &&
      prevProps.feature.properties.name === nextProps.feature.properties.name &&
      prevProps.feature.properties.new_land_use_without_vegetation ===
        nextProps.feature.properties.new_land_use_without_vegetation &&
      prevProps.feature.properties.new_land_use_with_vegetation ===
        nextProps.feature.properties.new_land_use_with_vegetation &&
      prevProps.feature.properties.remaining_existing_land_use ===
        nextProps.feature.properties.remaining_existing_land_use
    )
  }
)

export default ZoneAccordionItem

const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
}))
