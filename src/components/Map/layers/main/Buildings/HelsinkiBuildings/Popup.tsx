import React from 'react'
import { css } from 'styled-system/css'

import { Box } from '#/components/common/PandaBox'
import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import { uniqWith, isEqual } from 'lodash-es'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'

import {
  buildingHelBhsysClass,
  buildingHePaybackClass,
  energyConsumption,
} from './constants'

// Energy prices
const districtprice = 81
const powerprice = 100
const interest_rate = 0.03
// convert to float
const convertToFloat = (a: string | number) => {
  // of string to float
  const floatValue = +a
  // Return float value
  return floatValue
}
// Emission factors [kgCO2/kWh]
const empdp = [0.255, 0.195, 0.104, 0.104, 0.104]

const modalTitleClass = css({
  m: 0,
  mb: 4,
  fontSize: '1.25rem',
  fontWeight: 500,
  lineHeight: 1.6,
})

const tableTextClass = css({
  fontSize: '0.6875rem',
  fontStyle: 'normal',
  fontWeight: 400,
  lineHeight: '1.4',
  letterSpacing: '0.06875rem',
})

const tableValueClass = css({
  fontSize: '0.6875rem',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '1.4',
  letterSpacing: '0.06875rem',
})

const modalTableClass = css({
  width: '100%',
  borderCollapse: 'collapse',
  borderSpacing: 0,
  color: 'inherit',
  '& th, & td': {
    color: 'inherit',
    borderBottom: '1px solid rgba(169, 231, 203, 0.2)',
    py: '0.375rem',
    px: '1rem',
    textAlign: 'left',
    verticalAlign: 'middle',
  },
  '& th:first-of-type, & td:first-of-type': {
    pl: 0,
    width: '50%',
  },
})

type HeatingValue = string | number

type BuildingId = {
  vtj_prt?: string | number | null
  ratu?: string | number | null
}

