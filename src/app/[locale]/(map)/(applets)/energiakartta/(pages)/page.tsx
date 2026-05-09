'use client'

import React from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'

import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { useMapStore } from '#/common/store'
import {
  LayerToggleRow,
  LayerToggleRowAccordion,
} from '#/components/common/LayerToggleRow'
import TText from '#/components/common/TText'
import { IntoSlot } from '#/components/context/slotsContext'
import { SidebarContentBox } from '#/components/Sidebar'
import { HEATING_ENERGY_SOURCE_COLORS } from '../layers/heatingLayerConf'
import { listedHeatingLayerGroup } from '../common/constants'

const SIDEBAR_SIDE_PADDING = {
  mobile: '1.5rem',
  desktop: '1.875rem',
}

const SIDEBAR_CONTENT_VERTICAL_PADDING = {
  mobile: '2.25rem',
  desktop: '3.0625rem',
}

const ROW_LABEL_SX = {
  color: '#111111',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

const ACCORDION_TEXT_SX = {
  color: '#111111',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

const HEATING_LEGEND_ITEMS = [
  {
    keyName: 'sidebar.front_page.heating.legend.geothermal',
    color: HEATING_ENERGY_SOURCE_COLORS.geothermal,
  },
  {
    keyName: 'sidebar.front_page.heating.legend.district_heating',
    color: HEATING_ENERGY_SOURCE_COLORS.districtHeating,
  },
  {
    keyName: 'sidebar.front_page.heating.legend.electricity',
    color: HEATING_ENERGY_SOURCE_COLORS.electricity,
  },
  {
    keyName: 'sidebar.front_page.heating.legend.solar',
    color: HEATING_ENERGY_SOURCE_COLORS.solar,
  },
  {
    keyName: 'sidebar.front_page.heating.legend.other',
    color: HEATING_ENERGY_SOURCE_COLORS.other,
  },
] as const

const ENERGY_CLASSES_DISABLED_ROW = {
  keyName: 'sidebar.front_page.layers.energy_classes',
  ariaKeyName: 'sidebar.front_page.aria.energy_classes_upcoming',
} as const

const LOWER_DISABLED_LAYER_ROWS = [
  {
    keyName: 'sidebar.front_page.layers.ventilation',
    ariaKeyName: 'sidebar.front_page.aria.ventilation_upcoming',
  },
  {
    keyName: 'sidebar.front_page.layers.other_energy_sources',
    ariaKeyName: 'sidebar.front_page.aria.other_energy_sources_upcoming',
  },
] as const

const HomeSidebarHeader = () => {
  return (
    <Box
      sx={{
        px: { mobile: '0.625rem', desktop: '0.625rem' },
        pt: { mobile: '0.625rem', desktop: '0.75rem' },
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          height: '6.25rem',
          border: '0.2px solid #ffffff',
          borderRadius: '0.625rem',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src="/files/img/energiakartta/sidebar/main-hero.jpg"
          alt=""
          aria-hidden="true"
          sx={{
            position: 'absolute',
            top: '-120.68%',
            left: 0,
            width: '100%',
            height: '354%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 0.9) 17.5%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        <Typography
          sx={{
            position: 'relative',
            zIndex: 1,
            pt: '2.625rem',
            pl: '1.25rem',
            color: '#111111',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            lineHeight: '1.125rem',
          }}
        >
          <TText keyName="sidebar.front_page.header.title" ns="energiakartta" />
        </Typography>
      </Box>
    </Box>
  )
}

const SidebarFooterAction = ({
  tooltip,
  label,
}: {
  tooltip: string
  label: string
}) => {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box
        component="span"
        role="button"
        tabIndex={0}
        aria-disabled="true"
        aria-label={label}
        sx={{
          width: '100%',
          height: '5rem',
          px: { mobile: '1.625rem', desktop: '1.625rem' },
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          borderRadius: { mobile: 0, desktop: '6px 6px 10px 10px' },
          background:
            'linear-gradient(90deg, #f8fff2 0%, #d9ffbd 48%, #b0ff6b 100%)',
          color: '#111111',
          cursor: 'not-allowed',
          opacity: 0.72,
          boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
          '&:focus-visible': {
            outline: '2px solid #111111',
            outlineOffset: '-0.375rem',
          },
        }}
      >
        <Box
          component="img"
          src="/files/img/energiakartta/sidebar/edit-building-details.svg"
          alt=""
          aria-hidden="true"
          sx={{
            width: '1.90625rem',
            height: '1.3125rem',
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            color: '#111111',
            fontSize: '0.6875rem',
            fontWeight: 700,
            lineHeight: '0.8125rem',
            letterSpacing: '0.1em',
          }}
        >
          <TText
            keyName="sidebar.front_page.footer.edit_building_details"
            ns="energiakartta"
          />
        </Typography>
      </Box>
    </Tooltip>
  )
}

const HeatingLegendSwatch = ({ color }: { color: string }) => {
  return (
    <Box
      aria-hidden="true"
      sx={{
        width: '2.125rem',
        height: '0.875rem',
        borderRadius: '999px',
        backgroundColor: color,
        position: 'relative',
        flexShrink: 0,
        boxShadow: '0px 1px 1px rgba(189, 189, 189, 0.25)',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: '50%',
          right: '0.25rem',
          width: '0.375rem',
          height: '0.375rem',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          transform: 'translateY(-50%)',
        },
      }}
    />
  )
}

const HeatingAccordionContent = () => {
  return (
    <Box
      sx={{
        pt: '2.125rem',
        mx: '2rem',
        maxWidth: '15.875rem',
      }}
    >
      <Typography
        sx={{
          ...ACCORDION_TEXT_SX,
          mb: '2.5rem',
        }}
      >
        <TText keyName="sidebar.front_page.heating.body" ns="energiakartta" />
      </Typography>
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          listStyle: 'none',
        }}
      >
        {HEATING_LEGEND_ITEMS.map(({ keyName, color }) => (
          <Box
            key={keyName}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              minHeight: '0.875rem',
            }}
          >
            <HeatingLegendSwatch color={color} />
            <Typography
              component="span"
              sx={{
                ...ACCORDION_TEXT_SX,
                fontSize: '0.6875rem',
                lineHeight: '0.875rem',
              }}
            >
              <TText keyName={keyName} ns="energiakartta" />
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

const Page = () => {
  const { t } = useTranslate('energiakartta')
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const isHeatingLayerVisible = visibleLayerGroupIds.includes(
    listedHeatingLayerGroup.id
  )
  const upcomingTooltip = t('sidebar.front_page.upcoming_tooltip')
  const toggleHeatingAria = t('sidebar.front_page.aria.toggle_heating')
  const footerLabel = t('sidebar.front_page.footer.edit_building_details')

  return (
    <>
      <IntoSlot name="sidebar-header">
        <HomeSidebarHeader />
      </IntoSlot>
      <IntoSlot name="sidebar-footer">
        <SidebarFooterAction tooltip={upcomingTooltip} label={footerLabel} />
      </IntoSlot>
      <SidebarContentBox
        sxOuter={{
          height: '100%',
        }}
        scrollbarSide="left"
        sxInner={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          height: '100%',
        }}
      >
        <Box
          sx={{
            px: SIDEBAR_SIDE_PADDING,
            pt: SIDEBAR_CONTENT_VERTICAL_PADDING,
            pb: SIDEBAR_CONTENT_VERTICAL_PADDING,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            sx={{
              maxWidth: '18.1875rem',
              color: '#111111',
              fontSize: '0.75rem',
              fontWeight: 700,
              lineHeight: '1.25rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            <TText keyName="sidebar.front_page.heading" ns="energiakartta" />
          </Typography>

          <Typography
            sx={{
              mt: { mobile: '3rem', desktop: '3.75rem' },
              maxWidth: '18.1875rem',
              color: '#111111',
              fontSize: '0.75rem',
              fontWeight: 400,
              lineHeight: '1.125rem',
              letterSpacing: '0.05em',
            }}
          >
            <TText
              keyName="sidebar.front_page.description"
              ns="energiakartta"
            />
          </Typography>

          <Box
            sx={{
              mt: { mobile: '4rem', desktop: '6.875rem' },
              display: 'flex',
              flexDirection: 'column',
              gap: '2.25rem',
              maxWidth: '19.625rem',
            }}
          >
            <Tooltip title={upcomingTooltip} arrow placement="top">
              <Box component="span" sx={{ display: 'block', width: '100%' }}>
                <LayerToggleRow
                  label={
                    <TText
                      keyName={ENERGY_CLASSES_DISABLED_ROW.keyName}
                      ns="energiakartta"
                    />
                  }
                  status="hidden"
                  disabled
                  ariaLabel={t(ENERGY_CLASSES_DISABLED_ROW.ariaKeyName)}
                  onToggle={() => {}}
                  labelSx={ROW_LABEL_SX}
                />
              </Box>
            </Tooltip>
            <LayerToggleRowAccordion
              label={
                <TText
                  keyName="sidebar.front_page.layers.heating"
                  ns="energiakartta"
                />
              }
              status={isHeatingLayerVisible ? 'visible' : 'hidden'}
              expanded={isHeatingLayerVisible}
              ariaLabel={toggleHeatingAria}
              onToggle={() =>
                toggleLayerGroup(
                  listedHeatingLayerGroup.id,
                  listedHeatingLayerGroup.addOptions
                )
              }
              labelSx={ROW_LABEL_SX}
            >
              <HeatingAccordionContent />
            </LayerToggleRowAccordion>
            {LOWER_DISABLED_LAYER_ROWS.map(({ keyName, ariaKeyName }) => (
              <Tooltip key={keyName} title={upcomingTooltip} arrow placement="top">
                <Box component="span" sx={{ display: 'block', width: '100%' }}>
                  <LayerToggleRow
                    label={<TText keyName={keyName} ns="energiakartta" />}
                    status="hidden"
                    disabled
                    ariaLabel={t(ariaKeyName)}
                    onToggle={() => {}}
                    labelSx={ROW_LABEL_SX}
                  />
                </Box>
              </Tooltip>
            ))}
          </Box>
        </Box>
      </SidebarContentBox>
    </>
  )
}

export default Page
