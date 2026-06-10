import React, { useEffect, useRef, useState } from 'react'
import { useTranslate } from '@tolgee/react'

import { Box } from '#/components/common/PandaBox'
import type { PandaStyleProp } from '#/common/style/panda'
import TText from '#/components/common/TText'
import {
  CARBON_CHANGE_COLORS,
  CARBON_CHANGE_NO_DATA_COLOR,
} from '../common/constants'
import { ArrowDown, ArrowUp } from '#/components/icons'

const NUMBER_OF_ITEMS = CARBON_CHANGE_COLORS.length + 1
const FLEX_BASIS = 100 / NUMBER_OF_ITEMS + '%'

type Props = { sx?: PandaStyleProp }

const CarbonChangeLegend = ({ sx }: Props) => {
  return (
    <>
      <Box sx={{ display: { xs: 'none', md: 'contents' } }}>
        <CarbonChangeLegendWide sx={sx}></CarbonChangeLegendWide>
      </Box>
      <Box sx={{ display: { xs: 'contents', md: 'none' } }}>
        <CarbonChangeLegendNarrow sx={sx}></CarbonChangeLegendNarrow>
      </Box>
    </>
  )
}

const CarbonChangeLegendWide = ({ sx }: Props) => {
  const { t } = useTranslate('hiilikartta')
  const noChangeTextRef = useRef<HTMLDivElement>(null)

  const [thirdTextRight, setThirdTextRight] = useState('0')
  const [fourthTextLeft, setFourthTextLeft] = useState('0')

  useEffect(() => {
    const element = noChangeTextRef.current
    if (!element) return

    const updatePositions = () => {
      const middleTextWidth = element.offsetWidth
      const middleTextPosition = (100 / NUMBER_OF_ITEMS) * 5
      setThirdTextRight(`calc(${middleTextPosition}% + 1.5rem)`)
      setFourthTextLeft(
        `calc(${middleTextPosition}% + ${middleTextWidth}px + 1.5rem)`
      )
    }

    updatePositions()
    const resizeObserver = new ResizeObserver(updatePositions)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
        }}
      >
        <LegendItem
          color={CARBON_CHANGE_NO_DATA_COLOR}
          label={t('report.carbon_change_legend.no_data')}
        ></LegendItem>
        {CARBON_CHANGE_COLORS.map((colorObj, index) => (
          <LegendItem
            color={colorObj.color}
            key={index}
            label={`${colorObj.min} – ${
              colorObj.max < 0 ? '(' + colorObj.max + ')' : colorObj.max
            }`}
          ></LegendItem>
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          width: '100%',
          mt: 1.5,
          height: '1.5rem',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0, // Aligns to the far left
            typography: 'body7',
            fontSize: '0.5rem',
            lineHeight: 'normal',
            letterSpacing: '0.05rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <b>
            <TText
              ns={'hiilikartta'}
              keyName={'report.carbon_change_legend.title'}
            />
          </b>
          <Box sx={{ mt: 0.7 }}>
            <TText
              ns={'hiilikartta'}
              keyName={'report.carbon_change_legend.unit'}
            />
          </Box>
        </Box>
        <Box
          component="span"
          ref={noChangeTextRef}
          sx={{
            position: 'absolute',
            top: 1,
            left: `calc((100% / ${NUMBER_OF_ITEMS}) * 5)`, // Aligns with the 6th item
            typography: 'body1',
            fontSize: '0.5rem',
            lineHeight: 'normal',
            letterSpacing: '0.05rem',
          }}
        >
          <TText
            ns={'hiilikartta'}
            keyName={'report.carbon_change_legend.no_change'}
          />
        </Box>
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: 1,
            right: thirdTextRight,
            left: 'auto',
            typography: 'body1',
            fontSize: '0.5rem',
            lineHeight: 'normal',
            letterSpacing: '0.05rem',
            color: '#C54032',
          }}
        >
          <TText
            ns={'hiilikartta'}
            keyName={'report.carbon_change_legend.stores_shrink'}
          />
          {' <<'}
        </Box>
        <Box
          component="span"
          sx={{
            position: 'absolute',
            top: 1,
            left: fourthTextLeft,
            typography: 'body1',
            fontSize: '0.5rem',
            lineHeight: 'normal',
            letterSpacing: '0.05rem',
            color: '#568175',
          }}
        >
          {'>> '}
          <TText
            ns={'hiilikartta'}
            keyName={'report.carbon_change_legend.stores_expand'}
          />
        </Box>
      </Box>
    </Box>
  )
}

