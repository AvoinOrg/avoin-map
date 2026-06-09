'use client'

import React from 'react'

import type { PandaStyleProp } from '#/common/style/panda'
import { Box } from '#/components/common/PandaBox'

import TText from '#/components/common/TText'
import {
  ENERGY_CERTIFICATE_CLASS_CODES,
  ENERGY_CERTIFICATE_CLASS_COLORS,
} from '../layers/energyCertificateLayerConf'
import EnergyCertificateClassControls from './EnergyCertificateClassControls'

const ACCORDION_TEXT_SX = {
  color: '#111111',
  fontSize: '0.625rem',
  fontWeight: 400,
  lineHeight: '1.125rem',
  letterSpacing: '0.1em',
}

type EnergyClassTextProps = {
  component?: React.ElementType
  sx?: PandaStyleProp
  children?: React.ReactNode
} & React.ComponentPropsWithoutRef<'p'>

const EnergyClassText = ({
  component,
  sx,
  children,
  ...props
}: EnergyClassTextProps) => (
  <Box
    component={component ?? 'p'}
    sx={[
      {
        m: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...props}
  >
    {children}
  </Box>
)

const EnergyClassesAccordionContent = () => {
  const [showDefinitions, setShowDefinitions] = React.useState(false)

  return (
      <Box
        sx={{
          pt: '2.125rem',
          mx: '2rem',
          maxWidth: '15.875rem',
        }}
      >
      <EnergyCertificateClassControls
        sx={{
          mb: '2.75rem',
          ml: '-2rem',
          width: '20.125rem',
          maxWidth: 'calc(100% + 4rem)',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.125rem',
        }}
      >
        <EnergyClassText sx={ACCORDION_TEXT_SX}>
          <TText
            keyName="sidebar.front_page.energy_classes.body_1"
            ns="energiakartta"
          />
        </EnergyClassText>
        <EnergyClassText sx={ACCORDION_TEXT_SX}>
          <TText
            keyName="sidebar.front_page.energy_classes.body_2"
            ns="energiakartta"
          />
        </EnergyClassText>
        <EnergyClassText sx={ACCORDION_TEXT_SX}>
          <TText
            keyName="sidebar.front_page.energy_classes.body_3"
            ns="energiakartta"
          />
        </EnergyClassText>
        <EnergyClassText sx={{ ...ACCORDION_TEXT_SX, fontWeight: 700 }}>
          <TText
            keyName="sidebar.front_page.energy_classes.note"
            ns="energiakartta"
          />
        </EnergyClassText>
      </Box>

      {showDefinitions && (
        <Box
          component="ul"
          sx={{
            mt: '2rem',
            mb: 0,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            listStyle: 'none',
          }}
        >
          {ENERGY_CERTIFICATE_CLASS_CODES.map((classCode) => (
            <Box
              key={classCode}
              component="li"
              sx={{
                display: 'grid',
                gridTemplateColumns: '1.75rem minmax(0, 1fr)',
                columnGap: '0.75rem',
                alignItems: 'start',
              }}
            >
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  width: '1.75rem',
                  height: '1.75rem',
                  borderRadius: '50%',
                  backgroundColor: ENERGY_CERTIFICATE_CLASS_COLORS[classCode],
                  color: '#111111',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: 0,
                }}
              >
                {classCode}
              </Box>
              <EnergyClassText
                component="span"
                sx={{
                  ...ACCORDION_TEXT_SX,
                  lineHeight: '1rem',
                }}
              >
                <TText
                  keyName={`sidebar.front_page.energy_classes.class_definitions.${classCode}`}
                  ns="energiakartta"
                />
              </EnergyClassText>
            </Box>
          ))}
        </Box>
      )}

      <Box
        component="button"
        type="button"
        onClick={() => setShowDefinitions((value) => !value)}
        sx={{
          mt: '2.25rem',
          p: 0,
          border: 0,
          background: 'transparent',
          color: '#075CFF',
          cursor: 'pointer',
          font: 'inherit',
          textAlign: 'left',
          textDecoration: 'underline',
          textDecorationThickness: '1px',
          textUnderlineOffset: '0.125rem',
          '&:focus-visible': {
            outline: '2px solid #075CFF',
            outlineOffset: '0.1875rem',
          },
        }}
      >
        <EnergyClassText
          component="span"
          sx={{
            ...ACCORDION_TEXT_SX,
            color: 'inherit',
            textDecoration: 'inherit',
            textUnderlineOffset: 'inherit',
          }}
        >
          <TText
            keyName={
              showDefinitions
                ? 'sidebar.front_page.energy_classes.hide_definitions'
                : 'sidebar.front_page.energy_classes.definitions'
            }
            ns="energiakartta"
          />
        </EnergyClassText>
      </Box>
    </Box>
  )
}

export default EnergyClassesAccordionContent
