import * as React from 'react'
import AccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary'
import ArrowDown from '#/components/icons/ArrowDown'

const CustomAccordionSummary = ({
  expandIcon = <ArrowDown />,
  sx,
  children,
  ...accordionSummaryProps
}: AccordionSummaryProps & { children: React.ReactNode }) => {
  return (
    <AccordionSummary
      expandIcon={expandIcon}
      disableRipple
      disableTouchRipple
      sx={[
        {
          '& .MuiAccordionSummary-content': {
            width: '100%',
            display: 'flex',
            flexGrow: 1,
          },
          '&.Mui-focusVisible': {
            backgroundColor: 'transparent',
          },
          '&:active': {
            backgroundColor: 'transparent',
          },
          '& .MuiTouchRipple-root': {
            display: 'none',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...accordionSummaryProps}
    >
      {children}
    </AccordionSummary>
  )
}

export default CustomAccordionSummary
