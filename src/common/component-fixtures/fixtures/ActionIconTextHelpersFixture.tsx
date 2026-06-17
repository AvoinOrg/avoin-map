'use client'

import React from 'react'

import { Box } from '#/common/style/theme'
import type { ComponentFixture } from '#/common/component-fixtures/types'
import BigMenuButton from '#/components/common/BigMenuButton'
import ClipboardCopyWrapper from '#/components/common/ClipboardCopyWrapper'
import { EyeButton } from '#/components/common/EyeButton'
import IconTextButton from '#/components/common/IconTextButton'
import IconWithText from '#/components/common/IconWithText'
import {
  Download,
  InfoCircle,
  Link,
  Plus,
  Upload,
} from '#/components/icons'

const noop = () => {}

const iconSx = {
  width: 18,
  height: 18,
}

const ActionHelpersWrapper = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      width: 360,
      maxWidth: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Box>
)

const IconTextButtonHelperOpen = () => {
  React.useEffect(() => {
    window.setTimeout(() => {
      const trigger = document.querySelector<HTMLButtonElement>(
        '[aria-label="Fixture helper information"]'
      )

      trigger?.click()
    }, 0)
  }, [])

  return (
    <IconTextButton
      icon={<InfoCircle aria-hidden="true" />}
      text="HELPER DETAILS"
      helperText="Fixture helper text shown above the trigger."
      helperAriaLabel="Fixture helper information"
      onClick={noop}
    />
  )
}

export const actionIconTextHelpersFixture: ComponentFixture = {
  id: 'action-icon-text-helpers',
  label: 'Action and icon text helpers',
  description:
    'Shared low-level action helpers for buttons, icon/text rows, eye states, and clipboard rows.',
  sourceGlobs: [
    'src/components/common/BigMenuButton.tsx',
    'src/components/common/EyeButton.tsx',
    'src/components/common/IconTextButton.tsx',
    'src/components/common/IconWithText.tsx',
    'src/components/common/ClipboardCopyWrapper.tsx',
    'src/common/component-fixtures/fixtures/ActionIconTextHelpersFixture.tsx',
  ],
  wrapper: ActionHelpersWrapper,
  states: [
    {
      id: 'big-menu-button-default',
      label: 'BigMenuButton default',
      description: 'Full-width action button with text and an upload icon.',
      render: () => (
        <BigMenuButton>
          <span>Upload file</span>
          <Upload aria-hidden="true" sx={iconSx} />
        </BigMenuButton>
      ),
    },
    {
      id: 'big-menu-button-disabled',
      label: 'BigMenuButton disabled',
      description: 'Disabled full-width action button.',
      render: () => (
        <BigMenuButton disabled>
          <span>Upload disabled</span>
          <Upload aria-hidden="true" sx={iconSx} />
        </BigMenuButton>
      ),
    },
    {
      id: 'big-menu-button-label-input',
      label: 'BigMenuButton label input',
      description: 'Label-rendered upload action wrapping a hidden file input.',
      render: () => (
        <BigMenuButton component="label">
          <span>Select pictures</span>
          <input hidden type="file" />
        </BigMenuButton>
      ),
    },
    {
      id: 'eye-button-hidden',
      label: 'EyeButton hidden',
      description: 'Hidden layer status with closed-eye icon.',
      render: () => (
        <EyeButton color="#2f855a" status="hidden" onClick={noop} />
      ),
    },
    {
      id: 'eye-button-visible',
      label: 'EyeButton visible',
      description: 'Visible layer status with color swatch.',
      render: () => (
        <EyeButton color="#2f855a" status="visible" onClick={noop} />
      ),
    },
    {
      id: 'eye-button-processing',
      label: 'EyeButton processing',
      description: 'Processing layer status with loading indicator.',
      render: () => (
        <EyeButton color="#2f855a" status="processing" onClick={noop} />
      ),
    },
    {
      id: 'icon-text-button-default',
      label: 'IconTextButton default',
      description: 'Action row with icon and text.',
      render: () => (
        <IconTextButton
          icon={<InfoCircle aria-hidden="true" />}
          text="OPEN REPORT"
          onClick={noop}
        />
      ),
    },
    {
      id: 'icon-text-button-disabled',
      label: 'IconTextButton disabled',
      description: 'Disabled main action and disabled helper trigger.',
      render: () => (
        <IconTextButton
          disabled
          icon={<InfoCircle aria-hidden="true" />}
          text="OPEN REPORT"
          helperText="Disabled helper content."
          onClick={noop}
        />
      ),
    },
    {
      id: 'icon-text-button-helper-open',
      label: 'IconTextButton helper open',
      description: 'Helper popup opened through the helper trigger.',
      canvasSx: {
        minHeight: 180,
        overflow: 'visible',
      },
      render: () => <IconTextButtonHelperOpen />,
    },
    {
      id: 'icon-with-text-left-icon',
      label: 'IconWithText left icon',
      description: 'Interactive icon/text row with the icon on the left.',
      render: () => (
        <IconWithText icon={<Plus aria-hidden="true" />} onClick={noop}>
          Add layer
        </IconWithText>
      ),
    },
    {
      id: 'icon-with-text-right-icon',
      label: 'IconWithText right icon',
      description: 'Interactive icon/text row with the icon on the right.',
      render: () => (
        <IconWithText
          icon={<Download aria-hidden="true" />}
          isIconOnRight
          onClick={noop}
        >
          Download
        </IconWithText>
      ),
    },
    {
      id: 'icon-with-text-disabled',
      label: 'IconWithText disabled',
      description: 'Disabled interactive icon/text row.',
      render: () => (
        <IconWithText disabled icon={<Plus aria-hidden="true" />} onClick={noop}>
          Add disabled
        </IconWithText>
      ),
    },
    {
      id: 'clipboard-copy-wrapper-default',
      label: 'ClipboardCopyWrapper default',
      description: 'Enabled clipboard copy row.',
      render: () => (
        <ClipboardCopyWrapper textToCopy="https://example.test/report">
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Link aria-hidden="true" sx={iconSx} />
            <span>Copy report link</span>
          </Box>
        </ClipboardCopyWrapper>
      ),
    },
    {
      id: 'clipboard-copy-wrapper-disabled',
      label: 'ClipboardCopyWrapper disabled',
      description: 'Disabled clipboard copy row.',
      render: () => (
        <ClipboardCopyWrapper disabled textToCopy="https://example.test/report">
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
            <Link aria-hidden="true" sx={iconSx} />
            <span>Copy disabled</span>
          </Box>
        </ClipboardCopyWrapper>
      ),
    },
  ],
}