const Popup = ({ features, onClose }: PopupProps) => {
  const { formatNumber } = useLocaleFormatter()
  let buildingIds: BuildingId[] = []
  const tableValues: Record<string, React.ReactNode> = {}

  features.forEach(() => {
    const p = features[0].properties
    let heatings: HeatingValue = 0
    let heatingsL: HeatingValue = 0
    let heatingsS: HeatingValue = 0
    let heatingsmS: HeatingValue = 0
    let tecons = 0
    let teconsL = 0
    let teconsS = 0
    let teconsmS = 0
    let tecdate = 0
    let tecdateSt = ''

    buildingIds.push({ vtj_prt: p.vtj_prt, ratu: p.ratu })

    // Helsinki-Testbed Variables
    const kktark = String(p.c_kayttark)
    const docctilav = p.i_raktilav

    // check / convert undefined values
    if (typeof p.c_valmpvm === 'undefined') {
      tecdate = 0
    } else {
      tecdateSt = p.c_valmpvm.toString().substr(0, 4)
      tecdate = Number(tecdateSt)
    }
    // Building type: Apartment building
    if (kktark == '032' || kktark == '039') {
      tableValues['Building type'] = 'Apartment building'
    }
    if (p.c_valmpvm != null) {
      const doccdate = p.c_valmpvm.toString().substr(0, 4)
      tableValues['Construction year'] = doccdate
    }
    if (p.i_raktilav != null) {
      tableValues['Heated floor area [m2]'] = formatNumber(p.i_kokala)
    }
    if (p.i_raktilav != null) {
      tableValues['Heated volume [m3]'] = formatNumber(p.i_raktilav)
    }
    // The house's heat source
    if (kktark == '032' || (kktark == '039' && p.c_poltaine != null)) {
      tableValues['Heating system'] = buildingHelBhsysClass[p.c_poltaine] || ''
    }
    // district heating
    if (
      kktark == '032' ||
      (kktark == '039' && p.c_poltaine == 1 && p.c_valmpvm != null)
    ) {
      if (tecdate <= 1975) {
        heatings = energyConsumption.consumption[0].dis_heating
        heatingsL = energyConsumption.consumption[0].dis_heatingL
        heatingsS = energyConsumption.consumption[0].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[0].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 1977 || tecdate >= 1976) {
        heatings = energyConsumption.consumption[1].dis_heating
        heatingsL = energyConsumption.consumption[1].dis_heatingL
        heatingsS = energyConsumption.consumption[1].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[1].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 1984 || tecdate >= 1978) {
        heatings = energyConsumption.consumption[2].dis_heating
        heatingsL = energyConsumption.consumption[2].dis_heatingL
        heatingsS = energyConsumption.consumption[2].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[2].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 2002 || tecdate >= 1985) {
        heatings = energyConsumption.consumption[3].dis_heating
        heatingsL = energyConsumption.consumption[3].dis_heatingL
        heatingsS = energyConsumption.consumption[3].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[3].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 2007 || tecdate >= 2003) {
        heatings = energyConsumption.consumption[4].dis_heating
        heatingsL = energyConsumption.consumption[4].dis_heatingL
        heatingsS = energyConsumption.consumption[4].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[4].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 2009 || tecdate >= 2008) {
        heatings = energyConsumption.consumption[5].dis_heating
        heatingsL = energyConsumption.consumption[5].dis_heatingL
        heatingsS = energyConsumption.consumption[5].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[5].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 2011 || tecdate >= 2010) {
        heatings = energyConsumption.consumption[6].dis_heating
        heatingsL = energyConsumption.consumption[6].dis_heatingL
        heatingsS = energyConsumption.consumption[6].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[6].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate <= 2017 || tecdate >= 2012) {
        heatings = energyConsumption.consumption[7].dis_heating
        heatingsL = energyConsumption.consumption[7].dis_heatingL
        heatingsS = energyConsumption.consumption[7].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[7].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else if (tecdate >= 2018) {
        heatings = energyConsumption.consumption[8].dis_heating
        heatingsL = energyConsumption.consumption[8].dis_heatingL
        heatingsS = energyConsumption.consumption[8].dis_heatingS
        tecons = docctilav * convertToFloat(heatings)
        teconsL = docctilav * convertToFloat(heatingsL)
        teconsS = docctilav * convertToFloat(heatingsS)
        heatingsmS = energyConsumption.consumption[8].estenergCons
        teconsmS = docctilav * convertToFloat(heatingsmS)
      } else {
        heatings = 0
        tecons = 0
        teconsL = 0
        teconsS = 0
        teconsmS = 0
      }

      const districthconsmp = teconsL / 1000
      const electenergyconspt = teconsS / 1000
      const electenergyconsptm = teconsmS / 1000

      const yearcostbi =
        districthconsmp * districtprice + electenergyconspt * powerprice
      const yearcostai = electenergyconsptm * powerprice
      const savingsum = Number(yearcostbi) - Number(yearcostai)

      const n = 15
      let present_value, cumulative_yield, discretes
      cumulative_yield = 0
      // calculates the cumulative sum
      for (let i = 1; i <= n; i++) {
        discretes = 1 / (1 + interest_rate) ** i
        present_value = discretes * Number(savingsum)
        cumulative_yield += present_value
      }

      tableValues['Estimated yearly heating related CO2-emissions [tCO2/a]'] = (
        <strong>{formatNumber(Math.round(tecons / 1000))}</strong>
      )
      tableValues[
        'Estimated yearly heating related CO2-emissions [kgCO2/(m3/a)]'
      ] = (
        <strong>{heatings}</strong>
      )
      tableValues[
        'Estimated yearly heating related CO2-emissions [kgCO2/kWh]'
      ] = (
        <strong>{formatNumber(Math.round((tecons * empdp[1]) / 1000))}</strong>
      )
      // payback time
      tableValues['From district heat to geothermal heat (cost savings)'] = (
        <address></address>
      )
      tableValues['Before investing [Mwh/a, €/a]'] = (
        <div>
          <div>
            {buildingHePaybackClass[1]}:{' '}
            <strong>
              {formatNumber(districthconsmp, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}
            </strong>
          </div>
          <div>
            {buildingHePaybackClass[2]}:{' '}
            <strong>
              {formatNumber(electenergyconspt, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}
            </strong>
          </div>
          <div>
            {buildingHePaybackClass[3]}:{' '}
            <strong>
              {formatNumber(yearcostbi, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </strong>
          </div>
        </div>
      )
      tableValues['After investing [Mwh/a, €/a]'] = (
        <div>
          <div>
            {buildingHePaybackClass[1]}:{' '}
            <strong>0</strong>
          </div>
          <div>
            {buildingHePaybackClass[2]}:{' '}
            <strong>
              {formatNumber(electenergyconsptm, {
                minimumFractionDigits: 3,
                maximumFractionDigits: 3,
              })}
            </strong>
          </div>
          <div>
            {buildingHePaybackClass[3]}:{' '}
            <strong>
              {formatNumber(yearcostai, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </strong>
          </div>
        </div>
      )
      tableValues['Savings [€]'] = (
        <strong>
          {formatNumber(savingsum, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </strong>
      )
      tableValues['Price of district heating & electricity [€/MWh, snt/kWh]'] =
        (
          <strong>
            {formatNumber(districtprice)} & {formatNumber(powerprice / 10)}
          </strong>
        )
      tableValues['Cumulative savings (15a / Rate 3%): [€]'] = (
        <strong>
          {formatNumber(cumulative_yield, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </strong>
      )
    }
    // Oil
    if (
      kktark == '032' ||
      (kktark == '039' && p.c_poltaine == 2) ||
      (p.c_poltaine == 3 && p.c_valmpvm != null)
    ) {
      if (tecdate <= 1975) {
        heatings = energyConsumption.consumption[0].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 1977 || tecdate >= 1976) {
        heatings = energyConsumption.consumption[1].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 1984 || tecdate >= 1978) {
        heatings = energyConsumption.consumption[2].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2002 || tecdate >= 1985) {
        heatings = energyConsumption.consumption[3].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2007 || tecdate >= 2003) {
        heatings = energyConsumption.consumption[4].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2009 || tecdate >= 2008) {
        heatings = energyConsumption.consumption[5].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2011 || tecdate >= 2010) {
        heatings = energyConsumption.consumption[6].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2017 || tecdate >= 2012) {
        heatings = energyConsumption.consumption[7].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate >= 2018) {
        heatings = energyConsumption.consumption[8].Oil
        tecons = docctilav * convertToFloat(heatings)
      } else {
        heatings = 0
        tecons = 0
      }
      tableValues['Estimated yearly heating related CO2-emissions: [tCO2/a]'] =
        (
          <strong>{formatNumber(Math.round(tecons / 1000))}</strong>
        )
      tableValues[
        'Estimated yearly heating related CO2-emissions: [kgCO2/(m3/a)]'
      ] = (
        <strong>{formatNumber(Number(heatings))}</strong>
      )
      tableValues[
        'Estimated yearly heating related CO2-emissions: [kgCO2/kWh]'
      ] = (
        <strong>{formatNumber(Math.round((tecons * empdp[0]) / 1000))}</strong>
      )
    }
    // Direct_Heating
    if (
      kktark == '032' ||
      (kktark == '039' && p.c_poltaine == 4 && p.c_valmpvm != null)
    ) {
      if (tecdate <= 1975) {
        heatings = energyConsumption.consumption[0].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 1977 || tecdate >= 1976) {
        heatings = energyConsumption.consumption[1].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 1984 || tecdate >= 1978) {
        heatings = energyConsumption.consumption[2].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2002 || tecdate >= 1985) {
        heatings = energyConsumption.consumption[3].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2007 || tecdate >= 2003) {
        heatings = energyConsumption.consumption[4].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2009 || tecdate >= 2008) {
        heatings = energyConsumption.consumption[5].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2011 || tecdate >= 2010) {
        heatings = energyConsumption.consumption[6].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2017 || tecdate >= 2012) {
        heatings = energyConsumption.consumption[7].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate >= 2018) {
        heatings = energyConsumption.consumption[8].direct_heating
        tecons = docctilav * convertToFloat(heatings)
      } else {
        heatings = 0
        tecons = 0
      }
      tableValues['Estimated yearly heating related CO2-emissions: [tCO2/a]'] =
        (
          <strong>{formatNumber(Math.round(tecons / 1000))}</strong>
        )
      tableValues[
        'Estimated yearly heating related CO2-emissions: [kgCO2/(m3/a)]'
      ] = (
        <strong>{heatings}</strong>
      )
      tableValues[
        'Estimated yearly heating related CO2-emissions: [kgCO2/kWh]'
      ] = (
        <strong>{formatNumber(Math.round((tecons * empdp[2]) / 1000))}</strong>
      )
    }
    // Air-to-water heat pumpu, Ground source heat pump
    if (
      kktark == '032' ||
      (kktark == '039' && p.c_poltaine == 9 && p.c_valmpvm != null)
    ) {
      if (tecdate <= 1975) {
        heatings = energyConsumption.consumption[0].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 1977 || tecdate >= 1976) {
        heatings = energyConsumption.consumption[1].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 1984 || tecdate >= 1978) {
        heatings = energyConsumption.consumption[2].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2002 || tecdate >= 1985) {
        heatings = energyConsumption.consumption[3].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2007 || tecdate >= 2003) {
        heatings = energyConsumption.consumption[4].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2009 || tecdate >= 2008) {
        heatings = energyConsumption.consumption[5].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2011 || tecdate >= 2010) {
        heatings = energyConsumption.consumption[6].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate <= 2017 || tecdate >= 2012) {
        heatings = energyConsumption.consumption[7].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else if (tecdate >= 2018) {
        heatings = energyConsumption.consumption[8].ghpump
        tecons = docctilav * convertToFloat(heatings)
      } else {
        heatings = 0
        tecons = 0
      }
      tableValues['Estimated yearly heating related CO2-emissions: [tCO2/a]'] =
        (
          <strong>{formatNumber(Math.round(tecons / 1000))}</strong>
        )
      tableValues[
        'Estimated yearly heating related CO2-emissions: [kgCO2/(m3/a)]'
      ] = (
        <strong>{heatings}</strong>
      )
      tableValues[
        'Estimated yearly heating related CO2-emissions: [kgCO2/kWh]'
      ] = (
        <strong>{formatNumber(Math.round((tecons * empdp[3]) / 1000))}</strong>
      )
      // district heat price
      /*tableValues['Energy consumption reduction potential by switching to GSHP: MWh/a'] = <address>{'GSHP = Ground source heat pum'}</address>
      tableValues['CO2-emission reduction potential by switching to GSHP: tCO2/a'] = <address>{''}</address>
      tableValues['Energy consumption reduction potential by switching to AWHP: MWh/a'] = <address>{'AWHP = Air-to-water heat pump'}</address>
      tableValues['CO2-emission reduction potential by switching to AWHP: tCO2/a'] = <address>{''}</address>*/
    }
    if (
      p.hakija != null ||
      p.hakija_osoite != null ||
      p.hakija_postinumero != null
    ) {
      tableValues['Demolition requested by'] = (
        <div>
          {p.hakija}, {p.hakija_osoite}, {p.hakija_postinumero}
        </div>
      )
    }
    if (p.lupa_voimassa_asti != null) {
      tableValues['Demolition permit valid until'] = p.lupa_voimassa_asti
    }
  })

  // remove duplicate building ids by comparing the objects
  buildingIds = uniqWith(buildingIds, isEqual)

  const buildingIdString = buildingIds.reduce((prev, curr) => {
      const val =
        curr.vtj_prt && curr.ratu
          ? `${curr.vtj_prt} (${curr.ratu})`
          : curr.vtj_prt || curr.ratu

      if (val != null) {
        if (prev !== '') {
          prev += ', '
        }

        prev += val
      }

      return prev
  }, '')

  return (
    <MapModalWrapper minWidthBeforeFullScreen={500}>
      <Box
        sx={{
          backgroundColor: '#3E3E3E',
          color: '#A9E7CB',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden', // ensure borderRadius clips children
          borderRadius: '0.625rem',
          maxHeight: '40rem',
          minWidth: 500,
        }}
      >
        {/* Header bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: '4.0rem',
            borderBottom: '1px solid',
            borderColor: 'neutral.dark',
            pl: 1.2,
            flex: '0 0 auto', // Header should not shrink
          }}
        >
          <Box
            component="button"
            type="button"
            aria-label="close"
            onClick={onClose}
            sx={{
              p: 1,
              border: 0,
              borderRadius: '50%',
              background: 'transparent',
              color: '#9e9e9e',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&:focus-visible': {
                outline: '2px solid #9e9e9e',
                outlineOffset: '2px',
              },
            }}
          >
            <Cross />
          </Box>
        </Box>

        {/* Scroll body */}
        <Box
          sx={{
            overflowY: 'auto',
            flexGrow: 1,
            minHeight: 0, // Allow flex child to shrink
            pt: 3,
            pb: 4,
            px: { mobile: 2.6, desktop: 4 },
            '@supports selector(::-webkit-scrollbar)': {
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#878787' },
            },
            '@supports not selector(::-webkit-scrollbar)': {
              scrollbarColor: '#878787 transparent',
            },
          }}
        >
          <h2 id="map-popup-modal-title" className={modalTitleClass}>
            Building ID: {buildingIdString}
          </h2>

          <table className={modalTableClass}>
            <tbody>
              {Object.keys(tableValues).map((key: string) => {
                const value = tableValues[key]

                if (React.isValidElement(value)) {
                  return (
                    <tr key={key}>
                      <td style={{ verticalAlign: 'top' }}>
                        <span className={tableTextClass}>{key}</span>
                      </td>
                      <td>
                        <div className={tableTextClass}>{value}</div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={key}>
                    <td>
                      <span className={tableTextClass}>{key}</span>
                    </td>
                    <td>
                      <span className={tableValueClass}>{value}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    </MapModalWrapper>
  )
}

export default Popup
