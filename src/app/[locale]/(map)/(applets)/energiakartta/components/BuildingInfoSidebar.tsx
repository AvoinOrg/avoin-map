'use client'

import React from 'react'
import {
  Box,
  IconButton,
  SxProps,
  Theme,
  Tooltip,
  Typography,
} from '@mui/material'
import ConstructionIcon from '@mui/icons-material/Construction'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import TText from '#/components/common/TText'
import { Cross } from '#/components/icons'
import type {
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
} from '../common/buildingInfo'

export type BuildingInfoDesktopMode = 'twoPanel' | 'threePanel'

type BuildingInfoActionLabels = {
  close: string
  collapse: string
  overview: string
  renovation: string
}

type BuildingInfoDesktopSidebarProps = {
  mode: BuildingInfoDesktopMode
  panels: EnergymapBuildingInfoPanel[]
  ariaLabels: Pick<BuildingInfoActionLabels, 'close' | 'collapse'>
  onClose: () => void
  onCollapse: () => void
}

type BuildingInfoMobileSidebarProps = BuildingInfoDesktopSidebarProps

type BuildingInfoActionRailProps = {
  activeMode: BuildingInfoDesktopMode
  isCollapsed: boolean
  ariaLabels: Pick<BuildingInfoActionLabels, 'overview' | 'renovation'>
  onModeChange: (mode: BuildingInfoDesktopMode) => void
}

type BuildingInfoMobileActionRowProps = BuildingInfoActionRailProps

type BuildingInfoPanelSlotContentProps = {
  panel: EnergymapBuildingInfoPanel
  mode: BuildingInfoDesktopMode
  presentation?: 'desktop' | 'mobile'
  mobileIndex?: number
  mobilePanelCount?: number
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

const PANEL_CONTENT_WIDTHS: Record<EnergymapBuildingInfoPanelId, string> = {
  energyConsumption: '17.625rem',
  renovationRecommendations: '26.875rem',
  buildingDetails: '16.25rem',
}

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

const BUILDING_INFO_SCROLL_OPTIONS = {
  overflow: { x: 'hidden', y: 'scroll' },
  scrollbars: {
    theme: 'os-theme-dark',
    visibility: 'auto',
    autoHide: 'scroll',
    autoHideDelay: 600,
  },
} as const

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

export const BUILDING_INFO_MOBILE_TOGGLE_RIGHT_OFFSET = '35px'

const textSx = {
  fontSize: '0.625rem',
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
} as const

const chromeButtonSx = {
  width: '36px',
  height: '36px',
  borderRadius: '5px',
  color: '#111111',
  backgroundColor: '#f4f4f4',
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.12)',
  '&:hover': {
    backgroundColor: '#e8d0ff',
  },
} as const

