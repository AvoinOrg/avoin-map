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
import {
  PopupTable,
  PopupTableBody,
  PopupTableCell,
  PopupTableRow,
} from '#/components/Map/layers/main/common/PopupTable'

type SoilTypeInfo = [number, string, string]
type MetsaanDatasource = {
  id: number | string
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
      <PopupTableBody>
        <PopupTableRow>
          <PopupTableCell>Main Tree species</PopupTableCell>
          <PopupTableCell>{metsaanFiTreeSpecies[p.maintreespecies] || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Average metsaanFiTreeSpecies age</PopupTableCell>
          <PopupTableCell>{p.meanage} years</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Average tree trunk diameter</PopupTableCell>
          <PopupTableCell>{p.meandiameter} cm</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Average tree height</PopupTableCell>
          <PopupTableCell>{p.meanheight} m</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Soil</PopupTableCell>
          <PopupTableCell>{soilEn || soilFi || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Area</PopupTableCell>
          <PopupTableCell>{pp(p.area, 3)} hectares</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Accessibility</PopupTableCell>
          <PopupTableCell>{metsaanFiAccessibilityClassifier[p.accessibility] || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Approx. tree stem count</PopupTableCell>
          <PopupTableCell>{pp(p.stemcount * p.area)}</PopupTableCell>
        </PopupTableRow>
        {/* <PopupTableRow><PopupTableCell>TODO(Probably/Not/Yes/No): Mature enough for regeneration felling?</PopupTableCell><PopupTableCell>{
              p.regeneration_felling_prediction
            }</PopupTableCell></PopupTableRow>  */}
        <PopupTableRow>
          <PopupTableCell>Development class</PopupTableCell>
          <PopupTableCell>{metsaanFiDevelopmentClass[p.developmentclass] || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Fertility classifier</PopupTableCell>
          <PopupTableCell>{metsaanFiFertilityClass[p.fertilityclass] || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Main group</PopupTableCell>
          <PopupTableCell>{metsaanFiMainGroups[p.maingroup] || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Subgroup</PopupTableCell>
          <PopupTableCell>{metsaanFiSubgroups[p.subgroup] || ''}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Ditching</PopupTableCell>
          <PopupTableCell>{ditching}</PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Data source</PopupTableCell>
          <PopupTableCell>
            {(metsaanFiDatasources as MetsaanDatasource[]).find(
              (x) => x.id === p.datasource
            )?.description || ''}
          </PopupTableCell>
        </PopupTableRow>
        <PopupTableRow>
          <PopupTableCell>Identifier</PopupTableCell>
          <PopupTableCell>StandID={p.standid}</PopupTableCell>
        </PopupTableRow>
      </PopupTableBody>
    </PopupTable>
  )
}

export default Popup
