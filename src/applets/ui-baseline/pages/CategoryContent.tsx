'use client'

import React, { useEffect, useRef, useState } from 'react'

import { useUIStore } from '#/common/store/uiStore'
import { Box } from '#/common/style/theme'
import type { SelectOption } from '#/common/types/general'
import type { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import type { NotificationMessage } from '#/common/types/state'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Button, IconButton } from '#/components/common/Button'
import CheckBoxWithLabel from '#/components/common/CheckBoxWithLabel'
import DropDownMultiSelect, {
  type DropDownMultiSelectOption,
} from '#/components/common/DropDownMultiSelect'
import DropDownSelect from '#/components/common/DropDownSelect'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import DropDownSelectMinimal from '#/components/common/DropDownSelectMinimal'
import DropDownSelectWithHeader from '#/components/common/DropDownSelectWithHeader'
import DropDownSelectWithLabel from '#/components/common/DropDownSelectWithLabel'
import EditableText from '#/components/common/EditableText'
import { EyeButton } from '#/components/common/EyeButton'
import IconTextButton from '#/components/common/IconTextButton'
import { LayerToggleRow } from '#/components/common/LayerToggleRow'
import MultiSelectAutocomplete from '#/components/common/MultiSelectAutocomplete'
import {
  NodeFlowAccordion,
  NodeFlowButton,
  NodeFlowContainer,
} from '#/components/common/NodeFlow'
import { NumberInputField } from '#/components/common/NumberInputField'
import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import TextFieldWithHeader from '#/components/common/TextFieldWithHeader'
import TextFieldWithLabel from '#/components/common/TextFieldWithLabel'
import TText from '#/components/common/TText'
import { LoadingModal } from '#/components/Loading'
import { ClickableModal } from '#/components/Modal'
import {
  CircleArrowRight,
  EyeOpen,
  InfoCircle,
  Layers,
  Tune,
} from '#/components/icons'

import {
  UI_BASELINE_NAMESPACE,
  type UiBaselineCategoryId,
} from '../common/categories'

type BaselineSectionProps = {
  title: string
  children: React.ReactNode
}

type BaselineExampleProps = {
  title: string
  children: React.ReactNode
  minHeight?: string | number
}

const noop = () => {}
const noopString = (_value: string) => {}
const loadingModalDisplayMs = 2000

const notificationVariants: NotificationMessage['variant'][] = [
  'default',
  'info',
  'success',
  'warning',
  'error',
]

const selectOptions: SelectOption[] = [
  { value: 'heat-demand', label: 'Heat demand' },
  { value: 'solar-potential', label: 'Solar potential' },
  { value: 'emissions', label: 'Emissions' },
]

const multiSelectOptions: DropDownMultiSelectOption[] = [
  { value: 'heat-demand', label: 'Heat demand' },
  { value: 'solar-potential', label: 'Solar potential' },
  { value: 'emissions', label: 'Emissions' },
]

const autocompleteOptions: SelectOption[] = [
  { value: 'central-plan', label: 'Central plan' },
  { value: 'harbor-plan', label: 'Harbor plan' },
  { value: 'forest-edge', label: 'Forest edge' },
]

const BaselineSection = ({ title, children }: BaselineSectionProps) => (
  <Box
    component="section"
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.875rem',
    }}
  >
    <Box
      component="h2"
      sx={{
        m: 0,
        color: '#111111',
        fontSize: '0.8125rem',
        fontWeight: 700,
        lineHeight: 1.3,
      }}
    >
      {title}
    </Box>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {children}
    </Box>
  </Box>
)

const BaselineExample = ({
  title,
  children,
  minHeight,
}: BaselineExampleProps) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      minHeight,
    }}
  >
    <Box
      component="h3"
      sx={{
        m: 0,
        color: '#111111',
        fontSize: '0.6875rem',
        fontWeight: 700,
        lineHeight: 1.35,
      }}
    >
      {title}
    </Box>
    {children}
  </Box>
)

const BaselineInlineGroup = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.75rem',
    }}
  >
    {children}
  </Box>
)

