import React from 'react'

import { Box } from '#/common/style/theme'
import type {
  SidebarPanelExtensionRuntimeOptions,
  SidebarPanelId,
  SidebarPanelLayout,
} from '#/common/types/sidebar'
import { Button } from '#/components/common/Button'
import {
  IntoSidebarPanelExtensionPanelSlot,
  SidebarPanelExtensionPageContainer,
  SidebarPanelExtensionProvider,
  SidebarPanelExtensionTabContainer,
  useSidebarPanelExtensionRuntimeOptions,
} from '#/components/Sidebar'
import { useSidebarPanelExtensionTabsContext } from '#/components/Sidebar/SidebarPanelExtensionTabsContext'

const PANEL_EXTENSION_ID = 'ui-baseline-generic-panel-configurations'

const PANEL_CONFIGURATIONS = [
  {
    id: 'open-single-panel',
    name: 'Open single-panel view',
    icon: '1',
    panelLayout: 'single',
    visiblePanels: ['main'],
    layoutMode: 'default',
    replaceBaseSidebar: false,
  },
  {
    id: 'open-two-panel',
    name: 'Open two-panel view',
    icon: '2',
    panelLayout: 'double',
    visiblePanels: ['main', 'secondary'],
    layoutMode: 'default',
    replaceBaseSidebar: false,
  },
  {
    id: 'open-three-panel',
    name: 'Open three-panel view',
    icon: '3',
    panelLayout: 'triple',
    visiblePanels: ['main', 'secondary', 'tertiary'],
    layoutMode: 'default',
    replaceBaseSidebar: false,
  },
  {
    id: 'fullscreen-single-panel',
    name: 'Fullscreen single-panel view',
    icon: '1F',
    panelLayout: 'single',
    visiblePanels: ['main'],
    layoutMode: 'fullscreen',
    replaceBaseSidebar: true,
  },
  {
    id: 'fullscreen-two-panel',
    name: 'Fullscreen two-panel view',
    icon: '2F',
    panelLayout: 'double',
    visiblePanels: ['main', 'secondary'],
    layoutMode: 'fullscreen',
    replaceBaseSidebar: true,
  },
  {
    id: 'fullscreen-three-panel',
    name: 'Fullscreen three-panel view',
    icon: '3F',
    panelLayout: 'triple',
    visiblePanels: ['main', 'secondary', 'tertiary'],
    layoutMode: 'fullscreen',
    replaceBaseSidebar: true,
  },
] as const satisfies readonly {
  id: string
  name: string
  icon: string
  panelLayout: SidebarPanelLayout
  visiblePanels: readonly SidebarPanelId[]
  layoutMode: SidebarPanelExtensionRuntimeOptions['layoutMode']
  replaceBaseSidebar: boolean
}[]

type PanelConfiguration = (typeof PANEL_CONFIGURATIONS)[number]

const INITIAL_CONFIGURATION = PANEL_CONFIGURATIONS[0]

const getPanelConfiguration = (tabId?: string): PanelConfiguration =>
  PANEL_CONFIGURATIONS.find((configuration) => configuration.id === tabId) ??
  INITIAL_CONFIGURATION

const getRuntimeOptions = (
  configuration: PanelConfiguration
): SidebarPanelExtensionRuntimeOptions => ({
  panelLayout: configuration.panelLayout,
  visiblePanels: [...configuration.visiblePanels],
  activePanel: 'main',
  layoutMode: configuration.layoutMode,
  replaceBaseSidebar: configuration.replaceBaseSidebar,
})

const INITIAL_RUNTIME_OPTIONS = getRuntimeOptions(INITIAL_CONFIGURATION)

const PANEL_CONTROL_BOX_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
} as const

const PANEL_CONTROL_ROW_SX = {
  display: 'flex',
  flexDirection: { mobile: 'column', desktop: 'row' },
  alignItems: { mobile: 'stretch', desktop: 'center' },
  flexWrap: 'wrap',
  gap: '0.625rem',
} as const

