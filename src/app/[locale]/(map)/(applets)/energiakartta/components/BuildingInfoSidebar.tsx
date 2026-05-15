'use client'

import React from 'react'
import { Box, IconButton, Theme, Tooltip, Typography } from '@mui/material'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'

import TText from '#/components/common/TText'
import { Cross } from '#/components/icons'
import type {
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

type BuildingInfoActionRailProps = {
  activeMode: BuildingInfoDesktopMode
  isCollapsed: boolean
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

export const getBuildingInfoDesktopPanelIds = (
  mode: BuildingInfoDesktopMode
) => PANEL_IDS_BY_MODE[mode]

const getSourcePropertiesData = (sourceProperties?: string[]) =>
  sourceProperties == null || sourceProperties.length === 0
    ? undefined
    : sourceProperties.join(',')

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
}: {
  value: EnergymapBuildingInfoValue
  align?: 'left' | 'right'
}) => {
  return (
    <Box
      component="span"
      data-status={value.status}
      data-source-properties={getSourcePropertiesData(value.sourceProperties)}
      sx={{
        display: 'inline-flex',
        flexWrap: 'wrap',
        alignItems: 'baseline',
        justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
        gap: '0.25rem',
        minWidth: 0,
        maxWidth: '100%',
        fontWeight: 700,
        textAlign: align,
        wordBreak: 'break-word',
        ...STATUS_SX[value.status],
      }}
    >
      <BuildingInfoText text={value.text} />
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
}) => (
  <Typography
    data-status={note.status}
    data-source-properties={getSourcePropertiesData(note.sourceProperties)}
    sx={{
      mt: '0.5rem',
      ...textSx,
      maxWidth: '100%',
      ...STATUS_SX[note.status],
    }}
  >
    <BuildingInfoText text={note.text} />
  </Typography>
)

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
      <BuildingInfoValueText value={row} />
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
        <Typography
          sx={{
            ...textSx,
            color: '#111111',
            fontWeight: 700,
          }}
        >
          <BuildingInfoText text={scenario.label} />
        </Typography>
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
      <Box sx={{ mt: '1rem' }}>
        {remainingValues.map((value) => (
          <BuildingInfoMetricValueRow key={value.id} value={value} />
        ))}
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
}) => (
  <Box
    data-section-id={section.id}
    sx={{
      mt: '2.25rem',
    }}
  >
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

const BuildingInfoPanelColumn = ({
  panel,
  mode,
}: {
  panel: EnergymapBuildingInfoPanel
  mode: BuildingInfoDesktopMode
}) => {
  const titleId = React.useId()
  const accentColor =
    mode === 'threePanel' && panel.id === 'buildingDetails'
      ? '#111111'
      : PANEL_ACCENTS[panel.id]

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      data-testid={`building-info-panel-${panel.id}`}
      data-panel-id={panel.id}
      sx={{
        flex: `0 0 ${getPanelWidth({ mode, panelId: panel.id })}`,
        width: getPanelWidth({ mode, panelId: panel.id }),
        minWidth: 0,
        height: '100%',
        minHeight: 0,
        backgroundColor: PANEL_BACKGROUNDS[panel.id],
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          pt: '7.375rem',
          pb: '4rem',
          pr: '1rem',
          boxSizing: 'border-box',
          ...getPanelContentSx({ mode, panelId: panel.id }),
        }}
      >
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
        {panel.description != null && (
          <Typography
            sx={{
              ...textSx,
              mt: '1.875rem',
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
    </Box>
  )
}

const BuildingInfoChrome = ({
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
    sx={{
      position: 'absolute',
      top: mode === 'twoPanel' ? '35px' : '50px',
      right: mode === 'twoPanel' ? '60px' : '70px',
      zIndex: 3,
      display: 'flex',
      gap: '4px',
      pointerEvents: 'auto',
    }}
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
  const panelsById = React.useMemo(
    () => new Map(panels.map((panel) => [panel.id, panel])),
    [panels]
  )
  const visiblePanels = getBuildingInfoDesktopPanelIds(mode)
    .map((panelId) => panelsById.get(panelId))
    .filter((panel): panel is EnergymapBuildingInfoPanel => panel != null)

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
      <BuildingInfoChrome
        mode={mode}
        ariaLabels={ariaLabels}
        onClose={onClose}
        onCollapse={onCollapse}
      />
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
