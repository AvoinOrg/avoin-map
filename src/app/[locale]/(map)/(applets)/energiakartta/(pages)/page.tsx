'use client'

import React from 'react'
import { Box, Tooltip, Typography } from '@mui/material'
import { useTranslate } from '@tolgee/react'

import { useVisibleLayerGroupIds } from '#/common/hooks/map/useVisibleLayerGroupIds'
import { useMapStore } from '#/common/store'
import TText from '#/components/common/TText'
import { IntoSlot } from '#/components/context/slotsContext'
import { SidebarContentBox } from '#/components/Sidebar'
import { CircleArrowRight, EyeClosed, EyeOpen } from '#/components/icons'
import { listedEnergyClassesLayerGroup } from '../common/constants'

const SIDEBAR_SIDE_PADDING = {
  mobile: '1.5rem',
  desktop: '1.875rem',
}

const ROW_LABEL_SX = {
  color: '#111111',
  fontSize: '0.6875rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

type LayerRowProps = {
  labelKey: string
  disabled?: boolean
  isVisible?: boolean
  tooltip: string
  ariaLabel?: string
  onToggle?: () => void
}

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

const SidebarLayerRow = ({
  labelKey,
  disabled = false,
  isVisible = false,
  tooltip,
  ariaLabel,
  onToggle,
}: LayerRowProps) => {
  const rowContent = (
    <Box
      component={disabled ? 'div' : 'button'}
      type={disabled ? undefined : 'button'}
      role={disabled ? 'button' : undefined}
      tabIndex={disabled ? 0 : undefined}
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={ariaLabel}
      onClick={disabled ? undefined : onToggle}
      sx={{
        width: '100%',
        minHeight: '1.125rem',
        p: 0,
        display: 'flex',
        alignItems: 'center',
        border: 0,
        background: 'transparent',
        color: '#111111',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        '&:focus-visible': {
          outline: '2px solid #111111',
          outlineOffset: '0.25rem',
        },
      }}
    >
      <Box
        sx={{
          width: '1.5rem',
          height: '1.125rem',
          mr: '0.3125rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isVisible ? (
          <EyeOpen sx={{ width: '1rem', height: '1rem' }} />
        ) : (
          <EyeClosed sx={{ width: '1rem', height: '1rem' }} />
        )}
      </Box>
      <Typography component="span" sx={{ ...ROW_LABEL_SX, flexGrow: 1 }}>
        <TText keyName={labelKey} ns="energiakartta" />
      </Typography>
      <CircleArrowRight
        sx={{
          width: '0.75rem',
          height: '0.75rem',
          color: '#aeb6ad',
          ml: '1rem',
          flexShrink: 0,
        }}
      />
    </Box>
  )

  if (!disabled) {
    return rowContent
  }

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box component="span" sx={{ display: 'block', width: '100%' }}>
        {rowContent}
      </Box>
    </Tooltip>
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

const Page = () => {
  const { t } = useTranslate('energiakartta')
  const toggleLayerGroup = useMapStore((state) => state.toggleLayerGroup)
  const visibleLayerGroupIds = useVisibleLayerGroupIds()
  const isEnergyClassesLayerVisible = visibleLayerGroupIds.includes(
    listedEnergyClassesLayerGroup.id
  )
  const upcomingTooltip = t('sidebar.front_page.upcoming_tooltip')
  const toggleEnergyClassesAria = t(
    'sidebar.front_page.aria.toggle_energy_classes'
  )
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
            pt: { mobile: '2.25rem', desktop: '3.0625rem' },
            pb: { mobile: '2rem', desktop: '2rem' },
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100%',
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
            <SidebarLayerRow
              labelKey="sidebar.front_page.layers.energy_classes"
              isVisible={isEnergyClassesLayerVisible}
              tooltip={upcomingTooltip}
              ariaLabel={toggleEnergyClassesAria}
              onToggle={() =>
                toggleLayerGroup(
                  listedEnergyClassesLayerGroup.id,
                  listedEnergyClassesLayerGroup.addOptions
                )
              }
            />
            <SidebarLayerRow
              labelKey="sidebar.front_page.layers.heating"
              disabled
              tooltip={upcomingTooltip}
              ariaLabel={t('sidebar.front_page.layers.heating')}
            />
            <SidebarLayerRow
              labelKey="sidebar.front_page.layers.ventilation"
              disabled
              tooltip={upcomingTooltip}
              ariaLabel={t('sidebar.front_page.layers.ventilation')}
            />
            <SidebarLayerRow
              labelKey="sidebar.front_page.layers.other_energy_sources"
              disabled
              tooltip={upcomingTooltip}
              ariaLabel={t('sidebar.front_page.layers.other_energy_sources')}
            />
          </Box>
        </Box>
      </SidebarContentBox>
    </>
  )
}

export default Page
