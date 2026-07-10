import React from 'react'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import { useTranslate } from '@tolgee/react'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import {
  Box,
  type AppSxProps,
  type AppTheme,
  toSxArray,
} from '#/common/style/theme'
import type { SelectOption } from '#/common/types/general'
import { ButtonBase, IconButton } from '#/components/common/Button'
import type { DropDownValueChangeEvent } from '#/components/common/DropDownSelect'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import TText from '#/components/common/TText'
import { SidebarPanelExtensionPageContainer } from '#/components/Sidebar/SidebarPanelExtensionPageContainer'
import { SidebarPanelExtensionTabContainer } from '#/components/Sidebar/SidebarPanelExtensionTabContainer'
import {
  SidebarPanelExtensionTooltip as BuildingInfoTooltip,
  type SidebarPanelExtensionTooltipSide as BuildingInfoTooltipSide,
  type SidebarPanelExtensionTooltipTriggerProps as BuildingInfoTooltipTriggerProps,
} from '#/components/Sidebar/SidebarPanelExtensionTooltip'
import { useNullableSidebarPanelExtensionTabsContext } from '#/components/Sidebar/SidebarPanelExtensionTabsContext'
import type {
  EnergymapBuildingInfoConsumptionControls,
  EnergymapBuildingInfoEnergySubmetricId,
  EnergymapEnergyMeasure,
  EnergymapBuildingInfoMetric,
  EnergymapBuildingInfoMetricValue,
  EnergymapBuildingInfoNote,
  EnergymapBuildingInfoPanel,
  EnergymapBuildingInfoPanelId,
  EnergymapBuildingInfoRow,
  EnergymapBuildingInfoScenario,
  EnergymapBuildingInfoSection,
  EnergymapBuildingInfoText,
  EnergymapBuildingInfoValue,
  EnergymapBuildingInfoValueStatus,
  EnergymapBuildingInfoPrimaryMetric,
  EnergymapBuildingInfoPrimaryMetricId,
} from '../common/buildingInfo'
import { getSelectedEnergyConsumption } from '../common/buildingInfo'

export type BuildingInfoDesktopMode = 'twoPanel' | 'threePanel'
export type BuildingInfoTabId = 'basic' | 'renovation'

type BuildingInfoActionLabels = {
  close: string
  collapse: string
  overview: string
  renovation: string
}

type BuildingInfoTabPagesProps = {
  panels: EnergymapBuildingInfoPanel[]
  ariaLabels: BuildingInfoActionLabels
  activeTabId?: BuildingInfoTabId
  forceMobileLayout?: boolean
  isDesktopFullscreenLayout?: boolean
  onActiveTabChange?: (tabId: BuildingInfoTabId) => void
  onClose: () => void
  onCollapse: (tabId: BuildingInfoTabId) => void
}

type BuildingInfoActionRailProps = {
  activeMode: BuildingInfoDesktopMode
  isCollapsed: boolean
  orientation?: 'row' | 'column'
  ariaLabels: Pick<BuildingInfoActionLabels, 'overview' | 'renovation'>
  onModeChange: (mode: BuildingInfoDesktopMode) => void
}

type BuildingInfoInlineTooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'color'
> & {
  ref?: React.Ref<HTMLElement>
}

const PANEL_IDS_BY_MODE: Record<
  BuildingInfoDesktopMode,
  EnergymapBuildingInfoPanelId[]
> = {
  twoPanel: ['energyConsumption', 'buildingDetails'],
  threePanel: [
    'energyConsumption',
    'renovationRecommendations',
    'buildingDetails',
  ],
}

const PANEL_IDS_BY_TAB_ID: Record<
  BuildingInfoTabId,
  EnergymapBuildingInfoPanelId[]
> = {
  basic: PANEL_IDS_BY_MODE.twoPanel,
  renovation: PANEL_IDS_BY_MODE.threePanel,
}

const TAB_ID_BY_MODE: Record<BuildingInfoDesktopMode, BuildingInfoTabId> = {
  twoPanel: 'basic',
  threePanel: 'renovation',
}

const MODE_BY_TAB_ID: Record<BuildingInfoTabId, BuildingInfoDesktopMode> = {
  basic: 'twoPanel',
  renovation: 'threePanel',
}

const STATUS_SX = {
  real: {
    color: '#111111',
  },
  estimate: {
    color: '#075cff',
  },
  missing: {
    color: '#767676',
    fontStyle: 'italic',
  },
  placeholder: {
    color: '#5f5f5f',
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: '#a347ff',
    textUnderlineOffset: '0.18em',
  },
} as const satisfies Record<EnergymapBuildingInfoValueStatus, object>

const PANEL_ACCENTS: Record<EnergymapBuildingInfoPanelId, string> = {
  energyConsumption: '#075cff',
  renovationRecommendations: '#a347ff',
  buildingDetails: '#075cff',
}

const PANEL_BACKGROUNDS: Record<EnergymapBuildingInfoPanelId, string> = {
  energyConsumption: '#fefdfd',
  renovationRecommendations: '#fafafa',
  buildingDetails: '#f4f4f4',
}

const RENOVATION_EFFECTIVENESS_BACKGROUND = '#f0f0f0'

const PANEL_CONTENT_WIDTHS: Record<EnergymapBuildingInfoPanelId, string> = {
  energyConsumption: '17.625rem',
  renovationRecommendations: '26.875rem',
  buildingDetails: '17.625rem',
}

const DESKTOP_GRID_MAX_WIDTHS: Record<BuildingInfoTabId, string> = {
  basic: '760px',
  renovation: '1440px',
}

const DESKTOP_GRID_MIN_HEIGHTS: Record<BuildingInfoTabId, string> = {
  basic: '1256px',
  renovation: '2365px',
}

const DESKTOP_GRID_SECTION_MIN_HEIGHTS = {
  basic: '1256px',
  renovationTop: '1300px',
  renovationBottom: '1065px',
} as const

const RENOVATION_DESKTOP_GRID_COLUMNS = '440fr 560fr 440fr'
const BASIC_DESKTOP_GRID_COLUMNS = 'minmax(0, 1fr) minmax(0, 1fr)'
const DESKTOP_HEADING_TOP = '7.375rem'
const DESKTOP_SECTION_BOTTOM_PADDING = '6.5rem'
const DESKTOP_HEADING_GRAPHIC_TOP = '-4.25rem'
const DESKTOP_HEADING_DIVIDER_MARGIN_TOP = '0.75rem'
const UNAVAILABLE_VALUE_ICON_COLOR = '#9E9E9E'

const SIDEBAR_ASSET_BASE = '/files/img/energiakartta/sidebar'

const BUILDING_INFO_ASSETS = {
  energyLightning: `${SIDEBAR_ASSET_BASE}/building-info-energy-lightning.svg`,
  renovationIconCenter: `${SIDEBAR_ASSET_BASE}/building-info-renovation-icon-center.svg`,
  renovationIconArcLower: `${SIDEBAR_ASSET_BASE}/building-info-renovation-icon-arc-lower.svg`,
  renovationIconArcUpper: `${SIDEBAR_ASSET_BASE}/building-info-renovation-icon-arc-upper.svg`,
  renovationBuilding: `${SIDEBAR_ASSET_BASE}/building-info-renovation-building.svg`,
  renovationBuildingSmallA: `${SIDEBAR_ASSET_BASE}/building-info-renovation-building-small-a.svg`,
  renovationBuildingSmallB: `${SIDEBAR_ASSET_BASE}/building-info-renovation-building-small-b.svg`,
  warningBase: `${SIDEBAR_ASSET_BASE}/building-info-warning-base.svg`,
  warningLine: `${SIDEBAR_ASSET_BASE}/building-info-warning-line.svg`,
  warningDot: `${SIDEBAR_ASSET_BASE}/building-info-warning-dot.svg`,
} as const

const BUILDING_INFO_GRAPHIC_DIMENSIONS = {
  renovationBuilding: {
    width: 238.82421875,
    height: 300.0000305175781,
  },
  renovationBuildingSmallA: {
    width: 109.861328125,
    height: 138.0028076171875,
  },
  renovationBuildingSmallB: {
    width: 114.9908218383789,
    height: 138.00025939941406,
  },
} as const

type BuildingInfoGraphicDimensions =
  (typeof BUILDING_INFO_GRAPHIC_DIMENSIONS)[
    keyof typeof BUILDING_INFO_GRAPHIC_DIMENSIONS
  ]

const RENOVATION_SCENARIO_GRAPHICS: Partial<
  Record<
    EnergymapEnergyMeasure,
    {
      src: string
      dimensions: BuildingInfoGraphicDimensions
      testId: string
    }
  >
> = {
  aahp: {
    src: BUILDING_INFO_ASSETS.renovationBuildingSmallA,
    dimensions: BUILDING_INFO_GRAPHIC_DIMENSIONS.renovationBuildingSmallA,
    testId: 'building-info-graphic-renovation-building-small-a',
  },
  solar: {
    src: BUILDING_INFO_ASSETS.renovationBuildingSmallB,
    dimensions: BUILDING_INFO_GRAPHIC_DIMENSIONS.renovationBuildingSmallB,
    testId: 'building-info-graphic-renovation-building-small-b',
  },
  windows: {
    src: BUILDING_INFO_ASSETS.renovationBuildingSmallA,
    dimensions: BUILDING_INFO_GRAPHIC_DIMENSIONS.renovationBuildingSmallA,
    testId: 'building-info-graphic-renovation-building-small-a',
  },
}

const BUILDING_INFO_ACTION_BUTTON_SIZE_PX = 45
const BUILDING_INFO_ACTION_BUTTON_GAP_PX = 10

const textSx = {
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
} as const

const energyControlTextSx = {
  fontSize: '0.5625rem',
  fontWeight: 700,
  lineHeight: '0.875rem',
  letterSpacing: 0,
} as const

const ENERGY_PRIMARY_METRIC_ORDER: readonly EnergymapBuildingInfoPrimaryMetricId[] =
  ['energy', 'water', 'cost', 'co2']

