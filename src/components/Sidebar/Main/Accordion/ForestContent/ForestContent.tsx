import React from 'react'
import { Box, Typography, Link } from '@mui/material'
import { Legend } from '#/components/common/Legend'

const LegendBox = ({ color, title }: { color: string; title: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
    <Box
      sx={{
        backgroundColor: color,
        border: '1px solid black',
        width: '1rem',
        height: '1rem',
        mr: 1,
        flexShrink: 0,
      }}
    />
    <Typography>{title}</Typography>
  </Box>
)

const InfoContainer = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      '& .MuiTypography-paragraph:first-of-type': {
        mt: 0,
      },
    }}
  >
    {children}
  </Box>
)

export const MatureForestContent = () => (
  <InfoContainer>
    <Typography component="p" gutterBottom>
      This layer shows forests that have reached the approximate threshold for
      regeneration felling.
    </Typography>
    <Legend>
      <LegendBox color="rgba(73, 25, 232, 0.65)" title="Mature forest" />
      <LegendBox color="rgba(206, 244, 66, 0.35)" title="Other forest" />
    </Legend>
  </InfoContainer>
)

export const MangroveForestContent = () => (
  <InfoContainer>
    <Typography component="p" gutterBottom>
      This layer shows mangrove forests monitored by{' '}
      <Link
        href="https://www.globalmangrovewatch.org/about/"
        target="_blank"
        rel="noopener noreferrer"
      >
        the Global Mangrove Watch
      </Link>
      .
    </Typography>
    <Typography component="p" gutterBottom>
      The data shown here is from 2010.
    </Typography>
  </InfoContainer>
)

export const TropicalForestContent = () => (
  <InfoContainer>
    <Typography component="p" gutterBottom>
      <Link
        href="https://www.globalforestwatch.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        The Global Forest Watch
      </Link>{' '}
      tree plantations data combined with{' '}
      <Link
        href="https://www.cifor.org/"
        target="_blank"
        rel="noopener noreferrer"
      >
        CIFOR data
      </Link>{' '}
      of global wetlands.
    </Typography>
    <Typography component="p" gutterBottom>
      Green areas are forest plantations that are on mineral soil and brown
      areas are those in peatlands.
    </Typography>
    <Typography component="p" gutterBottom>
      Click on a forest plantation to view more information and estimated
      emission reduction potentials of peatland forest plantations when the
      groundwater level is lifted by 40 cm.
    </Typography>
  </InfoContainer>
)

export const ForestCoverageContent = () => (
  <InfoContainer>
    <Typography component="p" gutterBottom>
      <Link
        href="https://developers.google.com/earth-engine/datasets/catalog/UMD_hansen_global_forest_change_2020_v1_8"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hansen/UMD/Google/USGS/NASA
      </Link>{' '}
      global forest change data.
    </Typography>
    <Typography component="p" gutterBottom>
      Shows global forest coverage from year 2000, forest cover loss from years
      2000-2020, and forest cover gain from years 2000-2012.
    </Typography>
    <Legend>
      <LegendBox color="green" title="Forest coverage (2000)" />
      <LegendBox color="red" title="Forest coverage loss (2000-2020)" />
      <LegendBox color="blue" title="Forest coverage gain (2000-2012)" />
      <LegendBox
        color="purple"
        title="Both gain (2000-2020) and loss (2000-2012)"
      />
    </Legend>
  </InfoContainer>
)
