import React from 'react'
import {
  AccordionSummary,
  Typography,
  AccordionDetails,
  Box,
  Accordion,
} from '@mui/material'
import Image, { StaticImageData } from 'next/image'

interface Props {
  title: string
  img: string | StaticImageData
  children: React.ReactNode
}

const ImgAccordion = ({ title, img, children }: Props) => {
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        width: '100%',
        backgroundColor: 'background.paper',
        '&.Mui-expanded': {
          backgroundColor: 'primary.lighter',
        },
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        sx={{
          position: 'relative',
          overflow: 'hidden', // Clip the contents
          minHeight: '80px',
          p: 0, // Remove default padding
          '& .MuiAccordionSummary-content': {
            zIndex: 2, // Ensure text is above overlays
            m: 0, // Remove default margin
            pl: 5, // Add our own padding
            pr: 5,
            pt: 3,
            pb: 3,
          },
          // Hide white fade when expanded
          '&.Mui-expanded .white-fade': {
            opacity: 0,
          },
          // Show dark contrast overlay when expanded
          '&.Mui-expanded .dark-fade': {
            opacity: 1,
          },
        }}
      >
        <Image
          src={img}
          alt={title}
          fill
          style={{ objectFit: 'cover', zIndex: 0 }}
          sizes="(max-width: 400px) 100vw"
        />
        {/* White fade overlay for the collapsed state */}
        <Box
          className="white-fade"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(to right, white 20%, transparent 80%)',
            opacity: 1,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
        />
        {/* Dark contrast overlay for the expanded state */}
        <Box
          className="dark-fade"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(0,0,0,0.6) 30%, transparent 90%)',
            opacity: 0,
            transition: 'opacity 0.3s ease-in-out',
            zIndex: 1,
          }}
        />
        <Typography
          sx={{
            typography: 'h3',
            flexGrow: 1,
            transition: 'color 0.3s ease-in-out',
            zIndex: 2, // Ensure text is on top
            '.Mui-expanded &': {
              color: 'common.white', // Change text to white when expanded
            },
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ padding: 0 }}>
        <Box
          sx={{
            width: '100%',
            pl: 5,
            pr: 5,
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
