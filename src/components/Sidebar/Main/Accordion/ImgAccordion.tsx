import React from 'react'
import {
  AccordionSummary,
  Typography,
  AccordionDetails,
  Theme,
  Box,
  Accordion,
} from '@mui/material'

import CustomAccordion from '#/components/common/CustomAccordion'

const drawerWidth = 340

interface Props {
  title: string
  img: string
  children: React.ReactNode
}

const ImgAccordion = ({ title, img, children }: Props) => {
  return (
    <Accordion
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        ':before': {
          opacity: 0,
        },
        '&.Mui-expanded': {
          backgroundColor: 'primary.lighter',
        },
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary expandIcon={null}>
        <Typography
          sx={{
            typography: 'h3',
            flexGrow: 1,
            backgroundImage: `linear-gradient(to left, white, transparent), url(${img})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right',
            paddingRight: 2,
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        <Box
          sx={{
            width: '100%',
            padding: 2,
          }}
        >
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

const Content = (props: any) => {
  const { item, checked } = props

  const ContentComponent = item.content
  return <ContentComponent checked={checked} item={item.content} />
}

export default ImgAccordion
