import React from 'react'

import {
  metsaanFiTreeSpecies,
  metsaanFiDevelopmentClass,
  metsaanFiAccessibilityClassifier,
  metsaanFiFertilityClass,
  metsaanFiMainGroups,
  metsaanFiDatasources,
  metsaanFiSubgroups,
  metsaanFiSoilTypes,
} from './constants'
import { pp } from '#/common/utils/general'
import { PopupProps } from '#/common/types/map'
import { PopupTable } from '#/components/Map/layers/main/PopupTable'

type SoilTypeInfo = [number, string, string]

type DatasourceInfo = {
  id: number
  description: string
}

const Popup = ({ features }: PopupProps) => {
  const p = features[0].properties

  const soilTypeInfo = (metsaanFiSoilTypes as SoilTypeInfo[]).find(
    (x) => x[0] === p.soiltype
  )
  let soilEn = '',
    soilFi = ''
  if (soilTypeInfo) {
    soilEn = soilTypeInfo[1]
    soilFi = soilTypeInfo[2]
  }

  const ditching =
    p.ditch_completed_at || p.ditchingyear ? `Completed at: {p.ditch_completion_date || p.ditchingyear}` : ''

  return (
    <PopupTable>
      <tr>
        <td>Main Tree species</td>
        <td>{metsaanFiTreeSpecies[p.maintreespecies] || ''}</td>
      </tr>
      <tr>
        <td>Average metsaanFiTreeSpecies age</td>
        <td>{p.meanage} years</td>
      </tr>
      <tr>
        <td>Average tree trunk diameter</td>
        <td>{p.meandiameter} cm</td>
      </tr>
      <tr>
        <td>Average tree height</td>
        <td>{p.meanheight} m</td>
      </tr>
      <tr>
        <td>Soil</td>
        <td>{soilEn || soilFi || ''}</td>
      </tr>
      <tr>
        <td>Area</td>
        <td>{pp(p.area, 3)} hectares</td>
      </tr>
      <tr>
        <td>Accessibility</td>
        <td>{metsaanFiAccessibilityClassifier[p.accessibility] || ''}</td>
      </tr>
      <tr>
        <td>Approx. tree stem count</td>
        <td>{pp(p.stemcount * p.area)}</td>
      </tr>
      {/* <tr><td>TODO(Probably/Not/Yes/No): Mature enough for regeneration felling?</td><td>{
              p.regeneration_felling_prediction
            }</td></tr>  */}
      <tr>
        <td>Development class</td>
        <td>{metsaanFiDevelopmentClass[p.developmentclass] || ''}</td>
      </tr>
      <tr>
        <td>Fertility classifier</td>
        <td>{metsaanFiFertilityClass[p.fertilityclass] || ''}</td>
      </tr>
      <tr>
        <td>Main group</td>
        <td>{metsaanFiMainGroups[p.maingroup] || ''}</td>
      </tr>
      <tr>
        <td>Subgroup</td>
        <td>{metsaanFiSubgroups[p.subgroup] || ''}</td>
      </tr>
      <tr>
        <td>Ditching</td>
        <td>{ditching}</td>
      </tr>
      <tr>
        <td>Data source</td>
        <td>
          {(metsaanFiDatasources as DatasourceInfo[]).find(
            (x) => x.id === p.datasource
          )?.description || ''}
        </td>
      </tr>
      <tr>
        <td>Identifier</td>
        <td>StandID={p.standid}</td>
      </tr>
    </PopupTable>
  )
}

export default Popup
