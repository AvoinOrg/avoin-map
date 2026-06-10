'use client'

import React from 'react'
import { Button as BaseButton } from '@base-ui/react/button'
import { useTranslate } from '@tolgee/react'
import { css, cx } from 'styled-system/css'

import { MAP_CONTROL_EDGE_GUTTER_PX } from '#/common/constants/map'
import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import type { PandaStyleObject, PandaStyleProp } from '#/common/style/panda'
import {
  mergePandaStyleProps,
  pandaStylePropsToArray,
} from '#/common/style/pandaStyleProps'
import type { SelectOption } from '#/common/types/general'
import DropDownSelectInset from '#/components/common/DropDownSelectInset'
import type { FormSelectionEvent } from '#/components/common/formControlEvents'
import { Box } from '#/components/common/PandaBox'
import SimpleTooltip from '#/components/common/SimpleTooltip'
import TText from '#/components/common/TText'
import { SidebarPanelExtensionPageContainer } from '#/components/Sidebar/SidebarPanelExtensionPageContainer'
import { SidebarPanelExtensionTabContainer } from '#/components/Sidebar/SidebarPanelExtensionTabContainer'
import { useNullableSidebarPanelExtensionTabsContext } from '#/components/Sidebar/SidebarPanelExtensionTabsContext'
import type {
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

type BuildingInfoTextElementProps<T extends React.ElementType = 'p'> = {
  component?: T
  styleProps?: PandaStyleProp
  children?: React.ReactNode
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'children' | 'className' | 'color' | 'component' | 'style' | 'styleProps'
>

const BuildingInfoTextElement = <T extends React.ElementType = 'p'>({
  component,
  styleProps,
  children,
  ...props
}: BuildingInfoTextElementProps<T>) => (
  <Box
    component={(component ?? 'p') as React.ElementType}
    {...props}
    styleProps={[
      {
        m: 0,
      },
      ...pandaStylePropsToArray(styleProps),
    ]}
  >
    {children}
  </Box>
)

const buildingInfoButtonResetSx: PandaStyleObject = {
  m: 0,
  border: 0,
  appearance: 'none',
  backgroundColor: 'transparent',
  font: 'inherit',
  textDecoration: 'none',
  cursor: 'pointer',
  '&:disabled': {
    cursor: 'default',
  },
}

type BuildingInfoButtonProps = Omit<
  React.ComponentProps<typeof BaseButton>,
  'className' | 'color' | 'style'
> & {
  styleProps?: PandaStyleProp
  className?: string
  style?: React.CSSProperties
}

const BuildingInfoButton = React.forwardRef<
  HTMLButtonElement,
  BuildingInfoButtonProps
>(
  (
    { styleProps, className, style, type = 'button', children, ...props },
    ref
  ) => {
    const buttonSx = [buildingInfoButtonResetSx, ...pandaStylePropsToArray(styleProps)]

    return (
      <BaseButton
        {...props}
        type={type}
        ref={ref}
        className={cx(css(...buttonSx), className)}
        style={mergePandaStyleProps({ styleProps, style })}
      >
        {children}
      </BaseButton>
    )
  }
)

BuildingInfoButton.displayName = 'BuildingInfoButton'

type BuildingInfoSvgIconProps = Omit<
  React.SVGProps<SVGSVGElement>,
  'color' | 'style'
> & {
  styleProps?: PandaStyleProp
}

const BuildingInfoSvgIcon = ({
  styleProps,
  children,
  viewBox = '0 0 24 24',
  ...props
}: BuildingInfoSvgIconProps) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox={viewBox}
    focusable="false"
    {...props}
    styleProps={[
      {
        display: 'inline-block',
        width: '1em',
        height: '1em',
        flexShrink: 0,
        fill: 'currentColor',
        fontSize: '1rem',
      },
      ...pandaStylePropsToArray(styleProps),
    ]}
  >
    {children}
  </Box>
)

const BoltIcon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66s.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21" />
  </BuildingInfoSvgIcon>
)

const Co2Icon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="M14 9h-3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1m-.5 4.5h-2v-3h2zM8 13v1c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1H6.5v-.5h-2v3h2V13zm12.5 2.5h-2v1h3V18H17v-2.5c0-.55.45-1 1-1h2v-1h-3V12h3.5c.55 0 1 .45 1 1v1.5c0 .55-.45 1-1 1" />
  </BuildingInfoSvgIcon>
)