const GenericPanelBody = ({
  configuration,
  panelId,
}: {
  configuration: PanelConfiguration
  panelId: SidebarPanelId
}) => (
  <Box
    data-testid={`ui-baseline-generic-panel-${panelId}`}
    data-ui-baseline-panel-configuration={configuration.id}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      p: '1.25rem',
    }}
  >
    <Box
      component="h2"
      sx={{ m: 0, fontSize: '1.125rem', lineHeight: 1.25 }}
    >
      Generic {panelId} panel
    </Box>
    <Box component="p" sx={{ m: 0 }}>
      Configuration: <strong>{configuration.name}</strong>
    </Box>
    <Box component="p" sx={{ m: 0 }}>
      This is intentionally fake panel content for checking the shared sidebar
      extension layout, tab rail, controls, and scrolling.
    </Box>
    {Array.from({ length: 8 }, (_, index) => (
      <Box component="p" key={index} sx={{ m: 0 }}>
        Fixture content row {index + 1} for the {panelId} panel.
      </Box>
    ))}
  </Box>
)

const GenericPanelConfigurations = ({ onClose }: { onClose: () => void }) => {
  const { resolvedActiveTabId } = useSidebarPanelExtensionTabsContext()
  const activeConfiguration = getPanelConfiguration(resolvedActiveTabId)
  const runtimeOptions = React.useMemo(
    () => getRuntimeOptions(activeConfiguration),
    [activeConfiguration]
  )

  useSidebarPanelExtensionRuntimeOptions(runtimeOptions)

  return (
    <>
      <IntoSidebarPanelExtensionPanelSlot panelId="main">
        {PANEL_CONFIGURATIONS.map((configuration) => (
          <SidebarPanelExtensionTabContainer
            key={configuration.id}
            tabId={configuration.id}
            tabName={configuration.name}
            tabAriaLabel={configuration.name}
            tabIcon={<span aria-hidden="true">{configuration.icon}</span>}
          >
            <SidebarPanelExtensionPageContainer
              closeAriaLabel="Close panel configuration"
              onClose={onClose}
            >
              <GenericPanelBody
                configuration={configuration}
                panelId="main"
              />
            </SidebarPanelExtensionPageContainer>
          </SidebarPanelExtensionTabContainer>
        ))}
      </IntoSidebarPanelExtensionPanelSlot>
      <IntoSidebarPanelExtensionPanelSlot panelId="secondary">
        <GenericPanelBody
          configuration={activeConfiguration}
          panelId="secondary"
        />
      </IntoSidebarPanelExtensionPanelSlot>
      <IntoSidebarPanelExtensionPanelSlot panelId="tertiary">
        <GenericPanelBody
          configuration={activeConfiguration}
          panelId="tertiary"
        />
      </IntoSidebarPanelExtensionPanelSlot>
    </>
  )
}

const PanelsContent = () => {
  const [isPanelOpen, setIsPanelOpen] = React.useState(true)

  const handleClosePanel = React.useCallback(() => {
    setIsPanelOpen(false)
  }, [])

  const handlePanelReopen = React.useCallback(() => {
    setIsPanelOpen(true)
  }, [])

  return (
    <Box
      data-testid="ui-baseline-panels-content"
      sx={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      <Box sx={PANEL_CONTROL_BOX_SX}>
        <Box sx={PANEL_CONTROL_ROW_SX}>
          <Button
            data-testid="ui-baseline-panels-close"
            size="small"
            variant="outlined"
            onClick={handleClosePanel}
          >
            Close panel
          </Button>
          <Button
            data-testid="ui-baseline-panels-reopen"
            size="small"
            variant="outlined"
            onClick={handlePanelReopen}
          >
            Reopen panel
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          px: '0.5rem',
          py: '0.25rem',
          border: '1px solid #e4e4e4',
          borderRadius: '0.625rem',
          backgroundColor: '#f9f9f9',
          color: '#111111',
          fontSize: '0.875rem',
          lineHeight: 1.35,
        }}
      >
        Generic panel configurations expose the shared sidebar panel, page,
        control, and tab defaults.
      </Box>

      <SidebarPanelExtensionProvider
        id={PANEL_EXTENSION_ID}
        enabled={isPanelOpen}
        initialRuntimeOptions={INITIAL_RUNTIME_OPTIONS}
      >
        <GenericPanelConfigurations onClose={handleClosePanel} />
      </SidebarPanelExtensionProvider>
    </Box>
  )
}

export default PanelsContent
