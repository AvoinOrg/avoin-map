import React from 'react'
import { pp } from '#/common/utils/general'

import { PopupProps } from '#/common/types/map'
import {
  PopupTable,
  PopupTableBody,
  PopupTableCell,
  PopupTableRow,
} from '#/components/Map/layers/main/common/PopupTable'

const Popup = ({ features }: PopupProps) => {
  const p = features[0].properties
  const energyUse = p.e_luku * p.lämmitetty_nettoala
  const energyPerVolume = p.i_raktilav ? `<br/>Energy use per m³: ${pp(energyUse / p.i_raktilav)} kWh per year` : ''

  const url = `https://www.energiatodistusrekisteri.fi/public_html?energiatodistus-id=${p.todistustunnus}&command=access&t=energiatodistus&p=energiatodistukset`

  return (
    <PopupTable>
      <PopupTableBody>
        <PopupTableRow>
          <PopupTableCell>Certificate ID</PopupTableCell>
          <PopupTableCell>
            <a href={url}>{p.todistustunnus}</a>
          </PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Total energy consumption</PopupTableCell>
          <PopupTableCell>{pp(energyUse)} years</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Energy use per m²</PopupTableCell>
          <PopupTableCell>
            {p.e_luku} kWh per year {energyPerVolume}
          </PopupTableCell>
        </PopupTableRow>
      </PopupTableBody>
    </PopupTable>
  )
}

export default Popup
