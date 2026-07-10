import React from 'react'
import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import CheckBoxWithLabel from '#/components/common/CheckBoxWithLabel'
import SquishedSwitchWithLabel from '#/components/common/SquishedSwitchWithLabel'
import SwitchWithLabel from '#/components/common/SwitchWithLabel'

const noop = () => {}

const BooleanControlsFixtureWrapper = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Box
    sx={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1rem',
      padding: 1,
      backgroundColor: '#ffffff',
    }}
  >
    {children}
  </Box>
)

const FocusVisibleSquishedSwitch = () => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const switchInput = inputRef.current

    switchInput?.focus()
    switchInput?.setAttribute('data-focus-visible', 'true')

    return () => {
      switchInput?.removeAttribute('data-focus-visible')
    }
  }, [])

  return (
    <SquishedSwitchWithLabel
      checked
      onChange={noop}
      inputRef={inputRef}
      inputProps={{
        'aria-label': 'Sähkölämmitys',
      }}
      sx={{ width: '100%' }}
    >
      Sähkölämmitys
    </SquishedSwitchWithLabel>
  )
}

const FocusVisibleCheckBox = () => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const checkboxInput = inputRef.current

    checkboxInput?.focus()
    checkboxInput?.setAttribute('data-focus-visible', 'true')

    return () => {
      checkboxInput?.removeAttribute('data-focus-visible')
    }
  }, [])

  return (
    <CheckBoxWithLabel
      checked
      onChange={noop}
      inputRef={inputRef}
      inputProps={{
        'aria-label': 'Kuva checkbox',
      }}
    >
      Kuva checkbox
    </CheckBoxWithLabel>
  )
}

const iconSizeSx = {
  width: 16,
  height: 16,
  borderRadius: 2,
  fontSize: '0.7rem',
  color: '#ffffff',
  backgroundColor: '#2C8E74',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const booleanControlsFixture: ComponentFixture = {
  id: 'boolean-controls',
  label: 'Boolean Controls',
  description: 'Shared boolean control states.',
  sourceGlobs: [
    'src/components/common/Switch.tsx',
    'src/components/common/SwitchWithLabel.tsx',
    'src/components/common/SquishedSwitchWithLabel.tsx',
    'src/components/common/CheckBoxWithLabel.tsx',
    'src/components/icons/Checkbox.tsx',
    'src/components/icons/CheckboxChecked.tsx',
    'src/components/common/SquishedSwitchWithLabel.test.tsx',
    'src/components/common/CheckBoxWithLabel.test.tsx',
    'src/common/component-fixtures/fixtures/BooleanControlsFixture.tsx',
  ],
  wrapper: BooleanControlsFixtureWrapper,
  states: [
    {
      id: 'switch-unchecked',
      label: 'Switch unchecked',
      description: 'Switch false state with visible text label.',
      render: () => (
        <SwitchWithLabel checked={false} onChange={noop}>
          Switch off
        </SwitchWithLabel>
      ),
    },
    {
      id: 'switch-checked',
      label: 'Switch checked',
      description: 'Switch true state with visible text label.',
      render: () => (
        <SwitchWithLabel checked onChange={noop}>
          Switch on
        </SwitchWithLabel>
      ),
    },
    {
      id: 'squished-switch-unchecked',
      label: 'Squished switch unchecked',
      description: 'Compact squished switch false endpoint.',
      render: () => (
        <SquishedSwitchWithLabel checked={false} onChange={noop}>
          Squished off
        </SquishedSwitchWithLabel>
      ),
    },
    {
      id: 'squished-switch-checked',
      label: 'Squished switch checked',
      description: 'Compact squished switch true endpoint.',
      render: () => (
        <SquishedSwitchWithLabel checked onChange={noop}>
          Squished on
        </SquishedSwitchWithLabel>
      ),
    },
    {
      id: 'switch-disabled',
      label: 'Switch disabled',
      description: 'Switch disabled state keeps disabled interaction disabled.',
      render: () => (
        <SwitchWithLabel checked disabled onChange={noop}>
          Switch disabled
        </SwitchWithLabel>
      ),
    },
    {
      id: 'switch-focus-visible',
      label: 'Switch focus visible',
      description: 'Focus-visible styling hook applied to switch.',
      render: () => <FocusVisibleSquishedSwitch />,
    },
    {
      id: 'switch-required',
      label: 'Switch required',
      description: 'Required state renders required marker.',
      render: () => (
        <SwitchWithLabel checked required onChange={noop}>
          Required switch
        </SwitchWithLabel>
      ),
    },
    {
      id: 'switch-non-string-label',
      label: 'Switch non-string label',
      description: 'Explicit aria label for custom JSX children.',
      render: () => (
        <SquishedSwitchWithLabel
          checked
          ariaLabel="Explicit switch label"
          onChange={noop}
        >
          <Box component="span">Switch custom node</Box>
        </SquishedSwitchWithLabel>
      ),
    },
    {
      id: 'squished-custom-track',
      label: 'Squished switch custom track',
      description: 'Custom track color on a compact squished switch.',
      render: () => (
        <SquishedSwitchWithLabel
          checked
          checkedTrackColor="#274AFF"
          controlSx={{
            '& .MuiSwitch-switchBase + .MuiSwitch-track': {
              backgroundColor: '#a3a3a3',
            },
          }}
          onChange={noop}
        >
          Squished custom track
        </SquishedSwitchWithLabel>
      ),
    },
    {
      id: 'checkbox-unchecked',
      label: 'Checkbox unchecked',
      description: 'Checkbox base style with unchecked icon.',
      render: () => (
        <CheckBoxWithLabel checked={false} onChange={noop}>
          Checkbox off
        </CheckBoxWithLabel>
      ),
    },
    {
      id: 'checkbox-checked',
      label: 'Checkbox checked',
      description: 'Checkbox checked style with checked icon.',
      render: () => (
        <CheckBoxWithLabel checked onChange={noop}>
          Checkbox on
        </CheckBoxWithLabel>
      ),
    },
    {
      id: 'checkbox-disabled-required',
      label: 'Checkbox disabled required',
      description: 'Disabled checkbox with required marker.',
      render: () => (
        <CheckBoxWithLabel checked={false} disabled required onChange={noop}>
          Disabled checkbox
        </CheckBoxWithLabel>
      ),
    },
    {
      id: 'checkbox-focus-visible',
      label: 'Checkbox focus visible',
      description: 'Focus-visible styling hook applied to checkbox.',
      render: () => <FocusVisibleCheckBox />,
    },
    {
      id: 'checkbox-custom-icon',
      label: 'Checkbox custom icon',
      description: 'Checkbox with custom icon and checkedIcon props.',
      render: () => (
        <CheckBoxWithLabel
          checked
          onChange={noop}
          icon={
            <Box component="span" sx={iconSizeSx}>
              N
            </Box>
          }
          checkedIcon={
            <Box component="span" sx={{ ...iconSizeSx, backgroundColor: '#274AFF' }}>
              Y
            </Box>
          }
        >
          Checkbox custom icon
        </CheckBoxWithLabel>
      ),
    },
  ],
}