const PlaceholderContent = () => (
  <Box
    component="p"
    sx={(theme) => ({
      m: 0,
      color: theme.palette.neutral.dark,
      fontSize: '0.875rem',
      lineHeight: 1.45,
    })}
  >
    <TText ns={UI_BASELINE_NAMESPACE} keyName="category.placeholder" />
  </Box>
)

const StatefulDropDownSelect = ({
  initialValue = '',
  placeholder,
  ariaLabel,
  label,
  allowEmpty = false,
  autoFocus = false,
  successIndicatorMode,
}: {
  initialValue?: string
  placeholder?: React.ReactNode
  ariaLabel: string
  label?: string
  allowEmpty?: boolean
  autoFocus?: boolean
  successIndicatorMode?: React.ComponentProps<
    typeof DropDownSelect
  >['successIndicatorMode']
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownSelect
      value={value}
      options={selectOptions}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      label={label}
      allowEmpty={allowEmpty}
      autoFocus={autoFocus}
      successIndicatorMode={successIndicatorMode}
    />
  )
}

const StatefulDropDownMultiSelect = ({
  initialValue,
  placeholder,
  ariaLabel,
}: {
  initialValue: string[]
  placeholder?: React.ReactNode
  ariaLabel: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <DropDownMultiSelect
      value={value}
      options={multiSelectOptions}
      onChange={(event) => setValue(event.target.value)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
    />
  )
}

const StatefulMultiSelectAutocomplete = ({
  initialValue = [],
  ariaLabel,
  placeholder,
  open,
  defaultInputValue,
  disabled = false,
}: {
  initialValue?: SelectOption[]
  ariaLabel: string
  placeholder: string
  open?: boolean
  defaultInputValue?: string
  disabled?: boolean
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <MultiSelectAutocomplete
      value={value}
      options={autocompleteOptions}
      onChange={(_event, nextValue) => setValue(nextValue)}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      open={open}
      defaultInputValue={defaultInputValue}
      disabled={disabled}
    />
  )
}

const FocusVisibleSquishedSwitch = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = inputRef.current
    input?.setAttribute('data-focus-visible', 'true')

    return () => {
      input?.removeAttribute('data-focus-visible')
    }
  }, [])

  return (
    <SquishedSwitchWithLabel
      checked
      inputRef={inputRef}
      onChange={noop}
      inputProps={{ 'aria-label': 'Focus visible squished switch' }}
    >
      Focus visible squished switch
    </SquishedSwitchWithLabel>
  )
}

const FocusVisibleCheckBox = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = inputRef.current
    input?.setAttribute('data-focus-visible', 'true')

    return () => {
      input?.removeAttribute('data-focus-visible')
    }
  }, [])

  return (
    <CheckBoxWithLabel
      checked
      inputRef={inputRef}
      onChange={noop}
      inputProps={{ 'aria-label': 'Focus visible checkbox' }}
    >
      Focus visible checkbox
    </CheckBoxWithLabel>
  )
}

const InteractiveBooleanControls = () => {
  const [switchChecked, setSwitchChecked] = useState(false)
  const [squishedChecked, setSquishedChecked] = useState(true)
  const [checkboxChecked, setCheckboxChecked] = useState(false)

  return (
    <>
      <SwitchWithLabel
        checked={switchChecked}
        onChange={(_event, checked) => setSwitchChecked(checked)}
      >
        Interactive switch
      </SwitchWithLabel>
      <SquishedSwitchWithLabel
        checked={squishedChecked}
        onChange={(_event, checked) => setSquishedChecked(checked)}
      >
        Interactive compact switch
      </SquishedSwitchWithLabel>
      <CheckBoxWithLabel
        checked={checkboxChecked}
        onChange={(_event, checked) => setCheckboxChecked(checked)}
      >
        Interactive checkbox
      </CheckBoxWithLabel>
    </>
  )
}

