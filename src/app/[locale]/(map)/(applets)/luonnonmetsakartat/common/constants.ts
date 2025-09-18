import { ListedLayerGroup } from '#/common/types/map'
import {
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlTaustakarttaLayerGroup,
  listedOsmBackgroundLayerGroup,
} from '#/components/Map/layers/defaultListedLayerGroups'

export const listedLayerGroups: ListedLayerGroup[] = [
  {
    ...listedMmlTaustakarttaLayerGroup,
    addOptions: {
      ...listedMmlTaustakarttaLayerGroup.addOptions,
      isHidden: false,
    },
  },
  listedMmlMaastokarttaLayerGroup,
  listedMmlOrtokuvaLayerGroup,
  listedMmlSelkokarttaLayerGroup,
  listedMmlKiinteistojaotusLayerGroup,
  listedMmlKiinteistotunnuksetLayerGroup,
  listedOsmBackgroundLayerGroup,
]
