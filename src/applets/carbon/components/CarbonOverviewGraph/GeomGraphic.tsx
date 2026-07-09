import React from 'react'
import { geoPath, geoMercator } from 'd3-geo'
import { Box, toSxArray } from '#/common/style/theme/system'
import type { CalcFeatureCollection } from '../../common/types'
import {
  getCarbonChangeColor,
  getCarbonValueForProperties,
} from 'applets/carbon/common/utils'

type Props = {
  calcFeatures: CalcFeatureCollection
  year: string
  width: number
  height: number
  sx?: React.ComponentProps<typeof Box>['sx']
}

type SvgBoxProps = React.SVGProps<SVGSVGElement> & {
  component: 'svg'
  sx?: React.ComponentProps<typeof Box>['sx']
}

const SvgBox = Box as React.ElementType<SvgBoxProps>

const GeomGraphic = ({ calcFeatures, year, width, height, sx }: Props) => {
  const projection = geoMercator().fitSize([width, height], calcFeatures)
  const pathGenerator = geoPath().projection(projection)

  const bounds = geoPath().projection(projection).bounds(calcFeatures)
  const viewBoxY = bounds[0][1] // Use only the top y-coordinate of the bounds

  return (
    <SvgBox
      component={'svg'}
      width={width}
      height={height}
      viewBox={`0 ${viewBoxY} ${width} ${height}`}
      sx={toSxArray(sx)}
    >
      <rect x={0} y={0} width={width} height={height} fill={'none'} rx={14} />
      <g>
        {calcFeatures.features.map((feature, index) => {
          const path = pathGenerator(feature)
          const carbonValue = getCarbonValueForProperties(
            feature.properties,
            year,
            'total'
          )
          const color = getCarbonChangeColor(carbonValue)

          return (
            <path
              key={index}
              d={path || ''}
              fill={color}
              stroke={'black'}
              strokeWidth={1}
            />
          )
        })}
      </g>
    </SvgBox>
  )
}

export default GeomGraphic
