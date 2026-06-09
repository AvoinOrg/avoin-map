import React from 'react'
import { pp } from '#/common/utils/general'

import { PopupProps } from '#/common/types/map'
import { PopupTable } from '#/components/Map/layers/main/PopupTable'

const Popup = ({ features }: PopupProps) => {
  const p = features[0].properties
  const energyUse = p.e_luku * p.lämmitetty_nettoala
  const energyPerVolume = p.i_raktilav ? `<br/>Energy use per m³: ${pp(energyUse / p.i_raktilav)} kWh per year` : ''

  const url = `https://www.energiatodistusrekisteri.fi/public_html?energiatodistus-id=${p.todistustunnus}&command=access&t=energiatodistus&p=energiatodistukset`

  return (
    <PopupTable>
      <tr>
        <td>Certificate ID</td>
        <td>
          <a href={url}>{p.todistustunnus}</a>
        </td>
      </tr>
      <tr>
        <td>Total energy consumption</td>
        <td>{pp(energyUse)} years</td>
      </tr>
      <tr>
        <td>Energy use per m²</td>
        <td>
          {p.e_luku} kWh per year {energyPerVolume}
        </td>
      </tr>
    </PopupTable>
  )
}

export default Popup