const ConstructionIcon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="m13.7826 15.1719 2.1213-2.1213 5.9963 5.9962-2.1213 2.1213zM17.5 10c1.93 0 3.5-1.57 3.5-3.5 0-.58-.16-1.12-.41-1.6l-2.7 2.7-1.49-1.49 2.7-2.7c-.48-.25-1.02-.41-1.6-.41C15.57 3 14 4.57 14 6.5c0 .41.08.8.21 1.16l-1.85 1.85-1.78-1.78.71-.71-1.41-1.41L12 3.49c-1.17-1.17-3.07-1.17-4.24 0L4.22 7.03l1.41 1.41H2.81l-.71.71 3.54 3.54.71-.71V9.15l1.41 1.41.71-.71 1.78 1.78-7.41 7.41 2.12 2.12L16.34 9.79c.36.13.75.21 1.16.21" />
  </BuildingInfoSvgIcon>
)

const EuroIcon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15l1-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15l1-2H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3l-1 2h4.06c-.04.33-.06.66-.06 1s.02.67.06 1H3l-1 2h4.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57" />
  </BuildingInfoSvgIcon>
)

const LocalFireDepartmentIcon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="m12 12.9-2.13 2.09c-.56.56-.87 1.29-.87 2.07C9 18.68 10.35 20 12 20s3-1.32 3-2.94c0-.78-.31-1.52-.87-2.07z" />
    <path d="m16 6-.44.55C14.38 8.02 12 7.19 12 5.3V2S4 6 4 13c0 2.92 1.56 5.47 3.89 6.86-.56-.79-.89-1.76-.89-2.8 0-1.32.52-2.56 1.47-3.5L12 10.1l3.53 3.47c.95.93 1.47 2.17 1.47 3.5 0 1.02-.31 1.96-.85 2.75 1.89-1.15 3.29-3.06 3.71-5.3.66-3.55-1.07-6.9-3.86-8.52" />
  </BuildingInfoSvgIcon>
)

const OpacityIcon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="M17.66 8 12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8M6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14z" />
  </BuildingInfoSvgIcon>
)

const WaterDropIcon = (props: BuildingInfoSvgIconProps) => (
  <BuildingInfoSvgIcon {...props}>
    <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8M7.83 14c.37 0 .67.26.74.62.41 2.22 2.28 2.98 3.64 2.87.43-.02.79.32.79.75 0 .4-.32.73-.72.75-2.13.13-4.62-1.09-5.19-4.12-.08-.45.28-.87.74-.87" />
  </BuildingInfoSvgIcon>
)

const isPlainEnergyClassText = (text: EnergymapBuildingInfoText) =>
  text.type === 'plain' && /^[A-G]$/i.test(text.text.trim())