const StatefulTextFieldWithLabel = ({
  initialValue = '',
  ...props
}: Omit<
  React.ComponentProps<typeof TextFieldWithLabel>,
  'value' | 'onChange'
> & {
  initialValue?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <TextFieldWithLabel
      {...props}
      value={value}
      onChange={(event) => setValue(event.target.value)}
    />
  )
}

const StatefulTextFieldWithHeader = ({
  initialValue = '',
  ...props
}: Omit<
  React.ComponentProps<typeof TextFieldWithHeader>,
  'value' | 'onChange'
> & {
  initialValue?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <TextFieldWithHeader {...props} value={value} onChange={setValue} />
  )
}

const StatefulEditableText = ({
  initialValue,
  valueAppendix,
}: {
  initialValue: string
  valueAppendix?: string
}) => {
  const [value, setValue] = useState(initialValue)

  return (
    <EditableText
      value={value}
      valueAppendix={valueAppendix}
      onChange={(event) => setValue(event.target.value)}
      editButtonAriaLabel={`Edit ${initialValue}`}
      saveButtonAriaLabel={`Save ${initialValue}`}
      cancelButtonAriaLabel={`Cancel editing ${initialValue}`}
      textFieldAriaLabel={`Editing ${initialValue}`}
    />
  )
}

const StatefulNumberInputField = ({
  initialValue,
  ...props
}: Omit<
  React.ComponentProps<typeof NumberInputField>,
  'value' | 'onValueChange'
> & {
  initialValue: number | null
}) => {
  const [value, setValue] = useState<number | null>(initialValue)

  return (
    <NumberInputField
      {...props}
      value={value}
      onValueChange={(nextValue) => {
        if (typeof nextValue === 'number' || nextValue === null) {
          setValue(nextValue)
        }
      }}
    />
  )
}

const normalizeDurationSeconds = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(Math.round(value), 0), 60)
}

const NotificationTriggerButton = ({
  notificationVariant,
  durationSeconds,
}: {
  notificationVariant: NotificationMessage['variant']
  durationSeconds: number
}) => {
  const notify = useUIStore((state) => state.notify)

  const handleClick = () => {
    const durationText =
      durationSeconds === 0
        ? 'persistent'
        : `${durationSeconds} second${durationSeconds === 1 ? '' : 's'}`

    void notify({
      message: `UI baseline ${notificationVariant} notification (${durationText}).`,
      variant: notificationVariant,
      ...(durationSeconds === 0
        ? { persist: true }
        : { duration: durationSeconds * 1000 }),
    })
  }

  return (
    <Button variant="outlined" onClick={handleClick}>
      {notificationVariant}
    </Button>
  )
}

const NotificationsContent = () => {
  const [durationSeconds, setDurationSeconds] = useState<number | null>(6)
  const normalizedDurationSeconds = normalizeDurationSeconds(durationSeconds)

  const handleDurationChange: React.ComponentProps<
    typeof NumberInputField
  >['onValueChange'] = (nextValue) => {
    if (typeof nextValue === 'number' || nextValue === null) {
      setDurationSeconds(nextValue)
    }
  }

  const handleDurationCommit: React.ComponentProps<
    typeof NumberInputField
  >['onValueCommitted'] = (nextValue) => {
    if (typeof nextValue === 'number' || nextValue === null) {
      setDurationSeconds(normalizeDurationSeconds(nextValue))
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <BaselineSection title="Notification duration">
        <BaselineExample title="Duration in seconds">
          <NumberInputField
            label="Duration"
            helperText="0 keeps the notification open until dismissed."
            min={0}
            max={60}
            step={1}
            value={durationSeconds}
            onValueChange={handleDurationChange}
            onValueCommitted={handleDurationCommit}
            inputSlotProps={{
              inputMode: 'numeric',
              'aria-label': 'Notification duration seconds',
            }}
            format={{ maximumFractionDigits: 0 }}
          />
        </BaselineExample>
      </BaselineSection>

      <BaselineSection title="Notification variants">
        <BaselineExample title="Trigger through UI store">
          <BaselineInlineGroup>
            {notificationVariants.map((notificationVariant) => (
              <NotificationTriggerButton
                key={notificationVariant}
                notificationVariant={notificationVariant}
                durationSeconds={normalizedDurationSeconds}
              />
            ))}
          </BaselineInlineGroup>
        </BaselineExample>
      </BaselineSection>
    </Box>
  )
}

const clickableModalBody = (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      color: '#111111',
      lineHeight: 1.5,
    }}
  >
    <Box component="h2" sx={{ m: 0, fontSize: '1.25rem', lineHeight: 1.25 }}>
      Shared ClickableModal
    </Box>
    <Box component="p" sx={{ m: 0 }}>
      This body is rendered by the shared ClickableModal component.
    </Box>
  </Box>
)

