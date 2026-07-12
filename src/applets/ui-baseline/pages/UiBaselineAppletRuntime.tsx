import React from 'react'

import AppletWrapper from '#/components/common/AppletWrapper'

import { UI_BASELINE_NAMESPACE } from '../common/categories'
import { uiBaselineListedLayerGroups } from '../common/listedLayerGroups'

const HELSINKI_DEFAULT_VIEW = {
  center: [24.9384, 60.1699] as [number, number],
  zoom: 12,
  duration: 0,
}

const UiBaselineAppletRuntime = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <AppletWrapper
      mapContext="ui-baseline"
      localizationNamespace={UI_BASELINE_NAMESPACE}
      subPath={UI_BASELINE_NAMESPACE}
      isNavbarHidden={true}
      defaultView={HELSINKI_DEFAULT_VIEW}
      listedLayerGroups={uiBaselineListedLayerGroups}
      resetListedLayerVisibility
      sidebarHeaderTitle="UI Baseline"
      sx={{
        pt: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </AppletWrapper>
  )
}

export default UiBaselineAppletRuntime
