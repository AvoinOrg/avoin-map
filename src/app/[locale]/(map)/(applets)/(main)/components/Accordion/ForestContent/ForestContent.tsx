import React from 'react'
import { css } from 'styled-system/css'

import { Legend } from '#/components/common/Legend'
import { LegendBox } from '#/components/common/LegendBox'

const contentRootClass = css({
  '& p:first-of-type': {
    marginTop: 0,
  },
})

const paragraphClass = css({
  margin: 0,
  marginBottom: '0.35em',
})

export const MatureForestContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      This layer shows forests that have reached the approximate threshold for
      regeneration felling.
    </p>
    <Legend>
      <LegendBox color="rgba(73, 25, 232, 0.65)" title="Mature forest" />
      <LegendBox color="rgba(206, 244, 66, 0.35)" title="Other forest" />
    </Legend>
  </div>
)

export const MangroveForestContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      This layer shows mangrove forests monitored by{' '}
      <a
        href="https://www.globalmangrovewatch.org/about/"
        target="_blank"
        rel="noopener noreferrer"
      >
        the Global Mangrove Watch
      </a>
      .
    </p>
    <p className={paragraphClass}>
      The data shown here is from 2010.
    </p>
  </div>
)

export const TropicalForestContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      <a
        href="https://www.globalforestwatch.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        The Global Forest Watch
      </a>{' '}
      tree plantations data combined with{' '}
      <a
        href="https://www.cifor.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        CIFOR data
      </a>{' '}
      of global wetlands.
    </p>
    <p className={paragraphClass}>
      Green areas are forest plantations that are on mineral soil and brown
      areas are those in peatlands.
    </p>
    <p className={paragraphClass}>
      Click on a forest plantation to view more information and estimated
      emission reduction potentials of peatland forest plantations when the
      groundwater level is lifted by 40 cm.
    </p>
  </div>
)

export const ForestCoverageContent = () => (
  <div className={contentRootClass}>
    <p className={paragraphClass}>
      <a
        href="https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2020_v1_8"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hansen/UMD/Google/USGS/NASA
      </a>{' '}
      global forest change data.
    </p>
    <p className={paragraphClass}>
      Shows global forest coverage from year 2000, forest cover loss from years
      2000-2020, and forest cover gain from years 2000-2012.
    </p>
    <Legend>
      <LegendBox color="green" title="Forest coverage (2000)" />
      <LegendBox color="red" title="Forest coverage loss (2000-2020)" />
      <LegendBox color="blue" title="Forest coverage gain (2000-2012)" />
      <LegendBox
        color="purple"
        title="Both gain (2000-2020) and loss (2000-2012)"
      />
    </Legend>
  </div>
)