const ModalsContent = () => {
  const setIsLoginModalOpen = useUIStore((state) => state.setIsLoginModalOpen)
  const triggerConfirmationDialog = useUIStore(
    (state) => state.triggerConfirmationDialog
  )
  const [confirmationStatus, setConfirmationStatus] = useState('Not opened')
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false)
  const loadingModalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  useEffect(() => {
    return () => {
      if (loadingModalTimeoutRef.current != null) {
        clearTimeout(loadingModalTimeoutRef.current)
      }
    }
  }, [])

  const openConfirmationDialog = () => {
    setConfirmationStatus('Waiting for action')
    void triggerConfirmationDialog({
      title: 'Confirm baseline action?',
      content:
        'This dialog is opened through the global confirmation dialog store.',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        setConfirmationStatus('Confirmed')
      },
      onCancel: () => {
        setConfirmationStatus('Cancelled')
      },
    })
  }

  const openLoadingModal = () => {
    if (loadingModalTimeoutRef.current != null) {
      clearTimeout(loadingModalTimeoutRef.current)
    }

    setIsLoadingModalOpen(true)
    loadingModalTimeoutRef.current = setTimeout(() => {
      setIsLoadingModalOpen(false)
      loadingModalTimeoutRef.current = null
    }, loadingModalDisplayMs)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <BaselineSection title="Shared modal components">
        <BaselineExample title="ClickableModal">
          <ClickableModal
            triggerAriaLabel="Open ClickableModal baseline modal"
            modalBody={clickableModalBody}
          >
            Open ClickableModal
          </ClickableModal>
        </BaselineExample>

        <BaselineExample title="LoadingModal">
          <BaselineInlineGroup>
            <Button variant="outlined" onClick={openLoadingModal}>
              Show LoadingModal
            </Button>
            <Box
              component="span"
              sx={{
                color: '#111111',
                fontSize: '0.8125rem',
                lineHeight: 1.35,
              }}
            >
              {isLoadingModalOpen ? 'Visible' : 'Hidden'}
            </Box>
          </BaselineInlineGroup>
          {isLoadingModalOpen && <LoadingModal />}
        </BaselineExample>
      </BaselineSection>

      <BaselineSection title="Global modal store triggers">
        <BaselineExample title="LoginModal">
          <Button
            variant="outlined"
            onClick={() => setIsLoginModalOpen(true)}
          >
            Open LoginModal
          </Button>
        </BaselineExample>

        <BaselineExample title="ConfirmationDialog">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button variant="outlined" onClick={openConfirmationDialog}>
              Open ConfirmationDialog
            </Button>
            <Box
              component="span"
              sx={{
                color: '#111111',
                fontSize: '0.8125rem',
                lineHeight: 1.35,
              }}
            >
              Confirmation status: {confirmationStatus}
            </Box>
          </Box>
        </BaselineExample>
      </BaselineSection>
    </Box>
  )
}

const LayerControlExample = ({
  label,
  status,
  disabled = false,
  color,
}: {
  label: string
  status: LayerGroupStatus
  disabled?: boolean
  color?: string
}) => (
  <LayerToggleRow
    label={label}
    status={status}
    disabled={disabled}
    color={color}
    onToggle={noop}
    ariaLabel={`Toggle ${label}`}
  />
)

const DropdownsContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Open and empty-result states">
      <BaselineExample
        title="DropDownSelect empty selection menu"
        minHeight="13rem"
      >
        <DropDownSelect
          value=""
          options={selectOptions}
          onChange={noop}
          allowEmpty
          defaultOpen
          placeholder="Choose layer"
          ariaLabel="Empty selection select"
        />
      </BaselineExample>
      <BaselineExample
        title="MultiSelectAutocomplete no results"
        minHeight="10rem"
      >
        <StatefulMultiSelectAutocomplete
          placeholder="Compare plans"
          ariaLabel="No results autocomplete"
          open
          defaultInputValue="zzz"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="DropDownSelect">
      <BaselineExample title="Placeholder">
        <StatefulDropDownSelect
          placeholder="Choose layer"
          ariaLabel="Placeholder select"
        />
      </BaselineExample>
      <BaselineExample title="Focused selected value">
        <StatefulDropDownSelect
          initialValue="heat-demand"
          ariaLabel="Focused select"
          autoFocus
        />
      </BaselineExample>
      <BaselineExample title="Selected value">
        <StatefulDropDownSelect
          initialValue="heat-demand"
          ariaLabel="Selected select"
        />
      </BaselineExample>
      <BaselineExample title="Floating label and success indicator">
        <StatefulDropDownSelect
          initialValue="solar-potential"
          label="Energy layer"
          ariaLabel="Labeled select"
          successIndicatorMode="outside"
        />
      </BaselineExample>
      <BaselineExample title="Invalid incoming value">
        <DropDownSelect
          value="legacy-layer"
          options={selectOptions}
          onChange={noop}
          ariaLabel="Invalid incoming value select"
        />
      </BaselineExample>
      <BaselineExample title="Disabled selected value">
        <DropDownSelect
          value="emissions"
          options={selectOptions}
          onChange={noop}
          disabled
          ariaLabel="Disabled select"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="Labeled select variants">
      <BaselineExample title="DropDownSelectWithHeader">
        <DropDownSelectWithHeader
          value="heat-demand"
          options={selectOptions}
          onChange={noop}
          label="Scenario"
          placeholder="Choose scenario"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectWithLabel">
        <DropDownSelectWithLabel
          value="solar-potential"
          options={selectOptions}
          onChange={noop}
          label="Plan layer"
          placeholder="Choose plan layer"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectInset">
        <DropDownSelectInset
          value="emissions"
          options={selectOptions}
          onChange={noop}
          label="Inset label"
          ariaLabel="Inset select"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectMinimal selected">
        <DropDownSelectMinimal
          value="heat-demand"
          options={selectOptions}
          onChange={noop}
          ariaLabel="Minimal selected select"
        />
      </BaselineExample>
      <BaselineExample title="DropDownSelectMinimal compact">
        <DropDownSelectMinimal
          value="emissions"
          options={selectOptions}
          onChange={noop}
          ariaLabel="Minimal compact select"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="DropDownMultiSelect">
      <BaselineExample title="Placeholder">
        <StatefulDropDownMultiSelect
          initialValue={[]}
          placeholder="Choose layers"
          ariaLabel="Multi-select placeholder"
        />
      </BaselineExample>
      <BaselineExample title="One selected">
        <StatefulDropDownMultiSelect
          initialValue={['heat-demand']}
          ariaLabel="One selected multi-select"
        />
      </BaselineExample>
      <BaselineExample title="Multiple selected">
        <StatefulDropDownMultiSelect
          initialValue={['heat-demand', 'solar-potential']}
          ariaLabel="Multiple selected multi-select"
        />
      </BaselineExample>
      <BaselineExample title="Interactive checked and unchecked values">
        <DropDownMultiSelect
          value={['heat-demand']}
          options={multiSelectOptions}
          onChange={noop}
          ariaLabel="Interactive multi-select"
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <DropDownMultiSelect
          value={['emissions']}
          options={multiSelectOptions}
          onChange={noop}
          disabled
          ariaLabel="Disabled multi-select"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="MultiSelectAutocomplete">
      <BaselineExample title="Empty placeholder">
        <StatefulMultiSelectAutocomplete
          placeholder="Compare plans"
          ariaLabel="Empty autocomplete"
        />
      </BaselineExample>
      <BaselineExample title="Selected chips">
        <StatefulMultiSelectAutocomplete
          initialValue={[autocompleteOptions[0], autocompleteOptions[1]]}
          placeholder="Compare plans"
          ariaLabel="Selected chips autocomplete"
        />
      </BaselineExample>
      <BaselineExample title="Options autocomplete">
        <StatefulMultiSelectAutocomplete
          placeholder="Compare plans"
          ariaLabel="Options autocomplete"
        />
      </BaselineExample>
      <BaselineExample title="Disabled selected chips">
        <StatefulMultiSelectAutocomplete
          initialValue={[autocompleteOptions[2]]}
          placeholder="Compare plans"
          ariaLabel="Disabled autocomplete"
          disabled
        />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

const ButtonsTogglesContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Button">
      <BaselineExample title="Variants and sizes">
        <BaselineInlineGroup>
          <Button
            variant="contained"
            startIcon={<InfoCircle aria-hidden="true" />}
            onClick={noop}
          >
            Contained
          </Button>
          <Button variant="outlined" size="small" onClick={noop}>
            Outlined small
          </Button>
          <Button variant="text" size="large" onClick={noop}>
            Text large
          </Button>
        </BaselineInlineGroup>
      </BaselineExample>
      <BaselineExample title="Disabled and pressed">
        <BaselineInlineGroup>
          <Button disabled variant="contained" onClick={noop}>
            Disabled
          </Button>
          <Button
            aria-pressed="true"
            data-active="true"
            variant="outlined"
            onClick={noop}
          >
            Selected
          </Button>
          <Button data-focus-visible="true" variant="outlined" onClick={noop}>
            Focus visible
          </Button>
        </BaselineInlineGroup>
      </BaselineExample>
      <BaselineExample title="Anchor and icon slots">
        <BaselineInlineGroup>
          <Button
            component="a"
            href="#ui-baseline-button-anchor"
            variant="text"
          >
            Anchor
          </Button>
          <Button
            variant="contained"
            endIcon={<CircleArrowRight aria-hidden="true" />}
            onClick={noop}
          >
            Continue
          </Button>
        </BaselineInlineGroup>
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="Icon and menu buttons">
      <BaselineExample title="IconButton">
        <BaselineInlineGroup>
          <IconButton aria-label="Show layer" onClick={noop}>
            <EyeOpen aria-hidden="true" />
          </IconButton>
          <IconButton aria-label="Configure filters" disabled onClick={noop}>
            <Tune aria-hidden="true" />
          </IconButton>
        </BaselineInlineGroup>
      </BaselineExample>
      <BaselineExample title="BigMenuButton">
        <BigMenuButton onClick={noop}>Open baseline menu</BigMenuButton>
      </BaselineExample>
      <BaselineExample title="IconTextButton">
        <IconTextButton
          icon={<Layers aria-hidden="true" />}
          text="Layer row action"
          helperText="Helper tooltip content"
          helperAriaLabel="Show layer row action help"
          onClick={noop}
        />
      </BaselineExample>
      <BaselineExample title="IconTextButton disabled">
        <IconTextButton
          disabled
          icon={<Layers aria-hidden="true" />}
          text="Disabled row action"
          helperText="Disabled helper content"
          helperAriaLabel="Show disabled row action help"
          onClick={noop}
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="Layer visibility controls">
      <BaselineExample title="EyeButton states">
        <BaselineInlineGroup>
          <EyeButton
            color="#2C8E74"
            status="visible"
            onClick={noop}
            ariaLabel="Toggle visible layer"
          />
          <EyeButton
            color="#2C8E74"
            status="hidden"
            onClick={noop}
            ariaLabel="Toggle hidden layer"
          />
          <EyeButton
            color="#2C8E74"
            status="processing"
            onClick={noop}
            ariaLabel="Toggle processing layer"
          />
        </BaselineInlineGroup>
      </BaselineExample>
      <BaselineExample title="LayerToggleRow">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <LayerControlExample
            label="Visible layer"
            status="visible"
            color="#2C8E74"
          />
          <LayerControlExample label="Hidden layer" status="hidden" />
          <LayerControlExample label="Loading layer" status="processing" />
          <LayerControlExample
            label="Disabled layer"
            status="hidden"
            disabled
          />
        </Box>
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="SwitchWithLabel and CheckBoxWithLabel">
      <BaselineExample title="Interactive enabled controls">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <InteractiveBooleanControls />
        </Box>
      </BaselineExample>
      <BaselineExample title="Checked, unchecked, disabled, and required">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <SwitchWithLabel checked onChange={noop}>
            Checked switch
          </SwitchWithLabel>
          <SwitchWithLabel checked={false} onChange={noop}>
            Unchecked switch
          </SwitchWithLabel>
          <SwitchWithLabel checked disabled onChange={noop}>
            Disabled switch
          </SwitchWithLabel>
          <SwitchWithLabel checked required onChange={noop}>
            Required switch
          </SwitchWithLabel>
          <SquishedSwitchWithLabel checked onChange={noop}>
            Checked compact switch
          </SquishedSwitchWithLabel>
          <FocusVisibleSquishedSwitch />
          <CheckBoxWithLabel checked onChange={noop}>
            Checked checkbox
          </CheckBoxWithLabel>
          <CheckBoxWithLabel checked={false} onChange={noop}>
            Unchecked checkbox
          </CheckBoxWithLabel>
          <CheckBoxWithLabel checked={false} disabled required onChange={noop}>
            Disabled required checkbox
          </CheckBoxWithLabel>
          <FocusVisibleCheckBox />
        </Box>
      </BaselineExample>
    </BaselineSection>
  </Box>
)

const InputsContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="TextFieldWithLabel">
      <BaselineExample title="Empty and placeholder">
        <StatefulTextFieldWithLabel
          label="Area name"
          ariaLabel="Empty area name"
          placeholder="Type a name"
        />
      </BaselineExample>
      <BaselineExample title="Populated and focused">
        <StatefulTextFieldWithLabel
          label="Focused area"
          ariaLabel="Focused area"
          initialValue="Central district"
          autoFocus
        />
      </BaselineExample>
      <BaselineExample title="Required error with helper">
        <StatefulTextFieldWithLabel
          label="Required field"
          ariaLabel="Required field"
          required
          error
          helperText="This value is required."
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <TextFieldWithLabel
          label="Disabled field"
          ariaLabel="Disabled field"
          value="Locked value"
          disabled
          onChange={noop}
        />
      </BaselineExample>
      <BaselineExample title="Multiline">
        <StatefulTextFieldWithLabel
          label="Description"
          ariaLabel="Multiline description"
          initialValue={'Line one\nLine two'}
          multiline
          rows={3}
          helperText="Multiline helper text."
        />
      </BaselineExample>
      <BaselineExample title="Trailing content">
        <StatefulTextFieldWithLabel
          label="Buffer"
          ariaLabel="Buffer with trailing unit"
          initialValue="250"
          inputMode="numeric"
          trailing="m"
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="TextFieldWithHeader">
      <BaselineExample title="Empty placeholder">
        <StatefulTextFieldWithHeader
          headerText="Scenario name"
          placeholderText="Type scenario name"
        />
      </BaselineExample>
      <BaselineExample title="Populated">
        <StatefulTextFieldWithHeader
          headerText="Plan name"
          initialValue="Harbor plan"
          placeholderText="Type plan name"
        />
      </BaselineExample>
      <BaselineExample title="Required error with helper">
        <TextFieldWithHeader
          headerText="Required header"
          value=""
          onChange={noopString}
          placeholderText="Type a value"
          required
          error
          helperText="Header value is required."
        />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <TextFieldWithHeader
          headerText="Disabled header"
          value="Disabled value"
          onChange={noopString}
          placeholderText="Type a value"
          disabled
        />
      </BaselineExample>
      <BaselineExample title="Multiline">
        <StatefulTextFieldWithHeader
          headerText="Notes"
          initialValue={'First note\nSecond note'}
          placeholderText="Type notes"
          multiline
          rows={3}
          helperText="Header multiline helper text."
        />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="EditableText">
      <BaselineExample title="Display and edit action">
        <StatefulEditableText initialValue="Editable baseline title" />
      </BaselineExample>
      <BaselineExample title="Display with appendix">
        <StatefulEditableText initialValue="125" valueAppendix=" ha" />
      </BaselineExample>
    </BaselineSection>

    <BaselineSection title="NumberInputField">
      <BaselineExample title="Empty">
        <NumberInputField label="Distance" />
      </BaselineExample>
      <BaselineExample title="Value and stepper">
        <StatefulNumberInputField
          label="Area"
          initialValue={24}
          min={0}
          max={100}
          step={1}
        />
      </BaselineExample>
      <BaselineExample title="Focused value">
        <StatefulNumberInputField
          label="Focused value"
          initialValue={12}
          inputSlotProps={{ autoFocus: true }}
        />
      </BaselineExample>
      <BaselineExample title="Required">
        <NumberInputField label="Required count" required />
      </BaselineExample>
      <BaselineExample title="Disabled">
        <NumberInputField label="Disabled buffer" value={8} disabled />
      </BaselineExample>
      <BaselineExample title="Error helper">
        <StatefulNumberInputField
          label="Invalid value"
          initialValue={12}
          min={1}
          max={10}
          error
          helperText="Enter a value between 1 and 10."
        />
      </BaselineExample>
      <BaselineExample title="Min and max boundary">
        <StatefulNumberInputField
          label="Maximum"
          initialValue={10}
          min={0}
          max={10}
          step={1}
        />
      </BaselineExample>
      <BaselineExample title="Decimal step">
        <StatefulNumberInputField
          label="Decimal"
          initialValue={1.5}
          min={0}
          step={0.5}
          snapOnStep
          inputSlotProps={{ inputMode: 'decimal' }}
        />
      </BaselineExample>
    </BaselineSection>
  </Box>
)

const NodeFlowContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
    <BaselineSection title="Connected NodeFlow sequence">
      <NodeFlowContainer>
        <NodeFlowAccordion
          title="Import source data"
          status="complete"
          helper="Source data is ready."
          defaultOpen
          ariaLabel="Import source data"
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem',
              fontSize: '0.75rem',
              lineHeight: 1.45,
              color: '#111111',
            }}
          >
            <Box>Input file: harbor-plan.gpkg</Box>
            <Box>Detected layers: zoning areas and area names</Box>
          </Box>
        </NodeFlowAccordion>
        <NodeFlowButton status="complete" title="Configure scenario" />
        <NodeFlowButton
          title="Review planning areas"
          helper="Open the area list to inspect imported boundaries."
          onClick={noop}
        />
        <NodeFlowButton
          status="error"
          title="Calculate report"
          helper="Emission factors are missing for one area."
          onClick={noop}
        />
        <NodeFlowButton
          disabled
          title="Publish result"
          helper="Resolve calculation errors before publishing."
          onClick={noop}
        />
      </NodeFlowContainer>
    </BaselineSection>
  </Box>
)

const categoryContentById: Partial<
  Record<UiBaselineCategoryId, React.FC>
> = {
  dropdowns: DropdownsContent,
  'buttons-toggles': ButtonsTogglesContent,
  inputs: InputsContent,
  notifications: NotificationsContent,
  modals: ModalsContent,
  'node-flow': NodeFlowContent,
}

const CategoryContent = ({
  categoryId,
}: {
  categoryId: UiBaselineCategoryId
}) => {
  const Content = categoryContentById[categoryId]

  if (!Content) {
    return <PlaceholderContent />
  }

  return <Content />
}

export default CategoryContent
