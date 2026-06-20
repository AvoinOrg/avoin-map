import React from 'react'
import { Box } from '#/common/style/theme/system'

import { pp } from '#/common/utils/general'
import { PopupProps } from '#/common/types/map'
import {
  PopupTable,
  PopupTableBody,
  PopupTableCell,
  PopupTableRow,
} from '#/components/Map/layers/main/common/PopupTable'

const Popup = ({ features }: PopupProps) => {
  const p = features[0].properties || features[0]
  const { image, spec_simp, type_text, area_ha, peat_ratio, avg_peatdepth } = p
  const isPeat = peat_ratio >= 0.4

  const imageObjs = []
  const images: string[] = image
    .replace(/\.(tif|img|_)/g, '')
    .toUpperCase()
    .split(/[,; ]+/)

  for (const x of images) {
    if (!/LGN\d/.test(x)) {
      continue
    }
    const base = x.replace(/LGN.*/, 'LGN0')
    // Most of the source images seem to fall in these categories.

    // Candidate URLs:
    for (const z of [0, 1, 2]) {
      imageObjs.push({ url: `https://earthexplorer.usgs.gov/metadata/12864/${base + z}/`, title: base + z })
    }
  }

  return (
    <Box sx={{ lineHeight: 1 }}>
      <p>
        <b>Tree plantation (Global Forest Watch)</b>
      </p>
      <p>{spec_simp}</p>
      <p>{type_text}</p>
      {isPeat && <p>Tropical peatland</p>}

      <PopupTable>
        <PopupTableBody>
          {isPeat && (
            <>
              <PopupTableRow>
                <PopupTableCell>Average peat depth</PopupTableCell>
                <PopupTableCell>{avg_peatdepth.toFixed(1)} metres</PopupTableCell>
              </PopupTableRow>
            </>
          )}
          <PopupTableRow>
            <PopupTableCell>Area</PopupTableCell>
            <PopupTableCell>{pp(area_ha, 3)}</PopupTableCell>
          </PopupTableRow>
          {isPeat && (
            <PopupTableRow>
              <PopupTableCell>Emission reduction potential when ground water level is raised by 40 cm</PopupTableCell>
              <PopupTableCell>{pp(19.4 * area_ha)} tons CO2e/year</PopupTableCell>
            </PopupTableRow>
          )}
          <PopupTableRow>
            <PopupTableCell>Landsat source ID</PopupTableCell>
            <PopupTableCell>
              <code>{image}</code>
            </PopupTableCell>
          </PopupTableRow>
          {imageObjs.length > 0 && (
            <PopupTableRow>
              <PopupTableCell>Potential Landsat source images</PopupTableCell>
              <PopupTableCell sx={{ lineHeight: 0.5 }}>
                {imageObjs.map((imageObj) => (
                  <p key={imageObj.url}>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={imageObj.url}
                    >
                      {imageObj.title}
                    </a>
                  </p>
                ))}
              </PopupTableCell>
            </PopupTableRow>
          )}
        </PopupTableBody>
      </PopupTable>
    </Box>
  )
}

export default Popup