const CarbonChangeLegendNarrow = ({ sx }: Props) => {
  const { t } = useTranslate('hiilikartta')
  const legendItemsRef = useRef<HTMLDivElement>(null)

  const [noChangeTextTop, setNoChangeTextTop] = useState('0')
  const [growTop, setGrowTop] = useState('0')
  const [shrinkTop, setShrinkTop] = useState('0')

  useEffect(() => {
    const element = legendItemsRef.current
    if (!element) return

    const updatePositions = () => {
      const containerHeight = element.offsetHeight
      // Assuming each item is of equal height and you want to align with the middle of the items
      const itemHeight = containerHeight / NUMBER_OF_ITEMS
      const newNoChangeTextTop = itemHeight * (NUMBER_OF_ITEMS / 2 - 0.5)
      setNoChangeTextTop(`${newNoChangeTextTop}px`)
      setGrowTop(`calc(${newNoChangeTextTop}px - 2rem)`)
      setShrinkTop(`calc(${newNoChangeTextTop}px + 1.5rem)`)
    }

    updatePositions()
    const resizeObserver = new ResizeObserver(updatePositions)
    resizeObserver.observe(element)

    return () => resizeObserver.disconnect()
  }, [])

  return (
    <Box
      sx={[
        { display: 'flex', flexDirection: 'column' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          typography: 'body7',
          fontSize: '0.75rem',
          lineHeight: 'normal',
          letterSpacing: '0.075rem',
          display: 'flex',
          flexDirection: 'column',
          pl: '5.5rem',
        }}
      >
        <b>
          <TText
            ns={'hiilikartta'}
            keyName={'report.carbon_change_legend.title'}
          />
        </b>
        <Box sx={{ mt: 0.7 }}>
          <TText
            ns={'hiilikartta'}
            keyName={'report.carbon_change_legend.unit'}
          />
        </Box>
      </Box>
      <Box
        sx={[
          {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
          },
        ]}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            position: 'relative',
            width: '5rem',
            minWidth: '5rem',
            maxWidth: '5rem',
            mr: '0.5rem',
            height: '100%',
          }}
        >
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: noChangeTextTop,
              typography: 'body1',
              fontSize: '0.5rem',
              lineHeight: 'normal',
              letterSpacing: '0.05rem',
              textAlign: 'right',
              width: '100%',
              pr: '1.15rem',
            }}
          >
            <TText
              ns={'hiilikartta'}
              keyName={'report.carbon_change_legend.no_change'}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: growTop,
              left: 'auto',
              color: '#568175',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              textAlign: 'right',
              width: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <Box
              component="span"
              sx={{
                typography: 'body1',
                fontSize: '0.5rem',
                lineHeight: 'normal',
                letterSpacing: '0.05rem',
              }}
            >
              <TText
                ns={'hiilikartta'}
                keyName={'report.carbon_change_legend.stores_expand'}
              />
            </Box>
            <ArrowUp
              sx={{
                fontSize: '1rem',
                height: 'auto',
                width: '1rem',
                ml: '0.4rem',
              }}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              top: shrinkTop,
              left: 'auto',
              color: '#C54032',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              textAlign: 'right',
            }}
          >
            <Box
              component="span"
              sx={{
                typography: 'body1',
                fontSize: '0.5rem',
                lineHeight: 'normal',
                letterSpacing: '0.05rem',
              }}
            >
              <TText
                ns={'hiilikartta'}
                keyName={'report.carbon_change_legend.stores_shrink'}
              />
            </Box>
            <ArrowDown
              sx={{
                fontSize: '1rem',
                height: 'auto',
                width: '1rem',
                ml: '0.4rem',
              }}
            />
          </Box>
        </Box>
        <Box
          ref={legendItemsRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          {[...CARBON_CHANGE_COLORS].reverse().map((colorObj, index) => (
            <LegendItemNarrow
              color={colorObj.color}
              key={index}
              label={`${colorObj.min} – ${
                colorObj.max < 0 ? '(' + colorObj.max + ')' : colorObj.max
              }`}
            ></LegendItemNarrow>
          ))}
          <LegendItemNarrow
            color={CARBON_CHANGE_NO_DATA_COLOR}
            label={t('report.carbon_change_legend.no_data')}
          ></LegendItemNarrow>
        </Box>
      </Box>
    </Box>
  )
}

const LegendItem = ({ color, label }: { color: string; label: string }) => {
  return (
    <Box
      sx={{
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: FLEX_BASIS,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        component="span"
        sx={{
          typography: 'body2',
          fontSize: '0.625rem',
          fontStyle: 'normal',
          lineHeight: 'normal',
          letterSpacing: '0.00625rem',
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          mt: '0.44rem',
          width: '100%',
          height: '0.625rem',
          backgroundColor: color,
        }}
      ></Box>
    </Box>
  )
}

const LegendItemNarrow = ({
  color,
  label,
}: {
  color: string
  label: string
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        mt: '0.78rem',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: '2.34rem',
          height: '0.46rem',
          backgroundColor: color,
          mr: '0.625rem',
        }}
      ></Box>
      <Box
        component="span"
        sx={{
          typography: 'body2',
          fontSize: '0.625rem',
          fontStyle: 'normal',
          lineHeight: 'normal',
          letterSpacing: '0.0625rem',
          width: 'auto',
        }}
      >
        {label}
      </Box>
    </Box>
  )
}

export default CarbonChangeLegend