const actionButtonSx = ({
  active,
}: {
  active: boolean
}) => ({
  width: '45px',
  height: '45px',
  minWidth: '45px',
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

export const getBuildingInfoPanelIds = (
  mode: BuildingInfoDesktopMode
) => PANEL_IDS_BY_MODE[mode]

export const getBuildingInfoDesktopPanelIds = getBuildingInfoPanelIds

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

const isPlainEnergyClassText = (text: EnergymapBuildingInfoText) =>
  text.type === 'plain' && /^[A-G]$/i.test(text.text.trim())

const BuildingInfoScrollArea = ({
  children,
  testId,
  sx,
}: {
  children: React.ReactNode
  testId: string
  sx?: SxProps<Theme>
}) => (
  <Box
    sx={[
      {
        position: 'relative',
        height: '100%',
        minHeight: 0,
        width: '100%',
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <OverlayScrollbarsComponent
      className="osScroll"
      data-testid={testId}
      options={BUILDING_INFO_SCROLL_OPTIONS}
      style={{
        height: '100%',
        minHeight: 0,
        width: '100%',
      }}
    >
      {children}
    </OverlayScrollbarsComponent>
  </Box>
)

const BuildingInfoDecorativeImage = ({
  src,
  width,
  height,
  sx,
}: {
  src: string
  width: string
  height: string
  sx?: SxProps<Theme>
}) => (
  <Box
    component="img"
    src={src}
    alt=""
    aria-hidden="true"
    sx={[
      {
        display: 'block',
        width,
        height,
        flexShrink: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
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
  sx,
}: {
  src: string
  dimensions: BuildingInfoGraphicDimensions
  maxWidth?: string
  testId: string
  sx?: SxProps<Theme>
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
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Box
      component="img"
      src={src}
      alt=""
      aria-hidden="true"
      sx={{
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
  sx?: SxProps<Theme>
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
      ...(Array.isArray(sx) ? sx : [sx]),
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
        <Tooltip
          title={
            <Box component="span">
              <BuildingInfoText text={value.text} />
            </Box>
          }
          arrow
          enterTouchDelay={0}
          leaveTouchDelay={5000}
          placement="top"
        >
          <Box
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
            <ConstructionIcon
              data-testid="building-info-unavailable-value-icon"
              aria-hidden="true"
              sx={{ fontSize: '1rem' }}
            />
            <Box
              component="span"
              data-testid="building-info-unavailable-value-reason"
              style={VISUALLY_HIDDEN_STYLE}
            >
              <BuildingInfoText text={value.text} />
            </Box>
          </Box>
        </Tooltip>
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
      <Typography
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
      </Typography>
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
    <Typography
      sx={{
        ...textSx,
        color: '#111111',
      }}
    >
      <BuildingInfoText text={row.label} />
    </Typography>
    <Typography
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
    </Typography>
  </Box>
)

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
    <Typography sx={{ ...textSx, color: '#111111' }}>
      <BuildingInfoText text={value.label} />
    </Typography>
    <Typography component="div" sx={{ ...textSx, textAlign: 'right' }}>
      <BuildingInfoValueText value={value} />
    </Typography>
  </Box>
)

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
      <Typography
        sx={{
          fontSize: '0.5625rem',
          fontWeight: 700,
          lineHeight: '0.875rem',
          letterSpacing: '0.18em',
          color: metric.id === 'total' ? '#ffffff' : '#111111',
        }}
      >
        <BuildingInfoText text={metric.label} />
      </Typography>
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
          <Typography
            sx={{
              ...textSx,
              color: '#111111',
              fontWeight: 700,
            }}
          >
            <BuildingInfoText text={scenario.label} />
          </Typography>
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
            <Typography sx={{ ...textSx, color: '#a347ff' }}>
              <BuildingInfoValueText value={savingsValue} />
            </Typography>
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
        <Typography
          sx={{
            ...textSx,
            mb: '1rem',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          <BuildingInfoText text={section.title} />
        </Typography>
      )}
      {section.description != null && (
        <Typography
          sx={{
            ...textSx,
            mb: '1.25rem',
            color: '#111111',
          }}
        >
          <BuildingInfoText text={section.description} />
        </Typography>
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

const getPanelWidth = ({
  mode,
  panelId,
}: {
  mode: BuildingInfoDesktopMode
  panelId: EnergymapBuildingInfoPanelId
}) => {
  if (mode === 'twoPanel') {
    return '23.75rem'
  }

  if (panelId === 'renovationRecommendations') {
    return '38.8889%'
  }

  return '30.5556%'
}

const getPanelContentSx = ({
  mode,
  panelId,
}: {
  mode: BuildingInfoDesktopMode
  panelId: EnergymapBuildingInfoPanelId
}) => {
  if (mode === 'twoPanel') {
    return {
      ml: panelId === 'energyConsumption' ? '3rem' : '3.75rem',
      width:
        panelId === 'energyConsumption'
          ? '16.25rem'
          : PANEL_CONTENT_WIDTHS[panelId],
    }
  }

  if (panelId === 'energyConsumption') {
    return {
      ml: 'clamp(2.5rem, 5.56vw, 5rem)',
      width: 'min(17.625rem, calc(100% - 5rem))',
    }
  }

  if (panelId === 'renovationRecommendations') {
    return {
      ml: 'clamp(2.5rem, 4.17vw, 3.75rem)',
      width: 'min(26.875rem, calc(100% - 5rem))',
    }
  }

  return {
    ml: 'clamp(2.5rem, 4.86vw, 4.375rem)',
    width: 'min(16.25rem, calc(100% - 5rem))',
  }
}

const getVisibleBuildingInfoPanels = ({
  mode,
  panels,
}: {
  mode: BuildingInfoDesktopMode
  panels: EnergymapBuildingInfoPanel[]
}) => {
  const panelsById = new Map(panels.map((panel) => [panel.id, panel]))

  return getBuildingInfoPanelIds(mode)
    .map((panelId) => panelsById.get(panelId))
    .filter((panel): panel is EnergymapBuildingInfoPanel => panel != null)
}

const getDesktopPanelAccentColor = ({
  mode,
  panelId,
}: {
  mode: BuildingInfoDesktopMode
  panelId: EnergymapBuildingInfoPanelId
}) =>
  mode === 'threePanel' && panelId === 'buildingDetails'
    ? '#111111'
    : PANEL_ACCENTS[panelId]

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
          top: '3.125rem',
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
          top: '3.25rem',
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
  sx,
}: {
  panel: EnergymapBuildingInfoPanel
  titleId: string
  accentColor: string
  sx?: SxProps<Theme>
}) => (
  <Box
    sx={[
      {
        boxSizing: 'border-box',
        position: 'relative',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <BuildingInfoPanelHeadingGraphic panelId={panel.id} />
    <Typography
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
    </Typography>
    <Box
      sx={{
        mt: '1.375rem',
        borderTop: '0.3px solid #cfcfcf',
      }}
    />
    <BuildingInfoPanelHeroGraphic panelId={panel.id} />
    {panel.description != null && (
      <Typography
        sx={{
          ...textSx,
          mt:
            panel.id === 'renovationRecommendations' ? 0 : '1.875rem',
          color: '#111111',
        }}
      >
        <BuildingInfoText text={panel.description} />
      </Typography>
    )}
    {panel.sections.map((section) => (
      <BuildingInfoSectionBlock
        key={section.id}
        section={section}
        accentColor={accentColor}
      />
    ))}
  </Box>
)

const BuildingInfoDesktopPanelSection = ({
  panel,
  mode,
}: {
  panel: EnergymapBuildingInfoPanel
  mode: BuildingInfoDesktopMode
}) => {
  const titleId = React.useId()
  const accentColor = getDesktopPanelAccentColor({
    mode,
    panelId: panel.id,
  })

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      data-testid={`building-info-panel-${panel.id}`}
      data-panel-id={panel.id}
      sx={{
        width: '100%',
        minWidth: 0,
        height: '100%',
        minHeight: 0,
        backgroundColor: PANEL_BACKGROUNDS[panel.id],
        overflow: 'hidden',
      }}
    >
      <BuildingInfoScrollArea testId={`building-info-scroll-${panel.id}`}>
        <BuildingInfoPanelBody
          panel={panel}
          titleId={titleId}
          accentColor={accentColor}
          sx={{
            minHeight: '100%',
            pt: '7.375rem',
            pb: '4rem',
            boxSizing: 'border-box',
            ...getPanelContentSx({ mode, panelId: panel.id }),
          }}
        />
      </BuildingInfoScrollArea>
    </Box>
  )
}

const BuildingInfoPanelColumn = ({
  panel,
  mode,
}: {
  panel: EnergymapBuildingInfoPanel
  mode: BuildingInfoDesktopMode
}) => (
  <Box
    sx={{
      flex: `0 0 ${getPanelWidth({ mode, panelId: panel.id })}`,
      width: getPanelWidth({ mode, panelId: panel.id }),
      minWidth: 0,
      height: '100%',
      minHeight: 0,
    }}
  >
    <BuildingInfoDesktopPanelSection panel={panel} mode={mode} />
  </Box>
)

export const BuildingInfoDesktopChrome = ({
  mode,
  ariaLabels,
  onClose,
  onCollapse,
}: {
  mode: BuildingInfoDesktopMode
  ariaLabels: Pick<BuildingInfoActionLabels, 'close' | 'collapse'>
  onClose: () => void
  onCollapse: () => void
}) => (
  <Box
    data-testid="building-info-desktop-chrome"
    sx={(theme) => ({
      position: 'absolute',
      top: mode === 'twoPanel' ? '35px' : '50px',
      right: mode === 'twoPanel' ? '60px' : '70px',
      zIndex: theme.zIndex.drawer + 13,
      display: 'flex',
      gap: '4px',
      pointerEvents: 'auto',
    })}
  >
    <Tooltip title={ariaLabels.collapse} arrow placement="bottom">
      <IconButton
        aria-label={ariaLabels.collapse}
        onClick={onCollapse}
        size="small"
        sx={chromeButtonSx}
      >
        <KeyboardDoubleArrowLeftIcon sx={{ fontSize: '1.05rem' }} />
      </IconButton>
    </Tooltip>
    <Tooltip title={ariaLabels.close} arrow placement="bottom">
      <IconButton
        aria-label={ariaLabels.close}
        onClick={onClose}
        size="small"
        sx={chromeButtonSx}
      >
        <Cross sx={{ width: '0.75rem', height: '0.75rem' }} />
      </IconButton>
    </Tooltip>
  </Box>
)

export const BuildingInfoDesktopSidebar = ({
  mode,
  panels,
  ariaLabels,
  onClose,
  onCollapse,
}: BuildingInfoDesktopSidebarProps) => {
  const visiblePanels = React.useMemo(
    () => getVisibleBuildingInfoPanels({ mode, panels }),
    [mode, panels]
  )

  if (visiblePanels.length === 0) {
    return null
  }

  return (
    <Box
      data-testid="building-info-desktop-sidebar"
      data-building-info-mode={mode}
      sx={{
        position: 'relative',
        display: 'flex',
        height: '100%',
        minHeight: 0,
        width: mode === 'twoPanel' ? '47.5rem' : '100vw',
        maxWidth: '100vw',
        overflow: 'hidden',
        pointerEvents: 'auto',
      }}
    >
      {visiblePanels.map((panel) => (
        <BuildingInfoPanelColumn key={panel.id} panel={panel} mode={mode} />
      ))}
      <BuildingInfoDesktopChrome
        mode={mode}
        ariaLabels={ariaLabels}
        onClose={onClose}
        onCollapse={onCollapse}
      />
    </Box>
  )
}

export const BuildingInfoMobileChrome = ({
  ariaLabels,
  onClose,
  onCollapse,
}: {
  ariaLabels: Pick<BuildingInfoActionLabels, 'close' | 'collapse'>
  onClose: () => void
  onCollapse: () => void
}) => (
  <Box
    sx={(theme) => ({
      position: 'fixed',
      top: 'calc(env(safe-area-inset-top, 0px) + 26px)',
      right: BUILDING_INFO_MOBILE_TOGGLE_RIGHT_OFFSET,
      zIndex: theme.zIndex.drawer + 13,
      display: 'flex',
      gap: '4px',
      pointerEvents: 'auto',
    })}
  >
    <Tooltip title={ariaLabels.collapse} arrow placement="bottom">
      <IconButton
        aria-label={ariaLabels.collapse}
        onClick={onCollapse}
        size="small"
        sx={chromeButtonSx}
      >
        <KeyboardDoubleArrowLeftIcon sx={{ fontSize: '1.05rem' }} />
      </IconButton>
    </Tooltip>
    <Tooltip title={ariaLabels.close} arrow placement="bottom">
      <IconButton
        aria-label={ariaLabels.close}
        onClick={onClose}
        size="small"
        sx={chromeButtonSx}
      >
        <Cross sx={{ width: '0.75rem', height: '0.75rem' }} />
      </IconButton>
    </Tooltip>
  </Box>
)

const BuildingInfoMobilePanelSection = ({
  panel,
  index,
  panelCount,
}: {
  panel: EnergymapBuildingInfoPanel
  index: number
  panelCount: number
}) => {
  const titleId = React.useId()

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      data-testid={`building-info-panel-${panel.id}`}
      data-panel-id={panel.id}
      sx={{
        width: '100%',
        minWidth: 0,
        backgroundColor: PANEL_BACKGROUNDS[panel.id],
      }}
    >
      <BuildingInfoPanelBody
        panel={panel}
        titleId={titleId}
        accentColor={PANEL_ACCENTS[panel.id]}
        sx={{
          width: 'min(16.25rem, calc(100vw - 6rem))',
          maxWidth: '100%',
          mx: 'auto',
          pt: index === 0 ? '7.5rem' : '6.25rem',
          pb: index === panelCount - 1 ? '8rem' : '5rem',
        }}
      />
    </Box>
  )
}

export const BuildingInfoPanelSlotContent = ({
  panel,
  mode,
  presentation = 'desktop',
  mobileIndex = 0,
  mobilePanelCount = 1,
}: BuildingInfoPanelSlotContentProps) => {
  if (presentation === 'mobile') {
    return (
      <BuildingInfoMobilePanelSection
        panel={panel}
        index={mobileIndex}
        panelCount={mobilePanelCount}
      />
    )
  }

  return <BuildingInfoDesktopPanelSection panel={panel} mode={mode} />
}

export const BuildingInfoMobileSidebar = ({
  mode,
  panels,
  ariaLabels,
  onClose,
  onCollapse,
}: BuildingInfoMobileSidebarProps) => {
  const visiblePanels = React.useMemo(
    () => getVisibleBuildingInfoPanels({ mode, panels }),
    [mode, panels]
  )

  if (visiblePanels.length === 0) {
    return null
  }

  return (
    <Box
      data-testid="building-info-mobile-sidebar"
      data-building-info-mode={mode}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        backgroundColor: '#f9f9f9',
        pointerEvents: 'auto',
      }}
    >
      <BuildingInfoMobileChrome
        ariaLabels={ariaLabels}
        onClose={onClose}
        onCollapse={onCollapse}
      />
      <BuildingInfoScrollArea testId="building-info-mobile-scroll">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
          }}
        >
          {visiblePanels.map((panel, index) => (
            <BuildingInfoMobilePanelSection
              key={panel.id}
              panel={panel}
              index={index}
              panelCount={visiblePanels.length}
            />
          ))}
        </Box>
      </BuildingInfoScrollArea>
    </Box>
  )
}

const ThreePanelIcon = () => (
  <Box
    sx={{
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
      sx={{
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
      sx={{
        position: 'absolute',
        top: '1px',
        right: 0,
        width: '11.75px',
        height: '14.65px',
      }}
    />
  </Box>
)

export const BuildingInfoActionRail = ({
  activeMode,
  isCollapsed,
  ariaLabels,
  onModeChange,
}: BuildingInfoActionRailProps) => {
  const isExpanded = !isCollapsed

  return (
    <Box
      data-testid="building-info-action-rail"
      sx={(theme) => ({
        position: isExpanded ? 'absolute' : 'relative',
        left: isExpanded && activeMode === 'twoPanel' ? '772px' : 'auto',
        right: isExpanded && activeMode === 'threePanel' ? '70px' : 'auto',
        top:
          isExpanded && activeMode === 'twoPanel'
            ? '46px'
            : isExpanded
              ? '100px'
              : 'auto',
        zIndex: theme.zIndex.drawer + 3,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pt: isExpanded ? 0 : '2.875rem',
        pl: isExpanded ? 0 : '0.75rem',
        pr: isExpanded ? 0 : '0.75rem',
        pointerEvents: 'auto',
      })}
    >
      <Tooltip title={ariaLabels.overview} arrow placement="right">
        <IconButton
          aria-label={ariaLabels.overview}
          aria-pressed={activeMode === 'twoPanel' && !isCollapsed}
          onClick={() => onModeChange('twoPanel')}
          size="small"
          sx={actionButtonSx({
            active: activeMode === 'twoPanel' && !isCollapsed,
          })}
        >
          <Box
            component="img"
            src="/files/img/energiakartta/sidebar/building-info-two-panel.svg"
            alt=""
            aria-hidden="true"
            sx={{
              width: '26.8px',
              height: '21.8px',
            }}
          />
        </IconButton>
      </Tooltip>
      <Tooltip title={ariaLabels.renovation} arrow placement="right">
        <IconButton
          aria-label={ariaLabels.renovation}
          aria-pressed={activeMode === 'threePanel' && !isCollapsed}
          onClick={() => onModeChange('threePanel')}
          size="small"
          sx={actionButtonSx({
            active: activeMode === 'threePanel' && !isCollapsed,
          })}
        >
          <ThreePanelIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

export const BuildingInfoMobileActionRow = ({
  activeMode,
  isCollapsed,
  ariaLabels,
  onModeChange,
}: BuildingInfoMobileActionRowProps) => {
  return (
    <Box
      data-testid="building-info-mobile-action-row"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: '10px',
        pointerEvents: 'auto',
      }}
    >
      <Tooltip title={ariaLabels.overview} arrow placement="top">
        <IconButton
          aria-label={ariaLabels.overview}
          aria-pressed={activeMode === 'twoPanel' && !isCollapsed}
          onClick={() => onModeChange('twoPanel')}
          size="small"
          sx={actionButtonSx({
            active: activeMode === 'twoPanel' && !isCollapsed,
          })}
        >
          <Box
            component="img"
            src="/files/img/energiakartta/sidebar/building-info-two-panel.svg"
            alt=""
            aria-hidden="true"
            sx={{
              width: '26.8px',
              height: '21.8px',
            }}
          />
        </IconButton>
      </Tooltip>
      <Tooltip title={ariaLabels.renovation} arrow placement="top">
        <IconButton
          aria-label={ariaLabels.renovation}
          aria-pressed={activeMode === 'threePanel' && !isCollapsed}
          onClick={() => onModeChange('threePanel')}
          size="small"
          sx={actionButtonSx({
            active: activeMode === 'threePanel' && !isCollapsed,
          })}
        >
          <ThreePanelIcon />
        </IconButton>
      </Tooltip>
    </Box>
  )
}
