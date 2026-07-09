'use client'

import { useEffect, useRef, useState } from 'react'

import type { LayerGroupStatus } from '#/common/hooks/map/useLayerGroup'
import { Box } from '#/common/style/theme'
import BigMenuButton from '#/components/common/BigMenuButton'
import { Button, IconButton } from '#/components/common/Button'
import CheckBoxWithLabel from '#/components/common/CheckBoxWithLabel'
import { EyeButton } from '#/components/common/EyeButton'
import IconTextButton from '#/components/common/IconTextButton'
import { LayerToggleRow } from '#/components/common/LayerToggleRow'
import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'
import {
  CircleArrowRight,
  EyeOpen,
  InfoCircle,
  Layers,
  Tune,
} from '#/components/icons'

import {
  BaselineExample,
  BaselineInlineGroup,
  BaselineSection,
  noop,
} from '../BaselineContent'

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
          <SquishedSwitchWithLabel checked={false} onChange={noop}>
            Unchecked compact switch
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

export default ButtonsTogglesContent
