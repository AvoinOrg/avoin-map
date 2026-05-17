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

import { useIsMobile } from '#/common/hooks/ui/useIsMobile'
import TText from '#/components/common/TText'
import { PanelSidebarPageContainer } from '#/components/Sidebar/PanelSidebarPageContainer'
import { PanelSidebarTabContainer } from '#/components/Sidebar/PanelSidebarTabContainer'
import { useNullablePanelSidebarTabsContext } from '#/components/Sidebar/PanelSidebarTabsContext'
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

const PANEL_CONTENT_WIDTHS: Record<EnergymapBuildingInfoPanelId, string> = {
  energyConsumption: '17.625rem',
  renovationRecommendations: '26.875rem',
  buildingDetails: '16.25rem',
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
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
} as const

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
    <Typography
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
    </Typography>
    <Typography
      component="div"
      sx={{
        fontSize: '0.75rem',
        lineHeight: '1.125rem',
        letterSpacing: '0.1em',
        color: '#111111',
      }}
    >
      <BuildingInfoValueText value={row} align="left" />
    </Typography>
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
      <BuildingInfoValueText value={row} variant={valueVariant} />
    </Typography>
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
            <Typography
              sx={{
                ...textSx,
                color: '#111111',
              }}
            >
              <BuildingInfoText text={measuresRow.label} />
            </Typography>
            <Typography
              component="div"
              sx={{
                ...textSx,
                mt: '0.375rem',
                color: '#111111',
              }}
            >
              <BuildingInfoValueText value={measuresRow} align="left" />
            </Typography>
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
                mt: '0.375rem',
                color: '#111111',
              }}
            >
              <BuildingInfoValueText value={row} align="left" />
            </Typography>
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
          fontWeight: 400,
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
              fontWeight: 400,
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
  showDescription = true,
  showHeroGraphic = true,
  sx,
}: {
  panel: EnergymapBuildingInfoPanel
  titleId: string
  accentColor: string
  sections?: EnergymapBuildingInfoSection[]
  showDescription?: boolean
  showHeroGraphic?: boolean
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
        mt: 'var(--building-info-heading-divider-mt, 1.375rem)',
        borderTop: '0.3px solid #cfcfcf',
      }}
    />
    {showHeroGraphic && <BuildingInfoPanelHeroGraphic panelId={panel.id} />}
    {showDescription && panel.description != null && (
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
    {sections.map((section) => (
      <BuildingInfoSectionBlock
        key={section.id}
        section={section}
        accentColor={accentColor}
      />
    ))}
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
}): SxProps<Theme> => ({
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
  tabId,
  panelId,
}: {
  tabId: BuildingInfoTabId
  panelId: EnergymapBuildingInfoPanelId
}): SxProps<Theme> => ({
  width: `min(${PANEL_CONTENT_WIDTHS[panelId]}, calc(100% - 3rem))`,
  maxWidth: '100%',
  pt: DESKTOP_HEADING_TOP,
  pb: DESKTOP_SECTION_BOTTOM_PADDING,
  mx:
    tabId === 'renovation' && panelId === 'buildingDetails'
      ? undefined
      : 'auto',
  ml:
    tabId === 'renovation' && panelId === 'buildingDetails'
      ? '4.375rem'
      : undefined,
  '--building-info-heading-graphic-top': DESKTOP_HEADING_GRAPHIC_TOP,
  '--building-info-heading-divider-mt': DESKTOP_HEADING_DIVIDER_MARGIN_TOP,
})

