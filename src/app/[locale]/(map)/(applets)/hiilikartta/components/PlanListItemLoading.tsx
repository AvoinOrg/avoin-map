'use client'

import {
  Box,
  type AppSystemStyleObject,
  toSxArray,
} from '#/common/style/theme'

type SkeletonBlockProps = {
  sx?: AppSystemStyleObject
}

type AppSxItem = Exclude<NonNullable<AppSystemStyleObject>, readonly unknown[]>

const toAppSxItemArray = (sx?: AppSystemStyleObject) =>
  toSxArray(sx) as AppSxItem[]

const SkeletonBlock = ({ sx }: SkeletonBlockProps) => (
  <Box
    aria-hidden="true"
    sx={[
      {
        display: 'block',
        flexShrink: 0,
        borderRadius: '0.2rem',
      },
      ...toAppSxItemArray(sx),
    ]}
  />
)

const PlanListItemLoading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.75rem',
        py: '0.75rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.875rem',
          flex: 1,
          minWidth: 0,
        }}
      >
        <SkeletonBlock
          sx={{
            width: '0.75rem',
            height: '0.5625rem',
            borderRadius: '0.2rem',
            mt: '0.25rem',
            bgcolor: 'rgba(13, 96, 68, 0.12)',
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            flex: 1,
            minWidth: 0,
          }}
        >
          <SkeletonBlock
            sx={{
              width: '40%',
              height: '1rem',
              borderRadius: '999px',
              bgcolor: 'rgba(17, 17, 17, 0.08)',
            }}
          />
          <SkeletonBlock
            sx={{
              width: '58%',
              height: '0.875rem',
              borderRadius: '999px',
              bgcolor: 'rgba(17, 17, 17, 0.06)',
            }}
          />
        </Box>
      </Box>

      <SkeletonBlock
        sx={{
          width: '1rem',
          height: '1rem',
          borderRadius: '50%',
          bgcolor: 'rgba(17, 17, 17, 0.08)',
          flexShrink: 0,
        }}
      />
    </Box>
  )
}

export default PlanListItemLoading
