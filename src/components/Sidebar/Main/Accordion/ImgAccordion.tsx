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
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        flex: '1 1 0%', // collapsed: take available space
        '&.Mui-expanded': { flex: '0 0 auto' }, // expanded: natural height
        '&:before': { display: 'none' },

        // v6: MUI adds a heading wrapper element
        '& > .MuiAccordion-heading': {
          display: 'flex',
          flexDirection: 'column', // make vertical main axis
          flex: '1 1 0%', // this fills the Accordion root
          minHeight: '5rem', // your collapsed min height
        },
        '&.Mui-expanded > .MuiAccordion-heading': {
          flex: '0 0 5rem', // fixed when expanded
        },

        // (optional) keep Collapse from trying to eat flex space
        '& .MuiCollapse-root': { flex: '0 0 auto' },
      }}
    >
      <AccordionSummary
        sx={{
          position: 'relative',
          overflow: 'hidden',
          flex: '1 1 auto', // fill the heading vertically
          minHeight: 0, // allow shrinking
          p: 0,
          '& .MuiAccordionSummary-content': {
            zIndex: 2,
            m: 0,
            pl: 5,
            pr: 5,
            pt: 3,
            pb: 3,
          },
          '&.Mui-expanded .white-fade': { opacity: 0 },
          '&.Mui-expanded .dark-fade': { opacity: 1 },
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
            typography: 'h1',
            fontSize: '0.75rem',
            fontStyle: 'normal',
            fontWeight: 700,
            lineHeight: 'normal',
            letterSpacing: '0.075rem',
            textTransform: 'uppercase',
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
          }}
        >
          {children}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

export default ImgAccordion