const BuildingInfoPanelSection = ({
  panel,
  tabId,
  bodySx,
  sections,
  showDescription,
  showHeroGraphic,
  sx,
}: {
  panel: EnergymapBuildingInfoPanel
  tabId: BuildingInfoTabId
  bodySx?: SxProps<Theme>
  sections?: EnergymapBuildingInfoSection[]
  showDescription?: boolean
  showHeroGraphic?: boolean
  sx?: SxProps<Theme>
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
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <BuildingInfoPanelBody
        panel={panel}
        titleId={titleId}
        accentColor={accentColor}
        sections={sections}
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
          <Typography
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
          </Typography>
        )}
        <Box
          sx={{
            mt: '1.875rem',
            borderTop: '0.3px solid #cfcfcf',
          }}
        />
        {section?.description != null && (
          <Typography
            sx={{
              ...textSx,
              mt: '1.875rem',
              maxWidth: '20.375rem',
              color: '#111111',
            }}
          >
            <BuildingInfoText text={section.description} />
          </Typography>
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

const BuildingInfoRenovationEffectivenessContent = ({
  panel,
}: {
  panel: EnergymapBuildingInfoPanel
}) => {
  const notes =
    getRenovationComparisonSection(panel)?.notes?.filter(
      (note) => note.status !== 'missing'
    ) ?? []

  if (notes.length === 0) {
    return null
  }

  return (
    <Box
      data-testid="building-info-renovation-effectiveness-content"
      sx={{
        width: `min(${PANEL_CONTENT_WIDTHS.buildingDetails}, calc(100% - 4rem))`,
        maxWidth: '100%',
        ml: '4.375rem',
        pt: DESKTOP_HEADING_TOP,
        pb: DESKTOP_SECTION_BOTTOM_PADDING,
      }}
    >
      {notes.map((note) => (
        <BuildingInfoNoteText key={note.id} note={note} />
      ))}
    </Box>
  )
}

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
            sx={{ minHeight: '100%', height: '100%' }}
            bodySx={getDesktopGridPanelContentSx({
              tabId,
              panelId: energyPanel.id,
            })}
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
              tabId,
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
              tabId,
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
            backgroundColor={PANEL_BACKGROUNDS.buildingDetails}
            minHeight={DESKTOP_GRID_SECTION_MIN_HEIGHTS.renovationBottom}
          >
            <BuildingInfoRenovationEffectivenessContent
              panel={renovationPanel}
            />
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
}: {
  tabId: BuildingInfoTabId
  panels: EnergymapBuildingInfoPanel[]
}) => {
  const isMobile = useIsMobile()
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
      {isMobile ? (
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
}: {
  activeTabId?: BuildingInfoTabId
}) => {
  const tabsContext = useNullablePanelSidebarTabsContext()
  const setActiveTabId = tabsContext?.setActiveTabId
  const lastAppliedActiveTabId = React.useRef<BuildingInfoTabId | undefined>()
  const hasActiveTab =
    activeTabId != null &&
    tabsContext?.tabs.some((tab) => tab.tabId === activeTabId) === true

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

  return null
}

const TwoPanelIcon = () => (
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

const getBuildingInfoPageControlsSx = (
  tabId: BuildingInfoTabId
): SxProps<Theme> => ({
  position: { desktop: 'absolute' },
  top: { desktop: tabId === 'renovation' ? '50px' : '35px' },
  right: { desktop: tabId === 'renovation' ? '120px' : 'auto' },
  left: {
    desktop:
      tabId === 'renovation'
        ? 'auto'
        : 'min(624px, calc(100% - 116px))',
  },
  gap: { desktop: '4px' },
  px: { desktop: 0 },
  py: { desktop: 0 },
  backgroundColor: { desktop: 'transparent' },
  borderBottom: { desktop: 0 },
  zIndex: 2,
  '& .MuiIconButton-root': {
    width: { desktop: '36px' },
    minWidth: { desktop: '36px' },
    height: { desktop: '36px' },
    borderRadius: { desktop: '5px' },
    backgroundColor: { desktop: '#f4f4f4' },
    boxShadow: { desktop: 'none' },
    '&:hover': {
      backgroundColor: { desktop: '#ffffff' },
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: { desktop: '1rem' },
  },
})

export const BuildingInfoTabPages = ({
  panels,
  ariaLabels,
  activeTabId,
  onClose,
  onCollapse,
}: BuildingInfoTabPagesProps) => (
  <>
    <BuildingInfoActiveTabSync activeTabId={activeTabId} />
    <PanelSidebarTabContainer
      tabId="basic"
      tabName={ariaLabels.overview}
      tabAriaLabel={ariaLabels.overview}
      tabIcon={<TwoPanelIcon />}
    >
      <PanelSidebarPageContainer
        closeAriaLabel={ariaLabels.close}
        collapseAriaLabel={ariaLabels.collapse}
        onClose={onClose}
        onCollapse={() => onCollapse('basic')}
        contentSx={{
          backgroundColor: '#f9f9f9',
        }}
        controlsSx={getBuildingInfoPageControlsSx('basic')}
      >
        <BuildingInfoTabPageContent tabId="basic" panels={panels} />
      </PanelSidebarPageContainer>
    </PanelSidebarTabContainer>
    <PanelSidebarTabContainer
      tabId="renovation"
      tabName={ariaLabels.renovation}
      tabAriaLabel={ariaLabels.renovation}
      tabIcon={<ThreePanelIcon />}
    >
      <PanelSidebarPageContainer
        closeAriaLabel={ariaLabels.close}
        collapseAriaLabel={ariaLabels.collapse}
        onClose={onClose}
        onCollapse={() => onCollapse('renovation')}
        contentSx={{
          backgroundColor: '#f9f9f9',
        }}
        controlsSx={getBuildingInfoPageControlsSx('renovation')}
      >
        <BuildingInfoTabPageContent tabId="renovation" panels={panels} />
      </PanelSidebarPageContainer>
    </PanelSidebarTabContainer>
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
      sx={{
        display: 'flex',
        flexDirection: orientation,
        gap: `${BUILDING_INFO_ACTION_BUTTON_GAP_PX}px`,
        pointerEvents: 'auto',
      }}
    >
      <Tooltip title={ariaLabels.overview} arrow placement={tooltipPlacement}>
        <IconButton
          aria-label={ariaLabels.overview}
          aria-pressed={activeMode === 'twoPanel' && !isCollapsed}
          onClick={() => onModeChange('twoPanel')}
          size="small"
          sx={actionButtonSx({
            active: activeMode === 'twoPanel' && !isCollapsed,
          })}
        >
          <TwoPanelIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title={ariaLabels.renovation} arrow placement={tooltipPlacement}>
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