const ENERGY_SUBMETRIC_ORDER: readonly EnergymapBuildingInfoEnergySubmetricId[] =
  ['electricity', 'heating', 'waterHeating']

const actionButtonSx = ({
  active,
}: {
  active: boolean
}) => ({
  width: `${BUILDING_INFO_ACTION_BUTTON_SIZE_PX}px`,
  height: `${BUILDING_INFO_ACTION_BUTTON_SIZE_PX}px`,
  minWidth: `${BUILDING_INFO_ACTION_BUTTON_SIZE_PX}px`,
  borderRadius: '10px',
  backgroundColor: active ? '#e8d0ff' : '#f4f4f4',
  color: '#111111',
  boxShadow: active
    ? '0px 1px 2px rgba(0, 0, 0, 0.2)'
    : '0px 1px 2px rgba(0, 0, 0, 0.12)',
  '&:hover': {
    backgroundColor: active ? '#dec0fb' : '#ffffff',
  },
})

const getSourcePropertiesData = (sourceProperties?: string[]) =>
  sourceProperties == null || sourceProperties.length === 0
    ? undefined
    : sourceProperties.join(',')

const isUnavailableValueStatus = (
  status: EnergymapBuildingInfoValueStatus
) => status === 'missing' || status === 'placeholder'

const VISUALLY_HIDDEN_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

const getBuildingInfoTooltipArrowSx = (
  side: BuildingInfoTooltipSide
): AppSxProps => {
  if (side === 'right') {
    return { left: -4, top: 'calc(50% - 4px)' }
  }

  if (side === 'left') {
    return { right: -4, top: 'calc(50% - 4px)' }
  }

  if (side === 'bottom') {
    return { top: -4, left: 'calc(50% - 4px)' }
  }

  return { bottom: -4, left: 'calc(50% - 4px)' }
}

const BuildingInfoInlineTooltip = ({
  title,
  side = 'top',
  children,
}: {
  title: React.ReactNode
  side?: BuildingInfoTooltipSide
  children: (
    props: BuildingInfoInlineTooltipTriggerProps
  ) => React.ReactElement
}) => (
  <BaseTooltip.Root>
    <BaseTooltip.Trigger
      delay={0}
      closeDelay={0}
      render={(triggerProps) => {
        const {
          color: ignoredColor,
          type: ignoredType,
          ...resolvedTriggerProps
        } = triggerProps as BuildingInfoInlineTooltipTriggerProps & {
          color?: string
          type?: string
        }
        void ignoredColor
        void ignoredType

        return children(resolvedTriggerProps)
      }}
    />
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner
        side={side}
        sideOffset={8}
        style={{ zIndex: 1500, pointerEvents: 'none' }}
      >
        <BaseTooltip.Popup
          style={{ position: 'relative', pointerEvents: 'none' }}
          render={(popupProps) => (
            <Box
              {...popupProps}
              role="tooltip"
              sx={{
                maxWidth: 240,
                px: 1,
                py: 0.75,
                borderRadius: '5px',
                backgroundColor: '#111111',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 400,
                lineHeight: 1.35,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
              }}
            >
              {title}
              <BaseTooltip.Arrow
                render={(arrowProps) => (
                  <Box
                    {...arrowProps}
                    sx={{
                      position: 'absolute',
                      width: 8,
                      height: 8,
                      backgroundColor: '#111111',
                      transform: 'rotate(45deg)',
                      ...getBuildingInfoTooltipArrowSx(side),
                    }}
                  />
                )}
              />
            </Box>
          )}
        />
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  </BaseTooltip.Root>
)

const isPlainEnergyClassText = (text: EnergymapBuildingInfoText) =>
  text.type === 'plain' && /^[A-G]$/i.test(text.text.trim())

const BuildingInfoDecorativeImage = ({
  src,
  width,
  height,
  sx,
}: {
  src: string
  width: string
  height: string
  sx?: AppSxProps
}) => (
  <Box
    component="span"
    aria-hidden="true"
    sx={[
      {
        display: 'block',
        width,
        height,
        flexShrink: 0,
      },
      ...toSxArray(sx),
    ]}
  >
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  </Box>
)

const getFigmaDimensionData = (dimension: number) =>
  Number(dimension.toFixed(3)).toString()

const getFigmaDimensionCss = (dimension: number) =>
  `${getFigmaDimensionData(dimension)}px`

const BuildingInfoFigmaGraphic = ({
  src,
  dimensions,
  maxWidth = '100%',
  testId,
  sx,
}: {
  src: string
  dimensions: BuildingInfoGraphicDimensions
  maxWidth?: string
  testId: string
  sx?: AppSxProps
}) => (
  <Box
    aria-hidden="true"
    data-testid={testId}
    data-figma-width={getFigmaDimensionData(dimensions.width)}
    data-figma-height={getFigmaDimensionData(dimensions.height)}
    sx={[
      {
        position: 'relative',
        display: 'block',
        width: `min(${getFigmaDimensionCss(dimensions.width)}, ${maxWidth})`,
        aspectRatio: `${dimensions.width} / ${dimensions.height}`,
        flexShrink: 0,
      },
      ...toSxArray(sx),
    ]}
  >
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        width: '100%',
        height: '100%',
      }}
    />
  </Box>
)

const RenovationIcon = ({
  width = '32px',
  height = '26px',
  sx,
}: {
  width?: string
  height?: string
  sx?: AppSxProps
}) => (
  <Box
    aria-hidden="true"
    sx={[
      {
        position: 'relative',
        width,
        height,
        flexShrink: 0,
      },
      ...toSxArray(sx),
    ]}
  >
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.renovationIconCenter}
      width="33.55%"
      height="61.23%"
      sx={{
        position: 'absolute',
        top: '19.4%',
        left: '34.84%',
      }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.renovationIconArcLower}
      width="90.32%"
      height="44%"
      sx={{
        position: 'absolute',
        left: 0,
        bottom: 0,
      }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.renovationIconArcUpper}
      width="90.32%"
      height="44%"
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        transform: 'rotate(180deg)',
      }}
    />
  </Box>
)

const WarningIcon = () => (
  <Box
    aria-hidden="true"
    sx={{
      position: 'relative',
      width: '14.04px',
      height: '12.96px',
      flex: '0 0 auto',
      mt: '0.125rem',
    }}
  >
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.warningBase}
      width="100%"
      height="100%"
      sx={{ position: 'absolute', inset: 0 }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.warningLine}
      width="1px"
      height="6px"
      sx={{
        position: 'absolute',
        top: '30.54%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.warningDot}
      width="1px"
      height="1px"
      sx={{
        position: 'absolute',
        left: '50%',
        bottom: '11.57%',
        transform: 'translateX(-50%)',
      }}
    />
  </Box>
)

const BuildingInfoSvgIcon = ({
  children,
  sx,
  testId,
  viewBox = '0 0 24 24',
}: {
  children: React.ReactNode
  sx?: AppSxProps
  testId?: string
  viewBox?: string
}) => (
  <Box
    component="span"
    aria-hidden="true"
    data-testid={testId}
    sx={[
      {
        display: 'block',
        width: '1em',
        height: '1em',
        flexShrink: 0,
        color: 'currentColor',
        overflow: 'visible',
      },
      ...toSxArray(sx),
    ]}
  >
    <svg
      viewBox={viewBox}
      focusable="false"
      aria-hidden="true"
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        fill: 'currentColor',
        overflow: 'visible',
      }}
    >
      {children}
    </svg>
  </Box>
)

const EnergyBoltIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon sx={sx} testId="building-info-icon-energy">
    <path d="M13.25 2 4.75 13.25h5.45L8.95 22l10.3-13.15h-5.8L13.25 2Z" />
  </BuildingInfoSvgIcon>
)

const WaterMetricIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon sx={sx} testId="building-info-icon-water">
    <path d="M12 2.75c3.65 4.3 6 7.55 6 10.55A6 6 0 0 1 6 13.3c0-3 2.35-6.25 6-10.55Zm-3.25 10.6a3.25 3.25 0 0 0 4.4 3.05c.45-.18.52-.8.12-1.06-1.54-.96-2.5-2.2-2.88-3.73-.12-.5-.78-.62-1.08-.2-.36.52-.56 1.18-.56 1.94Z" />
  </BuildingInfoSvgIcon>
)

const EuroMetricIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon sx={sx} testId="building-info-icon-cost">
    <path d="M15.7 5.45c-2.75-1.35-5.9.05-6.95 2.85h5.65l-.55 1.65H8.35a8.2 8.2 0 0 0 0 1.6h4.95l-.55 1.65h-4c1.02 2.82 4.2 4.22 6.95 2.87l.62 1.78c-4.04 1.78-8.58-.55-9.62-4.65H4.55l.55-1.65h1.32a8.2 8.2 0 0 1 0-1.6H4.55L5.1 8.3h1.6c1.04-4.1 5.58-6.43 9.62-4.65l-.62 1.8Z" />
  </BuildingInfoSvgIcon>
)

const Co2MetricIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon sx={sx} testId="building-info-icon-co2">
    <text
      x="2.5"
      y="15.4"
      fill="currentColor"
      fontFamily="Arial, sans-serif"
      fontSize="9.3"
      fontWeight="700"
      textLength="13.4"
      lengthAdjust="spacingAndGlyphs"
    >
      CO
    </text>
    <text
      x="16.3"
      y="18.2"
      fill="currentColor"
      fontFamily="Arial, sans-serif"
      fontSize="6.2"
      fontWeight="700"
    >
      2
    </text>
  </BuildingInfoSvgIcon>
)

const HeatingMetricIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon sx={sx} testId="building-info-icon-heating">
    <path d="M12.25 2.5c.2 2.72-.7 4.58-2.1 6.18-.9 1.02-1.5 1.9-1.5 3.17 0 1.05.5 1.92 1.28 2.45-.14-1.55.62-2.8 1.62-3.82.72-.72 1.2-1.5 1.28-2.7 2.1 1.48 3.42 3.48 3.42 5.96A5.2 5.2 0 0 1 11.02 19C7.75 19 5.5 16.7 5.5 13.88c0-2.45 1.32-4.02 2.68-5.6 1.25-1.45 2.48-3.02 2.38-5.47l1.69-.31Z" />
  </BuildingInfoSvgIcon>
)

const WaterHeatingMetricIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon sx={sx} testId="building-info-icon-water-heating">
    <path d="M12 3.2c3 3.52 4.82 6.2 4.82 8.62a4.82 4.82 0 1 1-9.64 0C7.18 9.4 9 6.72 12 3.2Z" />
    <path
      d="M9.2 17.95c2.32-.55 3.55-1.62 3.55-3.15 0-.77-.35-1.35-.82-1.92-.46-.55-.98-1.12-.98-1.88 1.8.78 3.08 2.2 3.08 3.88 0 1.98-1.83 3.1-4.83 3.07Z"
      fill="#ffffff"
      opacity="0.75"
    />
  </BuildingInfoSvgIcon>
)

const ConstructionUnavailableIcon = ({ sx }: { sx?: AppSxProps }) => (
  <BuildingInfoSvgIcon
    sx={sx}
    testId="building-info-unavailable-value-icon"
  >
    <path d="M4.5 19.5h15v-2h-15v2Zm1.2-3.2h12.6l-1.45-7.55A3.88 3.88 0 0 0 13 5.5h-2a3.88 3.88 0 0 0-3.85 3.25L5.7 16.3Zm4.05-8.15h4.5l.55 2.85h-5.6l.55-2.85Zm-.9 4.45h6.3l.7 3.7h-7.7l.7-3.7Z" />
  </BuildingInfoSvgIcon>
)

const EnergyPrimaryMetricIcon = ({
  metricId,
  active,
}: {
  metricId: EnergymapBuildingInfoPrimaryMetricId
  active: boolean
}) => {
  const iconSx = {
    fontSize:
      metricId === 'co2' ? (active ? '1.4rem' : '1.25rem') : '0.8125rem',
    color: active ? '#ffffff' : '#111111',
  } as const

  if (metricId === 'water') {
    return <WaterMetricIcon sx={iconSx} />
  }

  if (metricId === 'cost') {
    return <EuroMetricIcon sx={iconSx} />
  }

  if (metricId === 'co2') {
    return <Co2MetricIcon sx={iconSx} />
  }

  return <EnergyBoltIcon sx={iconSx} />
}

const EnergySubmetricIcon = ({
  submetricId,
  selected,
}: {
  submetricId: EnergymapBuildingInfoEnergySubmetricId
  selected: boolean
}) => {
  const iconSx = {
    fontSize: submetricId === 'heating' ? '0.875rem' : '0.75rem',
    color: selected ? '#ffffff' : '#075cff',
  } as const

  if (submetricId === 'heating') {
    return <HeatingMetricIcon sx={iconSx} />
  }

  if (submetricId === 'waterHeating') {
    return <WaterHeatingMetricIcon sx={iconSx} />
  }

  return <EnergyBoltIcon sx={iconSx} />
}

const areEnergySubmetricIdsEqual = (
  first: readonly EnergymapBuildingInfoEnergySubmetricId[],
  second: readonly EnergymapBuildingInfoEnergySubmetricId[]
) =>
  first.length === second.length &&
  first.every((submetricId, index) => submetricId === second[index])

const getDefaultEnergyYear = (
  controls: EnergymapBuildingInfoConsumptionControls
) => controls.yearOptions[0]?.value ?? ''

const getNormalizedPrimaryMetricId = (
  controls: EnergymapBuildingInfoConsumptionControls,
  current: EnergymapBuildingInfoPrimaryMetricId
) => {
  const validPrimaryMetricIds = new Set(
    controls.primaryMetrics.map((metric) => metric.id)
  )

  return validPrimaryMetricIds.has(current)
    ? current
    : controls.defaultPrimaryMetricId
}

const getNormalizedEnergySubmetricIds = (
  controls: EnergymapBuildingInfoConsumptionControls,
  current: readonly EnergymapBuildingInfoEnergySubmetricId[]
) => {
  const validSubmetricIds = new Set(
    controls.energySubmetrics.map((submetric) => submetric.id)
  )
  const next = current.filter((id) => validSubmetricIds.has(id))

  return areEnergySubmetricIdsEqual(current, next) ? current : next
}

const getNormalizedEnergyYear = (
  controls: EnergymapBuildingInfoConsumptionControls,
  current: string
) =>
  controls.yearOptions.some((option) => option.value === current)
    ? current
    : getDefaultEnergyYear(controls)

const getConsumptionControlsStateKey = (
  controls: EnergymapBuildingInfoConsumptionControls
) =>
  [
    controls.defaultPrimaryMetricId,
    controls.primaryMetrics.map((metric) => metric.id).join(','),
    controls.defaultEnergySubmetricIds.join(','),
    controls.energySubmetrics.map((submetric) => submetric.id).join(','),
    controls.yearOptions.map((option) => option.value).join(','),
  ].join('|')

export const BuildingInfoText = ({
  text,
}: {
  text: EnergymapBuildingInfoText
}) => {
  if (text.type === 'plain') {
    return <>{text.text}</>
  }

  if (text.type === 'translation') {
    return (
      <TText
        keyName={text.keyName}
        ns="energiakartta"
        params={text.params}
      />
    )
  }

  return (
    <>
      {text.parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 ? text.separator : null}
          <BuildingInfoText text={part} />
        </React.Fragment>
      ))}
    </>
  )
}

const BuildingInfoValueText = ({
  value,
  align = 'right',
  variant = 'default',
}: {
  value: EnergymapBuildingInfoValue
  align?: 'left' | 'right'
  variant?: 'default' | 'energyClassBadge'
}) => {
  const isUnavailable = isUnavailableValueStatus(value.status)
  const shouldRenderEnergyClassBadge =
    variant === 'energyClassBadge' &&
    value.status === 'real' &&
    isPlainEnergyClassText(value.text)

  return (
    <Box
      component="span"
      data-status={value.status}
      data-source-properties={getSourcePropertiesData(value.sourceProperties)}
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: shouldRenderEnergyClassBadge ? 'center' : 'baseline',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: '0.25rem',
        minWidth: 0,
        maxWidth: '100%',
        fontWeight: 700,
        textAlign: align,
        wordBreak: 'break-word',
        ...STATUS_SX[value.status],
        ...(isUnavailable && {
          alignItems: 'center',
          color: '#5f5f5f',
          fontStyle: 'normal',
          textDecoration: 'none',
        }),
      }}
    >
      {isUnavailable ? (
        <BuildingInfoInlineTooltip
          side="top"
          title={
            <Box component="span">
              <BuildingInfoText text={value.text} />
            </Box>
          }
        >
          {(triggerProps) => (
            <Box
              {...triggerProps}
              component="span"
              tabIndex={0}
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.25rem',
                height: '1.25rem',
                borderRadius: '50%',
                color: '#5f5f5f',
                cursor: 'help',
                outline: 'none',
                '&:focus-visible': {
                  outline: '2px solid #111111',
                  outlineOffset: '2px',
                },
              }}
            >
              <ConstructionUnavailableIcon
                sx={{
                  color: UNAVAILABLE_VALUE_ICON_COLOR,
                  fontSize: '1rem',
                }}
              />
              <Box
                component="span"
                data-testid="building-info-unavailable-value-reason"
                style={VISUALLY_HIDDEN_STYLE}
              >
                <BuildingInfoText text={value.text} />
              </Box>
            </Box>
          )}
        </BuildingInfoInlineTooltip>
      ) : shouldRenderEnergyClassBadge ? (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '1.625rem',
            height: '1.625rem',
            borderRadius: '50%',
            border: '1.2px solid #8bd600',
            backgroundColor: '#f4ffe6',
            color: '#111111',
            fontSize: '0.75rem',
            lineHeight: 1,
            letterSpacing: '0.1em',
          }}
        >
          <BuildingInfoText text={value.text} />
        </Box>
      ) : (
        <BuildingInfoText text={value.text} />
      )}
      {value.unitKey != null && (
        <Box
          component="span"
          sx={{
            fontSize: '0.625rem',
            fontWeight: 400,
            lineHeight: '1.125rem',
          }}
        >
          <TText keyName={value.unitKey} ns="energiakartta" />
        </Box>
      )}
    </Box>
  )
}

const BuildingInfoNoteText = ({
  note,
}: {
  note: Pick<
    EnergymapBuildingInfoNote,
    'text' | 'status' | 'sourceProperties'
  >
}) => {
  const showWarningIcon = note.status === 'placeholder'

  return (
    <Box
      data-status={note.status}
      data-source-properties={getSourcePropertiesData(note.sourceProperties)}
      sx={{
        mt: '0.5rem',
        display: showWarningIcon ? 'flex' : 'block',
        alignItems: 'flex-start',
        gap: '0.5625rem',
        maxWidth: '100%',
        ...STATUS_SX[note.status],
      }}
    >
      {showWarningIcon && <WarningIcon />}
      <Box
        sx={{
          ...textSx,
          maxWidth: '100%',
          ...STATUS_SX[note.status],
          ...(showWarningIcon && {
            color: '#111111',
            fontStyle: 'normal',
            textDecoration: 'none',
          }),
        }}
      >
        <BuildingInfoText text={note.text} />
      </Box>
    </Box>
  )
}