const BuildingInfoDecorativeImage = ({
  src,
  width,
  height,
  styleProps,
}: {
  src: string
  width: string
  height: string
  styleProps?: PandaStyleProp
}) => (
  <Box
    component="img"
    src={src}
    alt=""
    aria-hidden="true"
    styleProps={[
      {
        display: 'block',
        width,
        height,
        flexShrink: 0,
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
  />
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
  styleProps,
}: {
  src: string
  dimensions: BuildingInfoGraphicDimensions
  maxWidth?: string
  testId: string
  styleProps?: PandaStyleProp
}) => (
  <Box
    aria-hidden="true"
    data-testid={testId}
    data-figma-width={getFigmaDimensionData(dimensions.width)}
    data-figma-height={getFigmaDimensionData(dimensions.height)}
    styleProps={[
      {
        position: 'relative',
        display: 'block',
        width: `min(${getFigmaDimensionCss(dimensions.width)}, ${maxWidth})`,
        aspectRatio: `${dimensions.width} / ${dimensions.height}`,
        flexShrink: 0,
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
  >
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden="true"
      styleProps={{
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
  styleProps,
}: {
  width?: string
  height?: string
  styleProps?: PandaStyleProp
}) => (
  <Box
    aria-hidden="true"
    styleProps={[
      {
        position: 'relative',
        width,
        height,
        flexShrink: 0,
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
  >
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.renovationIconCenter}
      width="33.55%"
      height="61.23%"
      styleProps={{
        position: 'absolute',
        top: '19.4%',
        left: '34.84%',
      }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.renovationIconArcLower}
      width="90.32%"
      height="44%"
      styleProps={{
        position: 'absolute',
        left: 0,
        bottom: 0,
      }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.renovationIconArcUpper}
      width="90.32%"
      height="44%"
      styleProps={{
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
    styleProps={{
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
      styleProps={{ position: 'absolute', inset: 0 }}
    />
    <BuildingInfoDecorativeImage
      src={BUILDING_INFO_ASSETS.warningLine}
      width="1px"
      height="6px"
      styleProps={{
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
      styleProps={{
        position: 'absolute',
        left: '50%',
        bottom: '11.57%',
        transform: 'translateX(-50%)',
      }}
    />
  </Box>
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
    return (
      <OpacityIcon
        data-primary-metric-icon-id={metricId}
        aria-hidden="true"
        styleProps={iconSx}
      />
    )
  }

  if (metricId === 'cost') {
    return (
      <EuroIcon
        data-primary-metric-icon-id={metricId}
        aria-hidden="true"
        styleProps={iconSx}
      />
    )
  }

  if (metricId === 'co2') {
    return (
      <Co2Icon
        data-primary-metric-icon-id={metricId}
        aria-hidden="true"
        styleProps={iconSx}
      />
    )
  }

  return (
    <BoltIcon
      data-primary-metric-icon-id={metricId}
      aria-hidden="true"
      styleProps={iconSx}
    />
  )
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
    return <LocalFireDepartmentIcon aria-hidden="true" styleProps={iconSx} />
  }

  if (submetricId === 'waterHeating') {
    return <WaterDropIcon aria-hidden="true" styleProps={iconSx} />
  }

  return <BoltIcon aria-hidden="true" styleProps={iconSx} />
}

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
      styleProps={{
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
        <SimpleTooltip
          title={
            <Box component="span">
              <BuildingInfoText text={value.text} />
            </Box>
          }
          side="top"
        >
          <Box
            component="span"
            tabIndex={0}
            styleProps={{
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
            <ConstructionIcon
              data-testid="building-info-unavailable-value-icon"
              aria-hidden="true"
              styleProps={{
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
        </SimpleTooltip>
      ) : shouldRenderEnergyClassBadge ? (
        <Box
          component="span"
          styleProps={{
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
          styleProps={{
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
      styleProps={{
        mt: '0.5rem',
        display: showWarningIcon ? 'flex' : 'block',
        alignItems: 'flex-start',
        gap: '0.5625rem',
        maxWidth: '100%',
        ...STATUS_SX[note.status],
      }}
    >
      {showWarningIcon && <WarningIcon />}
      <BuildingInfoTextElement
        styleProps={{
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
      </BuildingInfoTextElement>
    </Box>
  )
}

const BuildingInfoRow = ({ row }: { row: EnergymapBuildingInfoRow }) => (
  <Box
    data-row-id={row.id}
    styleProps={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      columnGap: '1rem',
      borderTop: '0.3px solid #cfcfcf',
      py: '0.875rem',
    }}
  >
    <BuildingInfoTextElement
      styleProps={{
        ...textSx,
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
    </BuildingInfoTextElement>
    <BuildingInfoTextElement
      component="div"
      styleProps={{
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
    </BuildingInfoTextElement>
  </Box>
)

const BuildingInfoSectionDivider = () => (
  <Box
    styleProps={{
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
    styleProps={{
      mt: '1rem',
    }}
  >
    <BuildingInfoTextElement
      styleProps={{
        fontSize: '0.75rem',
        fontWeight: 400,
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
      :
    </BuildingInfoTextElement>
    <BuildingInfoTextElement
      component="div"
      styleProps={{
        fontSize: '0.75rem',
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: '#111111',
      }}
    >
      <BuildingInfoValueText value={row} align="left" />
    </BuildingInfoTextElement>
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
    styleProps={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
      columnGap: '1rem',
      alignItems: 'start',
      minWidth: 0,
    }}
  >
    <BuildingInfoTextElement
      styleProps={{
        ...textSx,
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
    </BuildingInfoTextElement>
    <BuildingInfoTextElement
      component="div"
      styleProps={{
        ...textSx,
        minWidth: 0,
        textAlign: 'right',
      }}
    >
      <BuildingInfoValueText value={row} variant={valueVariant} />
    </BuildingInfoTextElement>
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
      styleProps={{
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
      styleProps={{
        mt: '1.75rem',
      }}
    >
      <BuildingInfoSectionDivider />
      <Box
        styleProps={{
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
      styleProps={{
        mt: '1.75rem',
      }}
    >
      <BuildingInfoSectionDivider />
      <Box styleProps={{ py: '0.875rem' }}>
        {previousClassRow != null && (
          <BuildingInfoSectionLine
            row={previousClassRow}
            valueVariant="energyClassBadge"
          />
        )}
        {measuresRow != null && (
          <Box
            data-section-row-id={measuresRow.id}
            styleProps={{
              mt: '1.375rem',
            }}
          >
            <BuildingInfoTextElement
              styleProps={{
                ...textSx,
                color: '#111111',
              }}
            >
              <BuildingInfoText text={measuresRow.label} />
            </BuildingInfoTextElement>
            <BuildingInfoTextElement
              component="div"
              styleProps={{
                ...textSx,
                mt: '0.375rem',
                color: '#111111',
              }}
            >
              <BuildingInfoValueText value={measuresRow} align="left" />
            </BuildingInfoTextElement>
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
      styleProps={{
        mt: '1.75rem',
      }}
    >
      <BuildingInfoSectionDivider />
      <Box styleProps={{ py: '0.875rem' }}>
        {rows.map((row) => (
          <Box key={row.id} data-section-row-id={row.id}>
            <BuildingInfoTextElement
              styleProps={{
                ...textSx,
                color: '#111111',
              }}
            >
              <BuildingInfoText text={row.label} />
            </BuildingInfoTextElement>
            <BuildingInfoTextElement
              component="div"
              styleProps={{
                ...textSx,
                mt: '0.375rem',
                color: '#111111',
              }}
            >
              <BuildingInfoValueText value={row} align="left" />
            </BuildingInfoTextElement>
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
    styleProps={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, auto)',
      columnGap: '0.75rem',
      alignItems: 'baseline',
      borderTop: '0.3px solid #d7d7d7',
      py: '0.625rem',
    }}
  >
    <BuildingInfoTextElement styleProps={{ ...textSx, color: '#111111' }}>
      <BuildingInfoText text={value.label} />
    </BuildingInfoTextElement>
    <BuildingInfoTextElement component="div" styleProps={{ ...textSx, textAlign: 'right' }}>
      <BuildingInfoValueText value={value} />
    </BuildingInfoTextElement>
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
  const button = (
    <BuildingInfoButton
      type="button"
      aria-label={t(metric.ariaLabelKey)}
      aria-pressed={active}
      data-primary-metric-id={metric.id}
      onClick={onClick}
      styleProps={{
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
        <BuildingInfoTextElement
          component="span"
          styleProps={{
            ...energyControlTextSx,
            color: '#ffffff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </BuildingInfoTextElement>
      )}
    </BuildingInfoButton>
  )

  if (active) {
    return button
  }

  return (
    <SimpleTooltip title={label} side="top">
      {button}
    </SimpleTooltip>
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
    <BuildingInfoButton
      type="button"
      aria-label={t(submetric.ariaLabelKey)}
      aria-pressed={selected}
      data-energy-submetric-id={submetric.id}
      onClick={onClick}
      styleProps={{
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
        styleProps={{
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
      <BuildingInfoTextElement
        component="span"
        styleProps={{
          ...energyControlTextSx,
          color: '#111111',
          maxWidth: '12rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <BuildingInfoText text={submetric.label} />
      </BuildingInfoTextElement>
    </BuildingInfoButton>
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
      styleProps={{
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
  const { t } = useTranslate('energiakartta')
  const [activePrimaryMetricId, setActivePrimaryMetricId] =
    React.useState<EnergymapBuildingInfoPrimaryMetricId>(
      controls?.defaultPrimaryMetricId ?? 'energy'
    )
  const [selectedEnergySubmetricIds, setSelectedEnergySubmetricIds] =
    React.useState<EnergymapBuildingInfoEnergySubmetricId[]>(
      controls?.defaultEnergySubmetricIds ?? []
    )
  const [selectedYear, setSelectedYear] = React.useState(
    controls?.yearOptions[0]?.value ?? ''
  )

  /* eslint-disable react-hooks/set-state-in-effect -- Keep local control state valid when the selected building data changes. */
  React.useEffect(() => {
    if (controls == null) {
      return
    }

    const validPrimaryMetricIds = new Set(
      controls.primaryMetrics.map((metric) => metric.id)
    )
    const validSubmetricIds = new Set(
      controls.energySubmetrics.map((submetric) => submetric.id)
    )

    setActivePrimaryMetricId((current) =>
      validPrimaryMetricIds.has(current)
        ? current
        : controls.defaultPrimaryMetricId
    )
    setSelectedEnergySubmetricIds((current) => {
      const next = current.filter((id) => validSubmetricIds.has(id))
      return next.length > 0 ? next : controls.defaultEnergySubmetricIds
    })
    setSelectedYear((current) =>
      controls.yearOptions.some((option) => option.value === current)
        ? current
        : controls.yearOptions[0]?.value ?? ''
    )
  }, [controls])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (controls == null) {
    return null
  }

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
      styleProps={{
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
    setSelectedEnergySubmetricIds((current) =>
      current.includes(submetricId)
        ? current.filter((id) => id !== submetricId)
        : [...current, submetricId]
    )
  }

  const handleYearChange = (event: FormSelectionEvent<string>) => {
    setSelectedYear(event.target.value)
  }

  return (
    <Box
      data-section-id={section.id}
      data-testid="building-info-energy-consumption-section"
      styleProps={{
        mt: '2.25rem',
      }}
    >
      {section.title != null && (
        <BuildingInfoTextElement
          styleProps={{
            ...textSx,
            mb: '1rem',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          <BuildingInfoText text={section.title} />
        </BuildingInfoTextElement>
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
        styleProps={{
          mt: '1.125rem',
          maxWidth: '284px',
          gap: '0.875rem',
        }}
        selectWrapperSx={{
          width: '90px',
        }}
        selectSx={{
          height: '22px',
          minHeight: '22px',
          backgroundColor: '#f0f0f0',
          fontWeight: 700,
          letterSpacing: 0,
          '&[data-disabled]': {
            opacity: 1,
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
        styleProps={{
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
            onClick={() => setActivePrimaryMetricId(metric.id)}
          />
        ))}
      </Box>
      {activePrimaryMetric?.id === 'energy' ? (
        <>
          <Box
            data-testid="building-info-energy-submetric-row"
            styleProps={{
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
            styleProps={{
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
    styleProps={{
      mt: '1.5rem',
    }}
  >
    <Box
      styleProps={{
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
      <BuildingInfoTextElement
        styleProps={{
          fontSize: '0.5625rem',
          fontWeight: 400,
          lineHeight: '0.875rem',
          letterSpacing: '0.18em',
          color: metric.id === 'total' ? '#ffffff' : '#111111',
        }}
      >
        <BuildingInfoText text={metric.label} />
      </BuildingInfoTextElement>
    </Box>
    <Box styleProps={{ mt: '0.75rem' }}>
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
      styleProps={{
        mt: '2rem',
        pt: '1.25rem',
        borderTop: '0.3px solid #cfcfcf',
      }}
    >
      <Box
        styleProps={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <Box styleProps={{ minWidth: 0 }}>
          <BuildingInfoTextElement
            styleProps={{
              ...textSx,
              color: '#111111',
              fontWeight: 400,
            }}
          >
            <BuildingInfoText text={scenario.label} />
          </BuildingInfoTextElement>
        </Box>
        {savingsValue != null && (
          <Box
            styleProps={{
              px: '0.75rem',
              py: '0.125rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(163, 71, 255, 0.1)',
              whiteSpace: 'nowrap',
            }}
          >
            <BuildingInfoTextElement styleProps={{ ...textSx, color: '#a347ff' }}>
              <BuildingInfoValueText value={savingsValue} />
            </BuildingInfoTextElement>
          </Box>
        )}
      </Box>
      <Box
        styleProps={{
          mt: '1rem',
          display: 'flex',
          flexDirection: { mobile: 'column', desktop: 'row' },
          alignItems: { mobile: 'stretch', desktop: 'flex-start' },
          gap: { mobile: '1rem', desktop: '1.25rem' },
        }}
      >
        <Box styleProps={{ flex: '1 1 auto', minWidth: 0 }}>
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
            styleProps={{
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
      styleProps={{
        mt: '2.25rem',
      }}
    >
      {showComparisonIcon && (
        <RenovationIcon
          width="31px"
          height="25px"
          styleProps={{
            mb: '2.125rem',
          }}
        />
      )}
      {section.title != null && (
        <BuildingInfoTextElement
          styleProps={{
            ...textSx,
            mb: '1rem',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          <BuildingInfoText text={section.title} />
        </BuildingInfoTextElement>
      )}
      {section.description != null && (
        <BuildingInfoTextElement
          styleProps={{
            ...textSx,
            mb: '1.25rem',
            color: '#111111',
          }}
        >
          <BuildingInfoText text={section.description} />
        </BuildingInfoTextElement>
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
  isMobileLayout = false,
}: {
  panelId: EnergymapBuildingInfoPanelId
  isMobileLayout?: boolean
}) => {
  const headingGraphicLeft = isMobileLayout
    ? 'var(--building-info-heading-graphic-left, 1.5rem)'
    : 'var(--building-info-heading-graphic-left, 0px)'

  if (panelId === 'energyConsumption') {
    return (
      <BuildingInfoDecorativeImage
        src={BUILDING_INFO_ASSETS.energyLightning}
        width="18px"
        height="28px"
        data-testid="building-info-heading-graphic-energyConsumption"
        styleProps={{
          position: 'absolute',
          top: 'var(--building-info-heading-graphic-top, 3.125rem)',
          left: headingGraphicLeft,
        }}
      />
    )
  }

  if (panelId === 'renovationRecommendations') {
    return (
      <RenovationIcon
        data-testid="building-info-heading-graphic-renovationRecommendations"
        styleProps={{
          position: 'absolute',
          top: 'var(--building-info-heading-graphic-top, 3.25rem)',
          left: headingGraphicLeft,
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
      styleProps={{
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
  isMobileLayout = false,
  styleProps,
}: {
  panel: EnergymapBuildingInfoPanel
  titleId: string
  accentColor: string
  sections?: EnergymapBuildingInfoSection[]
  footer?: React.ReactNode
  showDescription?: boolean
  showHeroGraphic?: boolean
  isMobileLayout?: boolean
  styleProps?: PandaStyleProp
}) => (
  <Box
    styleProps={[
      {
        boxSizing: 'border-box',
        position: 'relative',
      },
      ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
    ]}
  >
    <BuildingInfoPanelHeadingGraphic
      panelId={panel.id}
      isMobileLayout={isMobileLayout}
    />
    <BuildingInfoTextElement
      id={titleId}
      styleProps={{
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
    </BuildingInfoTextElement>
    <Box
      styleProps={{
        mt: 'var(--building-info-heading-divider-mt, 1.375rem)',
        borderTop: '0.3px solid #cfcfcf',
      }}
    />
    {showHeroGraphic && <BuildingInfoPanelHeroGraphic panelId={panel.id} />}
    {showDescription && panel.description != null && (
      <BuildingInfoTextElement
        styleProps={{
          ...textSx,
          mt:
            panel.id === 'renovationRecommendations' ? 0 : '1.875rem',
          color: '#111111',
        }}
      >
        <BuildingInfoText text={panel.description} />
      </BuildingInfoTextElement>
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
  isMobileLayout,
}: {
  panelId: EnergymapBuildingInfoPanelId
  index: number
  panelCount: number
  isMobileLayout: boolean
}): PandaStyleProp => {
  const isFirstPanel = index === 0
  const isLastPanel = index === panelCount - 1

  return {
    width: isMobileLayout
      ? 'min(16.25rem, calc(100vw - 6rem))'
      : `min(${PANEL_CONTENT_WIDTHS[panelId]}, calc(100% - 5rem))`,
    maxWidth: '100%',
    mx: 'auto',
    pt: isMobileLayout
      ? isFirstPanel
        ? '7.5rem'
        : '6.25rem'
      : isFirstPanel
        ? '6.25rem'
        : '5rem',
    pb: isMobileLayout
      ? isLastPanel
        ? '8rem'
        : '5rem'
      : isLastPanel
        ? '6.5rem'
        : '5rem',
    '--building-info-heading-graphic-left': isMobileLayout ? '1.5rem' : '0px',
  }
}

const getDesktopGridPanelContentSx = ({
  panelId,
}: {
  panelId: EnergymapBuildingInfoPanelId
}): PandaStyleProp => ({
  width: `min(${PANEL_CONTENT_WIDTHS[panelId]}, calc(100% - 3rem))`,
  maxWidth: '100%',
  pt: DESKTOP_HEADING_TOP,
  pb: DESKTOP_SECTION_BOTTOM_PADDING,
  mx: 'auto',
  '--building-info-heading-graphic-top': DESKTOP_HEADING_GRAPHIC_TOP,
  '--building-info-heading-divider-mt': DESKTOP_HEADING_DIVIDER_MARGIN_TOP,
  '--building-info-heading-graphic-left': '0px',
})

const BuildingInfoPanelSection = ({
  panel,
  tabId,
  bodySx,
  footer,
  sections,
  showDescription,
  showHeroGraphic,
  isMobileLayout,
  styleProps,
}: {
  panel: EnergymapBuildingInfoPanel
  tabId: BuildingInfoTabId
  bodySx?: PandaStyleProp
  footer?: React.ReactNode
  sections?: EnergymapBuildingInfoSection[]
  showDescription?: boolean
  showHeroGraphic?: boolean
  isMobileLayout?: boolean
  styleProps?: PandaStyleProp
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
      styleProps={[
        {
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          backgroundColor: 'inherit',
          flexShrink: 0,
        },
        ...(Array.isArray(styleProps) ? styleProps : [styleProps]),
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
        isMobileLayout={isMobileLayout}
        styleProps={bodySx}
      />
    </Box>
  )
}

const BuildingInfoStackedTabPageSection = ({
  panel,
  tabId,
  index,
  panelCount,
  isMobileLayout,
}: {
  panel: EnergymapBuildingInfoPanel
  tabId: BuildingInfoTabId
  index: number
  panelCount: number
  isMobileLayout: boolean
}) => {
  return (
    <Box
      styleProps={{
        width: '100%',
        minWidth: 0,
        backgroundColor: PANEL_BACKGROUNDS[panel.id],
        flexShrink: 0,
      }}
    >
      <BuildingInfoPanelSection
        panel={panel}
        tabId={tabId}
        isMobileLayout={isMobileLayout}
        bodySx={getStackedTabPagePanelContentSx({
          panelId: panel.id,
          index,
          panelCount,
          isMobileLayout,
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
    styleProps={{
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
    styleProps={{
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
  <BuildingInfoTextElement
    data-testid="building-info-renovation-reference-year-note"
    styleProps={{
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
  </BuildingInfoTextElement>
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
      styleProps={{
        display: 'grid',
        gridTemplateColumns: '440fr 560fr',
        minHeight: '100%',
      }}
    >
      <Box
        styleProps={{
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
          <BuildingInfoTextElement
            id={titleId}
            styleProps={{
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
          </BuildingInfoTextElement>
        )}
        <Box
          styleProps={{
            mt: '1.875rem',
            borderTop: '0.3px solid #cfcfcf',
          }}
        />
        {section?.description != null && (
          <BuildingInfoTextElement
            styleProps={{
              ...textSx,
              mt: '1.875rem',
              maxWidth: '20.375rem',
              color: '#111111',
            }}
          >
            <BuildingInfoText text={section.description} />
          </BuildingInfoTextElement>
        )}
      </Box>
      <Box
        styleProps={{
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
    styleProps={{
      width: `min(${PANEL_CONTENT_WIDTHS.buildingDetails}, calc(100% - 4rem))`,
      maxWidth: '100%',
      ml: '4.375rem',
      pt: '11.75rem',
      pb: DESKTOP_SECTION_BOTTOM_PADDING,
    }}
  >
    <BuildingInfoTextElement
      styleProps={{
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
    </BuildingInfoTextElement>
    <Box
      styleProps={{
        mt: '0.75rem',
        borderTop: '0.3px solid #cfcfcf',
      }}
    />
    <BuildingInfoTextElement
      styleProps={{
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
    </BuildingInfoTextElement>
    <Box
      aria-hidden="true"
      data-testid="building-info-renovation-effectiveness-indicator"
      styleProps={{
        mt: '3rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.625rem',
      }}
    >
      <Box
        styleProps={{
          width: '25px',
          height: '10px',
          borderRadius: '5px',
          backgroundColor: '#111111',
        }}
      />
      <Box
        styleProps={{
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
  const energyPanelBodySx =
    energyPanel != null
      ? getDesktopGridPanelContentSx({
          panelId: energyPanel.id,
        })
      : undefined
  const resolvedEnergyPanelBodySx: PandaStyleProp =
    tabId === 'renovation' && energyPanelBodySx != null
      ? {
          ...(energyPanelBodySx as Record<string, unknown>),
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          height: '100%',
        }
      : energyPanelBodySx

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
            styleProps={{ minHeight: '100%', height: '100%' }}
            bodySx={resolvedEnergyPanelBodySx}
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
            styleProps={{ minHeight: '100%', height: '100%' }}
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
            styleProps={{ minHeight: '100%', height: '100%' }}
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
  isMobileLayout,
}: {
  tabId: BuildingInfoTabId
  panels: EnergymapBuildingInfoPanel[]
  isMobileLayout: boolean
}) => (
  <>
    {panels.map((panel, index) => (
      <BuildingInfoStackedTabPageSection
        key={panel.id}
        panel={panel}
        tabId={tabId}
        index={index}
        panelCount={panels.length}
        isMobileLayout={isMobileLayout}
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
      styleProps={{
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
          isMobileLayout={useMobileLayout}
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
  const lastAppliedActiveTabId = React.useRef<
    BuildingInfoTabId | undefined
  >(undefined)
  const lastNotifiedActiveTabId = React.useRef<
    BuildingInfoTabId | undefined
  >(undefined)
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
  <Box
    component="img"
    src="/files/img/energiakartta/sidebar/building-info-two-panel.svg"
    alt=""
    aria-hidden="true"
    styleProps={{
      width: '26.8px',
      height: '21.8px',
    }}
  />
)

const ThreePanelIcon = () => (
  <Box
    styleProps={{
      position: 'relative',
      width: '18.75px',
      height: '19.5px',
      overflow: 'visible',
    }}
  >
    <Box
      component="img"
      src="/files/img/energiakartta/sidebar/building-info-three-panel-left.svg"
      alt=""
      aria-hidden="true"
      styleProps={{
        position: 'absolute',
        top: '8px',
        left: 0,
        width: '11.75px',
        height: '14.65px',
      }}
    />
    <Box
      component="img"
      src="/files/img/energiakartta/sidebar/building-info-three-panel-right.svg"
      alt=""
      aria-hidden="true"
      styleProps={{
        position: 'absolute',
        top: '1px',
        right: 0,
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
}): PandaStyleProp => {
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
      ? 'calc(var(--z-index-drawer) + 14)'
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
  const tooltipPlacement = orientation === 'row' ? 'top' : 'right'

  return (
    <Box
      data-testid="building-info-action-rail"
      data-orientation={orientation}
      styleProps={{
        display: 'flex',
        flexDirection: orientation,
        gap: `${BUILDING_INFO_ACTION_BUTTON_GAP_PX}px`,
        pointerEvents: 'auto',
      }}
    >
      <SimpleTooltip title={ariaLabels.overview} side={tooltipPlacement}>
        <BuildingInfoButton
          aria-label={ariaLabels.overview}
          aria-pressed={activeMode === 'twoPanel' && !isCollapsed}
          data-building-info-mode="twoPanel"
          onClick={() => onModeChange('twoPanel')}
          styleProps={actionButtonSx({
            active: activeMode === 'twoPanel' && !isCollapsed,
          })}
        >
          <TwoPanelIcon />
        </BuildingInfoButton>
      </SimpleTooltip>
      <SimpleTooltip title={ariaLabels.renovation} side={tooltipPlacement}>
        <BuildingInfoButton
          aria-label={ariaLabels.renovation}
          aria-pressed={activeMode === 'threePanel' && !isCollapsed}
          data-building-info-mode="threePanel"
          onClick={() => onModeChange('threePanel')}
          styleProps={actionButtonSx({
            active: activeMode === 'threePanel' && !isCollapsed,
          })}
        >
          <ThreePanelIcon />
        </BuildingInfoButton>
      </SimpleTooltip>
    </Box>
  )
}
