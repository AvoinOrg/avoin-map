import { useTranslate } from '@tolgee/react'

import { Box } from '#/common/style/theme'
import type { SelectOption } from '#/common/types/general'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'

import { UI_BASELINE_NAMESPACE } from '../common/categories'
import {
  UI_BASELINE_DATASET_IDS,
  UI_BASELINE_YEAR_IDS,
  useLayerFixtureStore,
  type UiBaselineDatasetId,
  type UiBaselineYearId,
} from '../state/layerFixtureStore'

const isDatasetId = (value: string): value is UiBaselineDatasetId =>
  UI_BASELINE_DATASET_IDS.some((datasetId) => datasetId === value)

const isYearId = (value: string): value is UiBaselineYearId =>
  UI_BASELINE_YEAR_IDS.some((yearId) => yearId === value)

const CustomTestLayersAccordionContent = () => {
  const { t } = useTranslate(UI_BASELINE_NAMESPACE)
  const datasetId = useLayerFixtureStore((state) => state.datasetId)
  const yearId = useLayerFixtureStore((state) => state.yearId)
  const includeDraftRecords = useLayerFixtureStore(
    (state) => state.includeDraftRecords
  )
  const showMockLabels = useLayerFixtureStore((state) => state.showMockLabels)
  const setDatasetId = useLayerFixtureStore((state) => state.setDatasetId)
  const setYearId = useLayerFixtureStore((state) => state.setYearId)
  const setIncludeDraftRecords = useLayerFixtureStore(
    (state) => state.setIncludeDraftRecords
  )
  const setShowMockLabels = useLayerFixtureStore(
    (state) => state.setShowMockLabels
  )

  const datasetOptions: SelectOption[] = UI_BASELINE_DATASET_IDS.map(
    (value) => ({
      value,
      label: t(`layers.custom_test_layers.dataset.options.${value}`),
    })
  )
  const yearOptions: SelectOption[] = UI_BASELINE_YEAR_IDS.map((value) => ({
    value,
    label: t(`layers.custom_test_layers.year.options.${value}`),
  }))

  const handleDatasetChange = (event: DropDownValueChangeEvent) => {
    if (isDatasetId(event.target.value)) {
      setDatasetId(event.target.value)
    }
  }

  const handleYearChange = (event: DropDownValueChangeEvent) => {
    if (isYearId(event.target.value)) {
      setYearId(event.target.value)
    }
  }

  return (
    <Box
      sx={{
        px: 3,
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <DropDownSelectWithLabel
        value={datasetId}
        options={datasetOptions}
        onChange={handleDatasetChange}
        label={t('layers.custom_test_layers.dataset.label')}
        ariaLabel={t('layers.custom_test_layers.dataset.aria_label')}
      />

      <DropDownSelectInset
        value={yearId}
        options={yearOptions}
        onChange={handleYearChange}
        label={t('layers.custom_test_layers.year.label')}
        ariaLabel={t('layers.custom_test_layers.year.aria_label')}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SwitchWithLabel
          checked={includeDraftRecords}
          ariaLabel={t(
            'layers.custom_test_layers.switches.include_drafts'
          )}
          onChange={(event) => setIncludeDraftRecords(event.target.checked)}
        >
          {t('layers.custom_test_layers.switches.include_drafts')}
        </SwitchWithLabel>
        <SwitchWithLabel
          checked={showMockLabels}
          ariaLabel={t('layers.custom_test_layers.switches.show_labels')}
          onChange={(event) => setShowMockLabels(event.target.checked)}
        >
          {t('layers.custom_test_layers.switches.show_labels')}
        </SwitchWithLabel>
      </Box>
    </Box>
  )
}

export default CustomTestLayersAccordionContent
