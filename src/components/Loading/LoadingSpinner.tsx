import React from 'react'
import {
  Box,
  type AppSxProps,
  type AppTheme,
  toSxArray,
} from '#/common/style/theme'

type LoadingSpinnerColor =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'
  | 'inherit'

type LoadingSpinnerProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> & {
  sx?: AppSxProps
  size?: number | string
  color?: LoadingSpinnerColor
  variant?: 'indeterminate' | 'determinate'
  thickness?: number
  disableShrink?: boolean
  value?: number
}

type AppSxItem = Exclude<NonNullable<AppSxProps>, readonly unknown[]>

const toLoadingSpinnerSxArray = (sx?: AppSxProps) =>
  toSxArray(sx) as AppSxItem[]

const LOADING_SPINNER_COLOR_FALLBACKS: Record<
  Exclude<LoadingSpinnerColor, 'inherit'>,
  string
> = {
  primary: '#C7C9B8',
  secondary: '#5d77ff',
  error: '#d32f2f',
  info: '#F09C4D',
  success: '#2e7d32',
  warning: '#EA7101',
}

const LOADING_SPINNER_VIEWBOX_SIZE = 44
const LOADING_SPINNER_CENTER = LOADING_SPINNER_VIEWBOX_SIZE / 2
const LOADING_SPINNER_ANIMATION_DURATION = '1.4s'
const LOADING_SPINNER_MIN_THICKNESS = 1

const clampProgress = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0

const getLoadingSpinnerColor = ({
  theme,
  color,
}: {
  theme: AppTheme
  color: LoadingSpinnerColor
}) => {
  if (color === 'inherit') {
    return 'currentColor'
  }

  const paletteColor = theme.palette[color] as { main?: string } | undefined
  return paletteColor?.main ?? LOADING_SPINNER_COLOR_FALLBACKS[color]
}

export const LoadingSpinner = ({
  sx,
  size = '4rem',
  color = 'primary',
  variant = 'indeterminate',
  thickness = 3.6,
  disableShrink = false,
  value = 0,
  className,
  style,
  role,
  'aria-valuenow': ariaValueNow,
  'aria-valuemin': ariaValueMin,
  'aria-valuemax': ariaValueMax,
  ...rest
}: LoadingSpinnerProps) => {
  const isIndeterminate = variant === 'indeterminate'
  const safeThickness = Math.max(LOADING_SPINNER_MIN_THICKNESS, thickness)
  const clampedValue = isIndeterminate ? 0 : clampProgress(value)
  const radius = Math.max((LOADING_SPINNER_VIEWBOX_SIZE - safeThickness) / 2, 0)
  const circumference = 2 * Math.PI * radius
  const progressStrokeLength = (circumference * clampedValue) / 100
  const determinateStrokeGap = Math.max(circumference - progressStrokeLength, 0)

  const dashMin = circumference * 0.07
  const dashMax = circumference * 0.6
  const dashStatic = circumference * 0.72
  const dashMinRest = Math.max(circumference - dashMin, 0)
  const dashMaxRest = Math.max(circumference - dashMax, 0)
  const dashStaticRest = Math.max(circumference - dashStatic, 0)
  const dashOffsetMid = -circumference * 0.3
  const dashOffsetMax = -circumference * 0.95

  return (
    <Box
      component="span"
      role={role ?? 'progressbar'}
      aria-valuenow={!isIndeterminate ? ariaValueNow ?? clampedValue : ariaValueNow}
      aria-valuemin={!isIndeterminate ? ariaValueMin ?? 0 : ariaValueMin}
      aria-valuemax={!isIndeterminate ? ariaValueMax ?? 100 : ariaValueMax}
      className={className}
      sx={[
        (theme) => ({
          display: 'inline-block',
          width: size,
          height: size,
          color: getLoadingSpinnerColor({ theme, color }),
        }),
        ...toLoadingSpinnerSxArray(sx),
      ]}
      style={style}
      {...rest}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox={`0 0 ${LOADING_SPINNER_VIEWBOX_SIZE} ${LOADING_SPINNER_VIEWBOX_SIZE}`}
      >
        <circle
          cx={LOADING_SPINNER_CENTER}
          cy={LOADING_SPINNER_CENTER}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={safeThickness}
          strokeLinecap="round"
          opacity={0.9}
          strokeDasharray={
            isIndeterminate
              ? disableShrink
                ? `${dashStatic} ${dashStaticRest}`
                : `${dashMin} ${dashMinRest}`
              : `${progressStrokeLength} ${determinateStrokeGap}`
          }
          strokeDashoffset={
            isIndeterminate
              ? disableShrink
                ? circumference * 0.28
                : 0
              : Math.max(circumference - progressStrokeLength, 0)
          }
          transform={`rotate(-90 ${LOADING_SPINNER_CENTER} ${LOADING_SPINNER_CENTER})`}
          style={{
            transition: !isIndeterminate ? 'stroke-dashoffset 0.35s linear' : undefined,
          }}
        >
          {isIndeterminate ? (
            <>
              <animateTransform
                attributeName="transform"
                additive="sum"
                type="rotate"
                from={`0 ${LOADING_SPINNER_CENTER} ${LOADING_SPINNER_CENTER}`}
                to={`360 ${LOADING_SPINNER_CENTER} ${LOADING_SPINNER_CENTER}`}
                dur={LOADING_SPINNER_ANIMATION_DURATION}
                repeatCount="indefinite"
                begin="0s"
                fill="freeze"
              />
              {disableShrink ? null : (
                <>
                  <animate
                    attributeName="stroke-dasharray"
                    dur={LOADING_SPINNER_ANIMATION_DURATION}
                    values={`${dashMin} ${dashMinRest};${dashMax} ${dashMaxRest};${dashMin} ${dashMinRest}`}
                    keyTimes="0;0.5;1"
                    calcMode="linear"
                    repeatCount="indefinite"
                    begin="0s"
                    fill="freeze"
                  />
                  <animate
                    attributeName="stroke-dashoffset"
                    dur={LOADING_SPINNER_ANIMATION_DURATION}
                    values={`0;${dashOffsetMid};${dashOffsetMax};0`}
                    keyTimes="0;0.25;0.75;1"
                    calcMode="linear"
                    repeatCount="indefinite"
                    begin="0s"
                    fill="freeze"
                  />
                </>
              )}
            </>
          ) : null}
        </circle>
      </svg>
    </Box>
  )
}
