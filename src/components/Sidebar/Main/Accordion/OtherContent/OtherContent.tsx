import React from 'react'
import { Box, Typography, Link } from '@mui/material'

export const AirQualityContent = () => (
  <Box>
    <Typography component="p" gutterBottom>
      Burning of fossil fuel creates air pollutants such as NO₂ and small
      particles.
    </Typography>
    <Typography component="p" gutterBottom>
      The satellite NO₂ data is based on Sentinel 5P measurements and is updated
      approximately once per 24 hours for any given location. A healthy
      threshold of NO₂ is around 50 umol/m<sup>2</sup>.
    </Typography>
  </Box>
)

export const SnowCoverLossContent = () => (
  <Box>
    <Typography component="p" gutterBottom>
      This layer shows the global decrease in the amount of snow over time.
      Each area shown corresponds to an area that between 1980 and 1990 had at
      least 10 days of snow on average. This average is contrasted with the
      average snowfall between 1996 and 2016.
    </Typography>
    <Typography component="p" gutterBottom>
      The data comes from FT-ESDR or{' '}
      <Link
        href="http://www.ntsg.umt.edu/freeze-thaw/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Freeze/Thaw Earth System Data Record
      </Link>
      .
    </Typography>
  </Box>
)
