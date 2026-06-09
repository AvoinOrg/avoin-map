'use client'

import React from 'react'
import { useTranslate } from '@tolgee/react'

import type { FormSelectionEvent } from '#/components/common/formControlEvents'
import { Box } from '#/components/common/PandaBox'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import type { SelectOption } from '#/common/types/general'
import {
  ENERGYMAP_BUILDING_TYPE_CODES,
  ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
  ENERGYMAP_CONSTRUCTION_DECADE_OPTIONS,
  ENERGYMAP_CONSTRUCTION_YEAR_FILTER_ANY,
} from '../layers/buildingPolygonsLayerConf'
import type { EnergymapBuildingTypeFilter } from '../layers/buildingPolygonsLayerConf'
import { useAppletStore } from '../state/appletStore'

const CONTROL_TEXT_SX = {
  minWidth: 0,
  color: '#111111',
  fontSize: '0.5625rem',
  fontWeight: 400,
  lineHeight: '0.875rem',
  letterSpacing: '0.1em',
  whiteSpace: 'normal',
  overflowWrap: 'break-word',
}

const DROPDOWN_LABEL_SX = {
  color: '#111111',
  fontSize: '0.625rem',
  fontWeight: 700,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

const SWITCH_SX = {
  width: '100%',
}

const SWITCH_LABEL_SX = {
  ...CONTROL_TEXT_SX,
  ml: '0.625rem',
}

const BackgroundBuildingFiltersAccordionContent = () => {
  const { t } = useTranslate('energiakartta')
  const buildingTypeFilter = useAppletStore((state) => state.buildingTypeFilter)
  const selectedConstructionDecade = useAppletStore(
    (state) => state.selectedConstructionDecade
  )
  const showBuildingsFromSelectedDecade = useAppletStore(
    (state) => state.showBuildingsFromSelectedDecade
  )
  const showOnlySelectedDecade = useAppletStore(
    (state) => state.showOnlySelectedDecade
  )
  const setBuildingTypeFilter = useAppletStore(
    (state) => state.setBuildingTypeFilter
  )
  const setSelectedConstructionDecade = useAppletStore(
    (state) => state.setSelectedConstructionDecade
  )
  const setShowBuildingsFromSelectedDecade = useAppletStore(
    (state) => state.setShowBuildingsFromSelectedDecade
  )
  const setShowOnlySelectedDecade = useAppletStore(
    (state) => state.setShowOnlySelectedDecade
  )

  const buildingTypeOptions = React.useMemo<SelectOption[]>(
    () => [
      {
        value: ENERGYMAP_BUILDING_TYPE_FILTER_ALL,
        label: t('sidebar.background_filters.building_types.all'),
      },
      ...ENERGYMAP_BUILDING_TYPE_CODES.map((code) => ({
        value: code,
        label: t(`sidebar.background_filters.building_types.${code}`),
      })),
    ],
    [t]
  )

  const decadeOptions = React.useMemo<SelectOption[]>(
    () => [
      {
        value: ENERGYMAP_CONSTRUCTION_YEAR_FILTER_ANY,
        label: t('sidebar.background_filters.construction_year.any'),
      },
      ...ENERGYMAP_CONSTRUCTION_DECADE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    ],
    [t]
  )
  const constructionDecadeSelectValue =
    selectedConstructionDecade == null
      ? ENERGYMAP_CONSTRUCTION_YEAR_FILTER_ANY
      : String(selectedConstructionDecade)
  const hasSelectedConstructionDecade = selectedConstructionDecade != null

  const handleBuildingTypeChange = (event: FormSelectionEvent<string>) => {
    const selectedValue = String(event.target.value)
    const isValidType = Object.prototype.hasOwnProperty.call(
      {
        [ENERGYMAP_BUILDING_TYPE_FILTER_ALL]: true,
        ...Object.fromEntries(
          ENERGYMAP_BUILDING_TYPE_CODES.map((code) => [code, true])
        ),
      },
      selectedValue
    )

    if (!isValidType) {
      return
    }

    setBuildingTypeFilter(selectedValue as EnergymapBuildingTypeFilter)
  }

  const handleConstructionDecadeChange = (
    event: FormSelectionEvent<string>
  ) => {
    const selectedValue = String(event.target.value)
    const selectedValueDigits = selectedValue.match(/\d{4}/)?.[0]

    if (selectedValue === ENERGYMAP_CONSTRUCTION_YEAR_FILTER_ANY) {
      setSelectedConstructionDecade(null)
      return
    }

    const selectedDecade = Number(
      selectedValueDigits != null ? selectedValueDigits : selectedValue
    )

    if (Number.isNaN(selectedDecade)) {
      return
    }

    setSelectedConstructionDecade(selectedDecade)
  }

  return (
    <Box
      sx={{
        pt: '2.375rem',
        pb: '2.875rem',
        px: '0.25rem',
        width: '15.5rem',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.625rem',
      }}
    >
      <DropDownSelectWithLabel
        value={buildingTypeFilter}
        options={buildingTypeOptions}
        onChange={handleBuildingTypeChange}
        disablePortal
        label={t('sidebar.background_filters.building_types.label')}
        ariaLabel={t('sidebar.background_filters.building_types.aria_label')}
        headerSx={{
          px: '1rem',
          minHeight: '1.125rem',
          mb: '0.25rem',
        }}
        labelSx={DROPDOWN_LABEL_SX}
        selectSx={{
          height: '1.25rem',
          minHeight: '1.25rem',
          backgroundColor: 'common.white',
          boxShadow: 'inset 0px 1px 2px 0px rgba(214, 214, 214, 0.3)',
          py: 0,
          fontSize: '0.625rem',
          letterSpacing: '0.1em',
        }}
        iconSx={{
          width: '0.5rem',
          height: '0.25rem',
          mr: '0.75rem',
        }}
        typographySx={{
          maxWidth: '14rem',
          whiteSpace: 'normal',
          overflowWrap: 'anywhere',
        }}
      />

      <DropDownSelectInset
        value={constructionDecadeSelectValue}
        options={decadeOptions}
        onChange={handleConstructionDecadeChange}
        disablePortal
        label={t('sidebar.background_filters.construction_year.label')}
        ariaLabel={t('sidebar.background_filters.construction_year.aria_label')}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          px: '0.25rem',
        }}
      >
        <SwitchWithLabel
          checked={showBuildingsFromSelectedDecade}
          ariaLabel={t(
            'sidebar.background_filters.construction_year.show_from_decade'
          )}
          inputProps={{ role: 'switch' }}
          onChange={(event) =>
            setShowBuildingsFromSelectedDecade(event.target.checked)
          }
          disabled={!hasSelectedConstructionDecade}
          sx={SWITCH_SX}
          checkedTrackColor="#075CFF"
          labelSx={SWITCH_LABEL_SX}
        >
          {t('sidebar.background_filters.construction_year.show_from_decade')}
        </SwitchWithLabel>
        <SwitchWithLabel
          checked={showOnlySelectedDecade}
          ariaLabel={t(
            'sidebar.background_filters.construction_year.show_only_decade'
          )}
          inputProps={{ role: 'switch' }}
          onChange={(event) => setShowOnlySelectedDecade(event.target.checked)}
          disabled={!hasSelectedConstructionDecade}
          sx={SWITCH_SX}
          checkedTrackColor="#075CFF"
          labelSx={SWITCH_LABEL_SX}
        >
          {t('sidebar.background_filters.construction_year.show_only_decade')}
        </SwitchWithLabel>
      </Box>
    </Box>
  )
}

export default BackgroundBuildingFiltersAccordionContent