const BuildingInfoRow = ({ row }: { row: EnergymapBuildingInfoRow }) => (
  <Box
    data-row-id={row.id}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      columnGap: '1rem',
      borderTop: '0.3px solid #cfcfcf',
      py: '0.875rem',
    }}
  >
    <Box
      sx={{
        ...textSx,
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
    </Box>
    <Box
      component="div"
      sx={{
        ...textSx,
        minWidth: 0,
        textAlign: 'right',
      }}
    >
      <BuildingInfoValueText
        value={row}
        variant={row.id === 'energyClass' ? 'energyClassBadge' : 'default'}
      />
      {row.note != null && (
        <BuildingInfoNoteText
          note={{
            text: row.note,
            status: row.status,
            sourceProperties: row.sourceProperties,
          }}
        />
      )}
    </Box>
  </Box>
)

const BuildingInfoSectionDivider = () => (
  <Box
    sx={{
      borderTop: '0.3px solid #cfcfcf',
    }}
  />
)

const BuildingInfoStackedValue = ({
  row,
}: {
  row: EnergymapBuildingInfoRow
}) => (
  <Box
    data-building-subheader-row-id={row.id}
    sx={{
      mt: '1rem',
    }}
  >
    <Box
      sx={{
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
      :
    </Box>
    <Box
      component="div"
      sx={{
        fontSize: '0.75rem',
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: '#111111',
      }}
    >
      <BuildingInfoValueText value={row} align="left" />
    </Box>
  </Box>
)

const BuildingInfoSectionLine = ({
  row,
  valueVariant = 'default',
}: {
  row: EnergymapBuildingInfoRow
  valueVariant?: 'default' | 'energyClassBadge'
}) => (
  <Box
    data-section-row-id={row.id}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
      columnGap: '1rem',
      alignItems: 'start',
      minWidth: 0,
    }}
  >
    <Box
      sx={{
        ...textSx,
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
    </Box>
    <Box
      component="div"
      sx={{
        ...textSx,
        minWidth: 0,
        textAlign: 'right',
      }}
    >
      <BuildingInfoValueText value={row} variant={valueVariant} />
    </Box>
  </Box>
)

const BuildingInfoBuildingSubheaderSection = ({
  section,
}: {
  section: EnergymapBuildingInfoSection
}) => {
  const addressRow = section.rows?.[0]

  if (addressRow == null) {
    return null
  }

  return (
    <Box
      data-section-id={section.id}
      sx={{
        mt: '1rem',
        mb: '1.75rem',
      }}
    >
      <BuildingInfoStackedValue row={addressRow} />
    </Box>
  )
}

const BuildingInfoEnergyCertificateSection = ({
  section,
}: {
  section: EnergymapBuildingInfoSection
}) => {
  const energyClassRow = section.rows?.find((row) => row.id === 'energyClass')
  const validityRow = section.rows?.find(
    (row) => row.id === 'energyCertificateValidity'
  )
  const rows = [energyClassRow, validityRow].filter(
    (row): row is EnergymapBuildingInfoRow => row != null
  )

  if (rows.length === 0) {
    return null
  }

  return (
    <Box
      data-section-id={section.id}
      sx={{
        mt: '1.75rem',
      }}
    >
      <BuildingInfoSectionDivider />
      <Box
        sx={{
          py: '0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {rows.map((row) => (
          <BuildingInfoSectionLine
            key={row.id}
            row={row}
            valueVariant={
              row.id === 'energyClass' ? 'energyClassBadge' : 'default'
            }
          />
        ))}
      </Box>
    </Box>
  )
}

const BuildingInfoPreviousEnergyClassSection = ({
  section,
}: {
  section: EnergymapBuildingInfoSection
}) => {
  const previousClassRow = section.rows?.find(
    (row) => row.id === 'previousEnergyClass'
  )
  const measuresRow = section.rows?.find(
    (row) => row.id === 'energyClassMeasures'
  )

  if (previousClassRow == null && measuresRow == null) {
    return null
  }

  return (
    <Box
      data-section-id={section.id}
      sx={{
        mt: '1.75rem',
      }}
    >
      <BuildingInfoSectionDivider />
      <Box sx={{ py: '0.875rem' }}>
        {previousClassRow != null && (
          <BuildingInfoSectionLine
            row={previousClassRow}
            valueVariant="energyClassBadge"
          />
        )}
        {measuresRow != null && (
          <Box
            data-section-row-id={measuresRow.id}
            sx={{
              mt: '1.375rem',
            }}
          >
            <Box
              sx={{
                ...textSx,
                color: '#111111',
              }}
            >
              <BuildingInfoText text={measuresRow.label} />
            </Box>
            <Box
              component="div"
              sx={{
                ...textSx,
                mt: '0.375rem',
                color: '#111111',
              }}
            >
              <BuildingInfoValueText value={measuresRow} align="left" />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

const BuildingInfoMeasureListSection = ({
  section,
}: {
  section: EnergymapBuildingInfoSection
}) => {
  const rows = section.rows ?? []

  if (rows.length === 0) {
    return null
  }

  return (
    <Box
      data-section-id={section.id}
      sx={{
        mt: '1.75rem',
      }}
    >
      <BuildingInfoSectionDivider />
      <Box sx={{ py: '0.875rem' }}>
        {rows.map((row) => (
          <Box key={row.id} data-section-row-id={row.id}>
            <Box
              sx={{
                ...textSx,
                color: '#111111',
              }}
            >
              <BuildingInfoText text={row.label} />
            </Box>
            <Box
              component="div"
              sx={{
                ...textSx,
                mt: '0.375rem',
                color: '#111111',
              }}
            >
              <BuildingInfoValueText value={row} align="left" />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const BuildingInfoMetricValueRow = ({
  value,
}: {
  value: EnergymapBuildingInfoMetricValue
}) => (
  <Box
    data-metric-value-id={value.id}
    sx={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
      columnGap: '0.75rem',
      alignItems: 'baseline',
      borderTop: '0.3px solid #d7d7d7',
      py: '0.625rem',
    }}
  >
    <Box sx={{ ...textSx, color: '#111111' }}>
      <BuildingInfoText text={value.label} />
    </Box>
    <Box component="div" sx={{ ...textSx, textAlign: 'right' }}>
      <BuildingInfoValueText value={value} />
    </Box>
  </Box>
)

const getPrimaryMetricButtonWidth = ({
  metricId,
  active,
}: {
  metricId: EnergymapBuildingInfoPrimaryMetricId
  active: boolean
}) => {
  if (active) {
    if (metricId === 'co2') {
      return '170px'
    }

    if (metricId === 'cost') {
      return '130px'
    }

    return metricId === 'energy' ? '140px' : '104px'
  }

  return metricId === 'co2' ? '42px' : '32px'
}

const BuildingInfoPrimaryMetricButton = ({
  metric,
  active,
  onClick,
}: {
  metric: EnergymapBuildingInfoPrimaryMetric
  active: boolean
  onClick: () => void
}) => {
  const { t } = useTranslate('energiakartta')
  const label = (
    <Box component="span">
      <BuildingInfoText text={metric.label} />
    </Box>
  )
  const renderButton = (triggerProps?: BuildingInfoTooltipTriggerProps) => (
    <ButtonBase
      {...triggerProps}
      component="button"
      type="button"
      aria-label={t(metric.ariaLabelKey)}
      aria-pressed={active}
      data-primary-metric-id={metric.id}
      onClick={onClick}
      sx={{
        width: getPrimaryMetricButtonWidth({ metricId: metric.id, active }),
        minWidth: getPrimaryMetricButtonWidth({ metricId: metric.id, active }),
        height: active ? '24px' : '20px',
        minHeight: active ? '24px' : '20px',
        px: active ? '0.625rem' : 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: active ? '0.5rem' : 0,
        borderRadius: active ? '15px' : '10px',
        border: active ? '0.5px solid #075cff' : 0,
        backgroundColor: active ? '#075cff' : '#f0f0f0',
        color: active ? '#ffffff' : '#111111',
        boxShadow: active
          ? '0 1px 4px rgba(2, 2, 2, 0.25)'
          : 'none',
        transition:
          'width 160ms ease, background-color 160ms ease, color 160ms ease',
        '&:hover': {
          backgroundColor: active ? '#075cff' : '#e8e8e8',
        },
        '&:focus-visible': {
          outline: '2px solid #111111',
          outlineOffset: '2px',
        },
      }}
    >
      <EnergyPrimaryMetricIcon metricId={metric.id} active={active} />
      {active && (
        <Box
          component="span"
          sx={{
            ...energyControlTextSx,
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Box>
      )}
    </ButtonBase>
  )

  if (active) {
    return renderButton()
  }

  return (
    <BuildingInfoTooltip title={label} side="top">
      {(triggerProps) => renderButton(triggerProps)}
    </BuildingInfoTooltip>
  )
}

const BuildingInfoEnergySubmetricButton = ({
  submetric,
  selected,
  onClick,
}: {
  submetric: NonNullable<
    EnergymapBuildingInfoSection['consumptionControls']
  >['energySubmetrics'][number]
  selected: boolean
  onClick: () => void
}) => {
  const { t } = useTranslate('energiakartta')

  return (
    <ButtonBase
      component="button"
      type="button"
      aria-label={t(submetric.ariaLabelKey)}
      aria-pressed={selected}
      data-energy-submetric-id={submetric.id}
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '0.5rem',
        width: 'fit-content',
        maxWidth: '100%',
        minHeight: '20px',
        p: 0,
        color: '#111111',
        textAlign: 'left',
        '&:focus-visible': {
          outline: '2px solid #111111',
          outlineOffset: '3px',
        },
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          minWidth: '28px',
          height: '20px',
          borderRadius: '10px',
          border: '0.5px solid #075cff',
          backgroundColor: selected ? '#075cff' : 'transparent',
          color: selected ? '#ffffff' : '#075cff',
        }}
      >
        <EnergySubmetricIcon submetricId={submetric.id} selected={selected} />
      </Box>
      <Box
        component="span"
        sx={{
          ...energyControlTextSx,
          color: '#111111',
          maxWidth: '12rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <BuildingInfoText text={submetric.label} />
      </Box>
    </ButtonBase>
  )
}

const BuildingInfoUnsupportedPrimaryMetricPanel = ({
  metric,
}: {
  metric: EnergymapBuildingInfoPrimaryMetric
}) => {
  if (metric.unavailableNote == null) {
    return null
  }

  return (
    <Box
      data-testid="building-info-unsupported-primary-metric"
      data-primary-metric-id={metric.id}
      sx={{
        mt: '1.5rem',
        borderTop: '0.3px solid #d7d7d7',
        pt: '0.75rem',
      }}
    >
      <BuildingInfoNoteText note={metric.unavailableNote} />
    </Box>
  )
}

const BuildingInfoEnergyConsumptionSection = ({
  section,
  accentColor,
}: {
  section: EnergymapBuildingInfoSection
  accentColor: string
}) => {
  const controls = section.consumptionControls

  if (controls == null) {
    return null
  }

  return (
    <BuildingInfoEnergyConsumptionSectionContent
      key={getConsumptionControlsStateKey(controls)}
      section={section}
      controls={controls}
      accentColor={accentColor}
    />
  )
}

const BuildingInfoEnergyConsumptionSectionContent = ({
  section,
  controls,
  accentColor,
}: {
  section: EnergymapBuildingInfoSection
  controls: EnergymapBuildingInfoConsumptionControls
  accentColor: string
}) => {
  const { t } = useTranslate('energiakartta')
  const [requestedPrimaryMetricId, setRequestedPrimaryMetricId] =
    React.useState<EnergymapBuildingInfoPrimaryMetricId>(
      controls?.defaultPrimaryMetricId ?? 'energy'
    )
  const [requestedEnergySubmetricIds, setRequestedEnergySubmetricIds] =
    React.useState<EnergymapBuildingInfoEnergySubmetricId[]>(
      controls?.defaultEnergySubmetricIds ?? []
    )
  const [requestedYear, setRequestedYear] = React.useState(
    controls?.yearOptions[0]?.value ?? ''
  )

  const activePrimaryMetricId = getNormalizedPrimaryMetricId(
    controls,
    requestedPrimaryMetricId
  )
  const selectedEnergySubmetricIds = getNormalizedEnergySubmetricIds(
    controls,
    requestedEnergySubmetricIds
  )
  const selectedYear = getNormalizedEnergyYear(controls, requestedYear)

  const primaryMetricById = new Map(
    controls.primaryMetrics.map((metric) => [metric.id, metric])
  )
  const sortedPrimaryMetrics = ENERGY_PRIMARY_METRIC_ORDER.map((metricId) =>
    primaryMetricById.get(metricId)
  ).filter(
    (metric): metric is EnergymapBuildingInfoPrimaryMetric => metric != null
  )
  const energySubmetricById = new Map(
    controls.energySubmetrics.map((submetric) => [submetric.id, submetric])
  )
  const sortedEnergySubmetrics = ENERGY_SUBMETRIC_ORDER.map((submetricId) =>
    energySubmetricById.get(submetricId)
  ).filter(
    (
      submetric
    ): submetric is NonNullable<
      EnergymapBuildingInfoSection['consumptionControls']
    >['energySubmetrics'][number] => submetric != null
  )
  const activePrimaryMetric =
    primaryMetricById.get(activePrimaryMetricId) ??
    primaryMetricById.get(controls.defaultPrimaryMetricId)
  const yearOptions: SelectOption[] = controls.yearOptions.map((option) => ({
    label: option.label,
    value: option.value,
  }))
  const selectedEnergyConsumption = getSelectedEnergyConsumption({
    controls,
    selectedSubmetricIds: selectedEnergySubmetricIds,
  })
  const selectedSubmetricIds = new Set(selectedEnergySubmetricIds)
  const unavailableNotes = [
    ...selectedEnergyConsumption.notes,
    ...(section.notes ?? []),
  ]
  const yearPlaceholder = (
    <Box
      component="span"
      data-status={controls.yearUnavailableValue.status}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        minWidth: 0,
        height: '0.875rem',
        px: '0.625rem',
        borderRadius: '999px',
        backgroundColor: '#dbdbdb',
        color: '#5f5f5f',
        fontSize: '0.625rem',
        fontWeight: 700,
        lineHeight: '0.875rem',
        letterSpacing: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      <TText
        keyName="sidebar.building_info.panels.energy.controls.year_unavailable"
        ns="energiakartta"
      />
    </Box>
  )

  const toggleEnergySubmetric = (
    submetricId: EnergymapBuildingInfoEnergySubmetricId
  ) => {
    setRequestedEnergySubmetricIds((current) => {
      const normalized = getNormalizedEnergySubmetricIds(controls, current)

      return normalized.includes(submetricId)
        ? normalized.filter((id) => id !== submetricId)
        : [...normalized, submetricId]
    })
  }

  const handleYearChange = (event: DropDownValueChangeEvent) => {
    setRequestedYear(
      event.target.value === '' && controls.yearOptions.length > 0
        ? getDefaultEnergyYear(controls)
        : event.target.value
    )
  }

  return (
    <Box
      data-section-id={section.id}
      data-testid="building-info-energy-consumption-section"
      sx={{
        mt: '2.25rem',
      }}
    >
      {section.title != null && (
        <Box
          sx={{
            ...textSx,
            mb: '1rem',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          <BuildingInfoText text={section.title} />
        </Box>
      )}
      <DropDownSelectInset
        value={selectedYear}
        options={yearOptions}
        disabled={yearOptions.length === 0}
        allowEmpty
        placeholder={yearPlaceholder}
        ariaLabel={t('sidebar.building_info.panels.energy.controls.year_aria_label')}
        label={
          <TText
            keyName="sidebar.building_info.panels.energy.metric.annual_total"
            ns="energiakartta"
          />
        }
        onChange={handleYearChange}
        sx={{
          mt: '1.125rem',
          maxWidth: '284px',
          gap: '0.875rem',
        }}
        selectWrapperSx={{
          width: '90px',
        }}
        selectSx={{
          height: '22px',
          backgroundColor: '#f0f0f0',
          '& [data-slot="value"]': {
            fontWeight: 700,
            letterSpacing: 0,
          },
          '&:disabled, &[aria-disabled="true"]': {
            opacity: 1,
          },
          '&:disabled fieldset, &[aria-disabled="true"] fieldset': {
            borderColor: '#dbdbdb',
          },
        }}
        labelSx={{
          textAlign: 'right',
          letterSpacing: 0,
        }}
      />
      <Box
        data-testid="building-info-primary-metric-row"
        sx={{
          mt: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          width: '284px',
          maxWidth: '100%',
          minHeight: '24px',
        }}
      >
        {sortedPrimaryMetrics.map((metric) => (
          <BuildingInfoPrimaryMetricButton
            key={metric.id}
            metric={metric}
            active={metric.id === activePrimaryMetricId}
            onClick={() => setRequestedPrimaryMetricId(metric.id)}
          />
        ))}
      </Box>
      {activePrimaryMetric?.id === 'energy' ? (
        <>
          <Box
            data-testid="building-info-energy-submetric-row"
            sx={{
              mt: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '1.25rem',
            }}
          >
            {sortedEnergySubmetrics.map((submetric) => (
              <BuildingInfoEnergySubmetricButton
                key={submetric.id}
                submetric={submetric}
                selected={selectedSubmetricIds.has(submetric.id)}
                onClick={() => toggleEnergySubmetric(submetric.id)}
              />
            ))}
          </Box>
          <Box
            data-testid="building-info-energy-consumption-values"
            sx={{
              mt: '1.5rem',
            }}
          >
            {selectedEnergyConsumption.values.map((value) => (
              <BuildingInfoMetricValueRow key={value.id} value={value} />
            ))}
          </Box>
          {unavailableNotes.map((note) => (
            <BuildingInfoNoteText key={note.id} note={note} />
          ))}
        </>
      ) : activePrimaryMetric != null ? (
        <BuildingInfoUnsupportedPrimaryMetricPanel
          metric={activePrimaryMetric}
        />
      ) : null}
    </Box>
  )
}

const BuildingInfoMetricBlock = ({
  metric,
  accentColor,
}: {
  metric: EnergymapBuildingInfoMetric
  accentColor: string
}) => (
  <Box
    data-metric-id={metric.id}
    sx={{
      mt: '1.5rem',
    }}
  >
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        minHeight: '1.5rem',
        px: '0.75rem',
        border: `0.5px solid ${accentColor}`,
        borderRadius: '15px',
        backgroundColor: metric.id === 'total' ? accentColor : 'transparent',
      }}
    >
      <Box
        sx={{
          fontSize: '0.5625rem',
          fontWeight: 400,
          lineHeight: '0.875rem',
          letterSpacing: '0.18em',
          color: metric.id === 'total' ? '#ffffff' : '#111111',
        }}
      >
        <BuildingInfoText text={metric.label} />
      </Box>
    </Box>
    <Box sx={{ mt: '0.75rem' }}>
      {metric.values.map((value) => (
        <BuildingInfoMetricValueRow key={value.id} value={value} />
      ))}
    </Box>
  </Box>
)

const BuildingInfoScenarioBlock = ({
  scenario,
}: {
  scenario: EnergymapBuildingInfoScenario
}) => {
  const savingsValue = scenario.values.find(
    (value) => value.id === 'savingsPercent'
  )
  const remainingValues = scenario.values.filter(
    (value) => value.id !== 'savingsPercent'
  )
  const graphic = RENOVATION_SCENARIO_GRAPHICS[scenario.id]

  return (
    <Box
      data-scenario-id={scenario.id}
      sx={{
        mt: '2rem',
        pt: '1.25rem',
        borderTop: '0.3px solid #cfcfcf',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              ...textSx,
              color: '#111111',
              fontWeight: 400,
            }}
          >
            <BuildingInfoText text={scenario.label} />
          </Box>
        </Box>
        {savingsValue != null && (
          <Box
            sx={{
              px: '0.75rem',
              py: '0.125rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(163, 71, 255, 0.1)',
              whiteSpace: 'nowrap',
            }}
          >
            <Box sx={{ ...textSx, color: '#a347ff' }}>
              <BuildingInfoValueText value={savingsValue} />
            </Box>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          mt: '1rem',
          display: 'flex',
          flexDirection: { mobile: 'column', desktop: 'row' },
          alignItems: { mobile: 'stretch', desktop: 'flex-start' },
          gap: { mobile: '1rem', desktop: '1.25rem' },
        }}
      >
        <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
          {remainingValues.map((value) => (
            <BuildingInfoMetricValueRow key={value.id} value={value} />
          ))}
        </Box>
        {graphic != null && (
          <BuildingInfoFigmaGraphic
            src={graphic.src}
            dimensions={graphic.dimensions}
            maxWidth="38vw"
            testId={graphic.testId}
            sx={{
              alignSelf: { mobile: 'center', desktop: 'flex-start' },
              mt: { mobile: '0.25rem', desktop: '-2.5rem' },
            }}
          />
        )}
      </Box>
    </Box>
  )
}

const BuildingInfoSectionBlock = ({
  section,
  accentColor,
}: {
  section: EnergymapBuildingInfoSection
  accentColor: string
}) => {
  const showComparisonIcon = section.id === 'scenarioComparison'

  if (section.variant === 'buildingSubheader') {
    return <BuildingInfoBuildingSubheaderSection section={section} />
  }

  if (section.variant === 'energyCertificate') {
    return <BuildingInfoEnergyCertificateSection section={section} />
  }

  if (section.variant === 'previousEnergyClass') {
    return <BuildingInfoPreviousEnergyClassSection section={section} />
  }

  if (section.variant === 'measureList') {
    return <BuildingInfoMeasureListSection section={section} />
  }

  if (section.consumptionControls != null) {
    return (
      <BuildingInfoEnergyConsumptionSection
        section={section}
        accentColor={accentColor}
      />
    )
  }

  return (
    <Box
      data-section-id={section.id}
      sx={{
        mt: '2.25rem',
      }}
    >
      {showComparisonIcon && (
        <RenovationIcon
          width="31px"
          height="25px"
          sx={{
            mb: '2.125rem',
          }}
        />
      )}
      {section.title != null && (
        <Box
          sx={{
            ...textSx,
            mb: '1rem',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          <BuildingInfoText text={section.title} />
        </Box>
      )}
      {section.description != null && (
        <Box
          sx={{
            ...textSx,
            mb: '1.25rem',
            color: '#111111',
          }}
        >
          <BuildingInfoText text={section.description} />
        </Box>
      )}
      {section.rows?.map((row) => <BuildingInfoRow key={row.id} row={row} />)}
      {section.metrics?.map((metric) => (
        <BuildingInfoMetricBlock
          key={metric.id}
          metric={metric}
          accentColor={accentColor}
        />
      ))}
      {section.scenarios?.map((scenario) => (
        <BuildingInfoScenarioBlock key={scenario.id} scenario={scenario} />
      ))}
      {section.notes?.map((note) => (
        <BuildingInfoNoteText key={note.id} note={note} />
      ))}
    </Box>
  )
}

const BuildingInfoPanelHeadingGraphic = ({
  panelId,
}: {
  panelId: EnergymapBuildingInfoPanelId
}) => {
  if (panelId === 'energyConsumption') {
    return (
      <BuildingInfoDecorativeImage
        src={BUILDING_INFO_ASSETS.energyLightning}
        width="18px"
        height="28px"
        sx={{
          position: 'absolute',
          top: 'var(--building-info-heading-graphic-top, 3.125rem)',
          left: 0,
        }}
      />
    )
  }

  if (panelId === 'renovationRecommendations') {
    return (
      <RenovationIcon
        sx={{
          position: 'absolute',
          top: 'var(--building-info-heading-graphic-top, 3.25rem)',
          left: 0,
        }}
      />
    )
  }

  return null
}

const BuildingInfoPanelHeroGraphic = ({
  panelId,
}: {
  panelId: EnergymapBuildingInfoPanelId
}) => {
  if (panelId !== 'renovationRecommendations') {
    return null
  }

  return (
    <BuildingInfoFigmaGraphic
      src={BUILDING_INFO_ASSETS.renovationBuilding}
      dimensions={BUILDING_INFO_GRAPHIC_DIMENSIONS.renovationBuilding}
      testId="building-info-graphic-renovation-building"
      sx={{
        mt: '2.75rem',
        mb: '2.75rem',
        mx: 'auto',
      }}
    />
  )
}

const BuildingInfoPanelBody = ({
  panel,
  titleId,
  accentColor,
  sections = panel.sections,
  footer,
  showDescription = true,
  showHeroGraphic = true,
  sx,
}: {
  panel: EnergymapBuildingInfoPanel
  titleId: string
  accentColor: string
  sections?: EnergymapBuildingInfoSection[]
  footer?: React.ReactNode
  showDescription?: boolean
  showHeroGraphic?: boolean
  sx?: AppSxProps
}) => (
  <Box
    sx={[
      {
        boxSizing: 'border-box',
        position: 'relative',
      },
      ...toSxArray(sx),
    ]}
  >
    <BuildingInfoPanelHeadingGraphic panelId={panel.id} />
    <Box
      id={titleId}
      sx={{
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: accentColor,
        textTransform: 'uppercase',
        whiteSpace: 'normal',
      }}
    >
      <BuildingInfoText text={panel.title} />
    </Box>
    <Box
      sx={{
        mt: 'var(--building-info-heading-divider-mt, 1.375rem)',
        borderTop: '0.3px solid #cfcfcf',
      }}
    />
    {showHeroGraphic && <BuildingInfoPanelHeroGraphic panelId={panel.id} />}
    {showDescription && panel.description != null && (
      <Box
        sx={{
          ...textSx,
          mt:
            panel.id === 'renovationRecommendations' ? 0 : '1.875rem',
          color: '#111111',
        }}
      >
        <BuildingInfoText text={panel.description} />
      </Box>
    )}
    {sections.map((section) => (
      <BuildingInfoSectionBlock
        key={section.id}
        section={section}
        accentColor={accentColor}
      />
    ))}
    {footer}
  </Box>
)

const getTabPagePanelAccentColor = ({
  tabId,
  panelId,
}: {
  tabId: BuildingInfoTabId
  panelId: EnergymapBuildingInfoPanelId
}) =>
  tabId === 'renovation' && panelId === 'buildingDetails'
    ? '#111111'
    : PANEL_ACCENTS[panelId]

const getStackedTabPagePanelContentSx = ({
  panelId,
  index,
  panelCount,
}: {
  panelId: EnergymapBuildingInfoPanelId
  index: number
  panelCount: number
}): AppSxProps => ({
  width: {
    mobile: 'min(16.25rem, calc(100vw - 6rem))',
    desktop: `min(${PANEL_CONTENT_WIDTHS[panelId]}, calc(100% - 5rem))`,
  },
  maxWidth: '100%',
  mx: 'auto',
  pt: {
    mobile: index === 0 ? '7.5rem' : '6.25rem',
    desktop: index === 0 ? '6.25rem' : '5rem',
  },
  pb: {
    mobile: index === panelCount - 1 ? '8rem' : '5rem',
    desktop: index === panelCount - 1 ? '6.5rem' : '5rem',
  },
})

const getDesktopGridPanelContentSx = ({
  panelId,
}: {
  panelId: EnergymapBuildingInfoPanelId
}): AppSxProps => ({
  width: `min(${PANEL_CONTENT_WIDTHS[panelId]}, calc(100% - 3rem))`,
  maxWidth: '100%',
  pt: DESKTOP_HEADING_TOP,
  pb: DESKTOP_SECTION_BOTTOM_PADDING,
  mx: 'auto',
  '--building-info-heading-graphic-top': DESKTOP_HEADING_GRAPHIC_TOP,
  '--building-info-heading-divider-mt': DESKTOP_HEADING_DIVIDER_MARGIN_TOP,
})

const BuildingInfoPanelSection = ({
  panel,
  tabId,
  bodySx,
  footer,
  sections,
  showDescription,
  showHeroGraphic,
  sx,
}: {
  panel: EnergymapBuildingInfoPanel
  tabId: BuildingInfoTabId
  bodySx?: AppSxProps
  footer?: React.ReactNode
  sections?: EnergymapBuildingInfoSection[]
  showDescription?: boolean
  showHeroGraphic?: boolean
  sx?: AppSxProps
}) => {
  const titleId = React.useId()
  const accentColor = getTabPagePanelAccentColor({
    tabId,
    panelId: panel.id,
  })

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      data-testid={`building-info-panel-${panel.id}`}
      data-panel-id={panel.id}
      sx={[
        {
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          backgroundColor: 'inherit',
          flexShrink: 0,
        },
        ...toSxArray(sx),
      ]}
    >
      <BuildingInfoPanelBody
        panel={panel}
        titleId={titleId}
        accentColor={accentColor}
        sections={sections}
        footer={footer}
        showDescription={showDescription}
        showHeroGraphic={showHeroGraphic}
        sx={bodySx}
      />
    </Box>
  )
}

const BuildingInfoStackedTabPageSection = ({
  panel,
  tabId,
  index,
  panelCount,
}: {
  panel: EnergymapBuildingInfoPanel
  tabId: BuildingInfoTabId
  index: number
  panelCount: number
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        backgroundColor: PANEL_BACKGROUNDS[panel.id],
        flexShrink: 0,
      }}
    >
      <BuildingInfoPanelSection
        panel={panel}
        tabId={tabId}
        bodySx={getStackedTabPagePanelContentSx({
          panelId: panel.id,
          index,
          panelCount,
        })}
      />
    </Box>
  )
}

const BuildingInfoDesktopGrid = ({
  tabId,
  children,
}: {
  tabId: BuildingInfoTabId
  children: React.ReactNode
}) => (
  <Box
    data-testid="building-info-grid"
    data-building-info-grid-layout={tabId}
    sx={{
      display: 'grid',
      width: `min(${DESKTOP_GRID_MAX_WIDTHS[tabId]}, 100vw)`,
      maxWidth: '100%',
      mx: 'auto',
      minHeight: DESKTOP_GRID_MIN_HEIGHTS[tabId],
      backgroundColor: '#f9f9f9',
      ...(tabId === 'renovation'
        ? {
            gridTemplateColumns: RENOVATION_DESKTOP_GRID_COLUMNS,
            gridTemplateRows: `${DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationTop} ${DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationBottom}`,
            gridTemplateAreas: `
              "energy renovation details"
              "comparison comparison effectiveness"
            `,
          }
        : {
            gridTemplateColumns: BASIC_DESKTOP_GRID_COLUMNS,
            gridTemplateRows: DESKTOP_GRID_SECTION_MIN_HEIGHTS.basic,
            gridTemplateAreas: '"energy details"',
          }),
    }}
  >
    {children}
  </Box>
)

const BuildingInfoDesktopGridSection = ({
  slot,
  gridArea,
  panelId,
  backgroundColor,
  minHeight,
  children,
}: {
  slot: string
  gridArea: string
  panelId?: EnergymapBuildingInfoPanelId
  backgroundColor: string
  minHeight: string
  children?: React.ReactNode
}) => (
  <Box
    data-testid={`building-info-grid-section-${slot}`}
    data-grid-area={gridArea}
    data-grid-slot={slot}
    data-panel-id={panelId}
    sx={{
      gridArea,
      minWidth: 0,
      minHeight,
      backgroundColor,
    }}
  >
    {children}
  </Box>
)

const getRenovationComparisonSection = (
  panel?: EnergymapBuildingInfoPanel
) => panel?.sections.find((section) => section.id === 'scenarioComparison')

const BuildingInfoRenovationReferenceYearNote = () => (
  <Box
    data-testid="building-info-renovation-reference-year-note"
    sx={{
      ...textSx,
      mt: 'auto',
      pt: '2rem',
      color: '#111111',
    }}
  >
    <TText
      keyName="sidebar.building_info.panels.energy.reference_year_note_unavailable"
      ns="energiakartta"
    />
  </Box>
)

const BuildingInfoRenovationComparisonWide = ({
  panel,
}: {
  panel: EnergymapBuildingInfoPanel
}) => {
  const titleId = React.useId()
  const section = getRenovationComparisonSection(panel)

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      data-testid="building-info-renovation-comparison-wide"
      data-panel-id={panel.id}
      sx={{
        display: 'grid',
        gridTemplateColumns: '440fr 560fr',
        minHeight: '100%',
      }}
    >
      <Box
        sx={{
          width: 'min(22.5rem, calc(100% - 5rem))',
          maxWidth: '100%',
          ml: '5rem',
          pt: '7.5rem',
          pb: DESKTOP_SECTION_BOTTOM_PADDING,
          boxSizing: 'border-box',
        }}
      >
        <RenovationIcon width="31px" height="25px" />
        {section?.title != null && (
          <Box
            id={titleId}
            sx={{
              mt: '2rem',
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              letterSpacing: '0.1em',
              color: PANEL_ACCENTS.renovationRecommendations,
              textTransform: 'uppercase',
            }}
          >
            <BuildingInfoText text={section.title} />
          </Box>
        )}
        <Box
          sx={{
            mt: '1.875rem',
            borderTop: '0.3px solid #cfcfcf',
          }}
        />
        {section?.description != null && (
          <Box
            sx={{
              ...textSx,
              mt: '1.875rem',
              maxWidth: '20.375rem',
              color: '#111111',
            }}
          >
            <BuildingInfoText text={section.description} />
          </Box>
        )}
      </Box>
      <Box
        sx={{
          width: `min(${PANEL_CONTENT_WIDTHS.renovationRecommendations}, calc(100% - 4rem))`,
          maxWidth: '100%',
          ml: '3.75rem',
          pt: '16.875rem',
          pb: DESKTOP_SECTION_BOTTOM_PADDING,
          boxSizing: 'border-box',
        }}
      >
        {section?.scenarios?.map((scenario) => (
          <BuildingInfoScenarioBlock key={scenario.id} scenario={scenario} />
        ))}
      </Box>
    </Box>
  )
}

const BuildingInfoRenovationEffectivenessContent = () => (
  <Box
    data-testid="building-info-renovation-effectiveness-content"
    sx={{
      width: `min(${PANEL_CONTENT_WIDTHS.buildingDetails}, calc(100% - 4rem))`,
      maxWidth: '100%',
      ml: '4.375rem',
      pt: '11.75rem',
      pb: DESKTOP_SECTION_BOTTOM_PADDING,
    }}
  >
    <Box
      sx={{
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: '#111111',
        textTransform: 'uppercase',
      }}
    >
      <TText
        keyName="sidebar.building_info.panels.renovation.effectiveness.title"
        ns="energiakartta"
      />
    </Box>
    <Box
      sx={{
        mt: '0.75rem',
        borderTop: '0.3px solid #cfcfcf',
      }}
    />
    <Box
      sx={{
        ...textSx,
        mt: '2.5rem',
        color: '#111111',
        whiteSpace: 'normal',
        '& b': {
          fontWeight: 700,
        },
      }}
    >
      <TText
        keyName="sidebar.building_info.panels.renovation.effectiveness.body"
        ns="energiakartta"
      />
    </Box>
    <Box
      aria-hidden="true"
      data-testid="building-info-renovation-effectiveness-indicator"
      sx={{
        mt: '3rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.625rem',
      }}
    >
      <Box
        sx={{
          width: '25px',
          height: '10px',
          borderRadius: '5px',
          backgroundColor: '#111111',
        }}
      />
      <Box
        sx={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#a0a0a0',
        }}
      />
    </Box>
  </Box>
)

const BuildingInfoDesktopTabPageContent = ({
  tabId,
  panelsById,
}: {
  tabId: BuildingInfoTabId
  panelsById: Map<EnergymapBuildingInfoPanelId, EnergymapBuildingInfoPanel>
}) => {
  const energyPanel = panelsById.get('energyConsumption')
  const renovationPanel = panelsById.get('renovationRecommendations')
  const buildingPanel = panelsById.get('buildingDetails')
  const energyTopSections =
    tabId === 'renovation'
      ? energyPanel?.sections.filter(
          (section) => section.id !== 'calculationContext'
        )
      : energyPanel?.sections
  const renovationTopSections =
    renovationPanel?.sections.filter(
      (section) => section.id !== 'scenarioComparison'
    ) ?? []

  return (
    <BuildingInfoDesktopGrid tabId={tabId}>
      {energyPanel != null && (
        <BuildingInfoDesktopGridSection
          slot={tabId === 'renovation' ? 'top-energy' : 'basic-energy'}
          gridArea="energy"
          panelId={energyPanel.id}
          backgroundColor={PANEL_BACKGROUNDS.energyConsumption}
          minHeight={
            tabId === 'renovation'
              ? DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationTop
              : DESKTOP_GRID_SECTION_MIN_HEIGHTS.basic
          }
        >
          <BuildingInfoPanelSection
            panel={energyPanel}
            tabId={tabId}
            sections={energyTopSections}
            footer={
              tabId === 'renovation' ? (
                <BuildingInfoRenovationReferenceYearNote />
              ) : undefined
            }
            sx={{ minHeight: '100%', height: '100%' }}
            bodySx={[
              ...toSxArray(
                getDesktopGridPanelContentSx({
                  panelId: energyPanel.id,
                })
              ),
              ...(tabId === 'renovation'
                ? [
                    {
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '100%',
                      height: '100%',
                    },
                  ]
                : []),
            ]}
          />
        </BuildingInfoDesktopGridSection>
      )}
      {tabId === 'renovation' && renovationPanel != null && (
        <BuildingInfoDesktopGridSection
          slot="top-renovation"
          gridArea="renovation"
          panelId={renovationPanel.id}
          backgroundColor={PANEL_BACKGROUNDS.renovationRecommendations}
          minHeight={DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationTop}
        >
          <BuildingInfoPanelSection
            panel={renovationPanel}
            tabId={tabId}
            sections={renovationTopSections}
            sx={{ minHeight: '100%', height: '100%' }}
            bodySx={getDesktopGridPanelContentSx({
              panelId: renovationPanel.id,
            })}
          />
        </BuildingInfoDesktopGridSection>
      )}
      {buildingPanel != null && (
        <BuildingInfoDesktopGridSection
          slot={
            tabId === 'renovation'
              ? 'top-building-details'
              : 'basic-building-details'
          }
          gridArea="details"
          panelId={buildingPanel.id}
          backgroundColor={PANEL_BACKGROUNDS.buildingDetails}
          minHeight={
            tabId === 'renovation'
              ? DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationTop
              : DESKTOP_GRID_SECTION_MIN_HEIGHTS.basic
          }
        >
          <BuildingInfoPanelSection
            panel={buildingPanel}
            tabId={tabId}
            sx={{ minHeight: '100%', height: '100%' }}
            bodySx={getDesktopGridPanelContentSx({
              panelId: buildingPanel.id,
            })}
          />
        </BuildingInfoDesktopGridSection>
      )}
      {tabId === 'renovation' && renovationPanel != null && (
        <>
          <BuildingInfoDesktopGridSection
            slot="bottom-wide"
            gridArea="comparison"
            panelId={renovationPanel.id}
            backgroundColor={PANEL_BACKGROUNDS.energyConsumption}
            minHeight={DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationBottom}
          >
            <BuildingInfoRenovationComparisonWide panel={renovationPanel} />
          </BuildingInfoDesktopGridSection>
          <BuildingInfoDesktopGridSection
            slot="bottom-right"
            gridArea="effectiveness"
            panelId={renovationPanel.id}
            backgroundColor={RENOVATION_EFFECTIVENESS_BACKGROUND}
            minHeight={DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationBottom}
          >
            <BuildingInfoRenovationEffectivenessContent />
          </BuildingInfoDesktopGridSection>
        </>
      )}
    </BuildingInfoDesktopGrid>
  )
}

const BuildingInfoStackedTabPageContent = ({
  tabId,
  panels,
}: {
  tabId: BuildingInfoTabId
  panels: EnergymapBuildingInfoPanel[]
}) => (
  <>
    {panels.map((panel, index) => (
      <BuildingInfoStackedTabPageSection
        key={panel.id}
        panel={panel}
        tabId={tabId}
        index={index}
        panelCount={panels.length}
      />
    ))}
  </>
)

const BuildingInfoTabPageContent = ({
  tabId,
  panels,
  forceMobileLayout = false,
}: {
  tabId: BuildingInfoTabId
  panels: EnergymapBuildingInfoPanel[]
  forceMobileLayout?: boolean
}) => {
  const isMobile = useIsMobile()
  const useMobileLayout = isMobile || forceMobileLayout
  const panelsById = React.useMemo(
    () =>
      new Map<EnergymapBuildingInfoPanelId, EnergymapBuildingInfoPanel>(
        panels.map((panel) => [panel.id, panel])
      ),
    [panels]
  )
  const visiblePanels = React.useMemo(
    () =>
      PANEL_IDS_BY_TAB_ID[tabId]
        .map((panelId) => panelsById.get(panelId))
        .filter((panel): panel is EnergymapBuildingInfoPanel => panel != null),
    [panelsById, tabId]
  )

  return (
    <Box
      data-testid={`building-info-tab-page-${tabId}`}
      data-building-info-tab-id={tabId}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        backgroundColor: '#f9f9f9',
      }}
    >
      {useMobileLayout ? (
        <BuildingInfoStackedTabPageContent
          tabId={tabId}
          panels={visiblePanels}
        />
      ) : (
        <BuildingInfoDesktopTabPageContent
          tabId={tabId}
          panelsById={panelsById}
        />
      )}
    </Box>
  )
}

const BuildingInfoActiveTabSync = ({
  activeTabId,
  onActiveTabChange,
}: {
  activeTabId?: BuildingInfoTabId
  onActiveTabChange?: (tabId: BuildingInfoTabId) => void
}) => {
  const tabsContext = useNullableSidebarPanelExtensionTabsContext()
  const setActiveTabId = tabsContext?.setActiveTabId
  const lastAppliedActiveTabId = React.useRef<BuildingInfoTabId | undefined>(
    undefined
  )
  const lastNotifiedActiveTabId = React.useRef<BuildingInfoTabId | undefined>(
    undefined
  )
  const hasActiveTab =
    activeTabId != null &&
    tabsContext?.tabs.some((tab) => tab.tabId === activeTabId) === true
  const resolvedActiveTabId = tabsContext?.resolvedActiveTabId

  React.useEffect(() => {
    if (
      activeTabId == null ||
      !hasActiveTab ||
      lastAppliedActiveTabId.current === activeTabId
    ) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setActiveTabId?.(activeTabId)
      lastAppliedActiveTabId.current = activeTabId
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeTabId, hasActiveTab, setActiveTabId])

  React.useEffect(() => {
    if (
      !isBuildingInfoTabId(resolvedActiveTabId) ||
      lastNotifiedActiveTabId.current === resolvedActiveTabId
    ) {
      return
    }

    if (
      activeTabId != null &&
      resolvedActiveTabId !== activeTabId &&
      lastAppliedActiveTabId.current !== activeTabId
    ) {
      return
    }

    lastNotifiedActiveTabId.current = resolvedActiveTabId
    onActiveTabChange?.(resolvedActiveTabId)
  }, [activeTabId, onActiveTabChange, resolvedActiveTabId])

  return null
}

const TwoPanelIcon = () => (
  <img
    src="/files/img/energiakartta/sidebar/building-info-two-panel.svg"
    alt=""
    aria-hidden="true"
    style={{
      display: 'block',
      width: '26.8px',
      height: '21.8px',
    }}
  />
)

const ThreePanelIcon = () => (
  <Box
    sx={{
      position: 'relative',
      width: '18.75px',
      height: '19.5px',
      overflow: 'visible',
    }}
  >
    <img
      src="/files/img/energiakartta/sidebar/building-info-three-panel-left.svg"
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '8px',
        left: 0,
        display: 'block',
        width: '11.75px',
        height: '14.65px',
      }}
    />
    <img
      src="/files/img/energiakartta/sidebar/building-info-three-panel-right.svg"
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '1px',
        right: 0,
        display: 'block',
        width: '11.75px',
        height: '14.65px',
      }}
    />
  </Box>
)

export const getBuildingInfoPanelIds = (
  mode: BuildingInfoDesktopMode
) => PANEL_IDS_BY_MODE[mode]

export const getBuildingInfoTabPanelIds = (tabId: BuildingInfoTabId) =>
  PANEL_IDS_BY_TAB_ID[tabId]

export const getBuildingInfoTabIdForMode = (
  mode: BuildingInfoDesktopMode
) => TAB_ID_BY_MODE[mode]

export const getBuildingInfoModeForTabId = (tabId: BuildingInfoTabId) =>
  MODE_BY_TAB_ID[tabId]

const isBuildingInfoTabId = (tabId?: string): tabId is BuildingInfoTabId =>
  tabId === 'basic' || tabId === 'renovation'

const getBuildingInfoPageControlsSx = ({
  forceMobileLayout = false,
  isDesktopFullscreenLayout = false,
}: {
  forceMobileLayout?: boolean
  isDesktopFullscreenLayout?: boolean
}): AppSxProps | undefined => {
  if (forceMobileLayout) {
    return undefined
  }

  return {
    position: isDesktopFullscreenLayout ? 'fixed' : 'absolute',
    top: isDesktopFullscreenLayout
      ? `${MAP_CONTROL_EDGE_GUTTER_PX}px`
      : '35px',
    right: isDesktopFullscreenLayout
      ? `${MAP_CONTROL_EDGE_GUTTER_PX}px`
      : 'auto',
    left: isDesktopFullscreenLayout
      ? 'auto'
      : 'min(624px, calc(100% - 116px))',
    gap: '4px',
    px: 0,
    py: 0,
    backgroundColor: 'transparent',
    borderBottom: 0,
    zIndex: isDesktopFullscreenLayout
      ? (theme: AppTheme) => theme.zIndex.drawer + 14
      : 2,
  }
}

export const BuildingInfoTabPages = ({
  panels,
  ariaLabels,
  activeTabId,
  forceMobileLayout = false,
  isDesktopFullscreenLayout = false,
  onActiveTabChange,
  onClose,
  onCollapse,
}: BuildingInfoTabPagesProps) => (
  <>
    <BuildingInfoActiveTabSync
      activeTabId={activeTabId}
      onActiveTabChange={onActiveTabChange}
    />
    <SidebarPanelExtensionTabContainer
      tabId="basic"
      tabName={ariaLabels.overview}
      tabAriaLabel={ariaLabels.overview}
      tabIcon={<TwoPanelIcon />}
    >
      <SidebarPanelExtensionPageContainer
        closeAriaLabel={ariaLabels.close}
        collapseAriaLabel={ariaLabels.collapse}
        onClose={onClose}
        onCollapse={() => onCollapse('basic')}
        contentSx={{
          backgroundColor: '#f9f9f9',
        }}
        controlsSx={getBuildingInfoPageControlsSx({
          forceMobileLayout,
          isDesktopFullscreenLayout,
        })}
      >
        <BuildingInfoTabPageContent
          tabId="basic"
          panels={panels}
          forceMobileLayout={forceMobileLayout}
        />
      </SidebarPanelExtensionPageContainer>
    </SidebarPanelExtensionTabContainer>
    <SidebarPanelExtensionTabContainer
      tabId="renovation"
      tabName={ariaLabels.renovation}
      tabAriaLabel={ariaLabels.renovation}
      tabIcon={<ThreePanelIcon />}
    >
      <SidebarPanelExtensionPageContainer
        closeAriaLabel={ariaLabels.close}
        collapseAriaLabel={ariaLabels.collapse}
        onClose={onClose}
        onCollapse={() => onCollapse('renovation')}
        contentSx={{
          backgroundColor: '#f9f9f9',
        }}
        controlsSx={getBuildingInfoPageControlsSx({
          forceMobileLayout,
          isDesktopFullscreenLayout,
        })}
      >
        <BuildingInfoTabPageContent
          tabId="renovation"
          panels={panels}
          forceMobileLayout={forceMobileLayout}
        />
      </SidebarPanelExtensionPageContainer>
    </SidebarPanelExtensionTabContainer>
  </>
)

export const BuildingInfoActionRail = ({
  activeMode,
  isCollapsed,
  orientation = 'column',
  ariaLabels,
  onModeChange,
}: BuildingInfoActionRailProps) => {
  const tooltipSide: BuildingInfoTooltipSide =
    orientation === 'row' ? 'top' : 'right'

  return (
    <Box
      data-testid="building-info-action-rail"
      data-orientation={orientation}
      sx={{
        display: 'flex',
        flexDirection: orientation,
        gap: `${BUILDING_INFO_ACTION_BUTTON_GAP_PX}px`,
        pointerEvents: 'auto',
      }}
    >
      <BuildingInfoTooltip title={ariaLabels.overview} side={tooltipSide}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps}
            type="button"
            aria-label={ariaLabels.overview}
            aria-pressed={activeMode === 'twoPanel' && !isCollapsed}
            data-building-info-mode="twoPanel"
            onClick={() => onModeChange('twoPanel')}
            size="small"
            sx={actionButtonSx({
              active: activeMode === 'twoPanel' && !isCollapsed,
            })}
          >
            <TwoPanelIcon />
          </IconButton>
        )}
      </BuildingInfoTooltip>
      <BuildingInfoTooltip title={ariaLabels.renovation} side={tooltipSide}>
        {(triggerProps) => (
          <IconButton
            {...triggerProps}
            type="button"
            aria-label={ariaLabels.renovation}
            aria-pressed={activeMode === 'threePanel' && !isCollapsed}
            data-building-info-mode="threePanel"
            onClick={() => onModeChange('threePanel')}
            size="small"
            sx={actionButtonSx({
              active: activeMode === 'threePanel' && !isCollapsed,
            })}
          >
            <ThreePanelIcon />
          </IconButton>
        )}
      </BuildingInfoTooltip>
    </Box>
  )
}
