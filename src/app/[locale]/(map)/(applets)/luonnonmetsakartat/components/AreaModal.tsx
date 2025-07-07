import React from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { T } from '@tolgee/react'
import { Cross } from '#/components/icons'
import { PopupProps } from '#/common/types/map'
import { MapModalWrapper } from '#/components/Map/MapModalWrapper'
import { FolayerFeatureProperties } from '../common/types'
import { SCROLLBAR_WIDTH_REM } from '#/common/style/theme/constants'
import { useLocaleFormatter } from '#/common/hooks/useLocaleFormatter'

const AreaModal = ({
  features,
  onClose,
}: PopupProps<FolayerFeatureProperties>) => {
  const { formatNumber } = useLocaleFormatter()
  const feature = features && features.length > 0 ? features[0] : null
  const properties = feature?.properties

  const minWidthBeforeFullScreen = 600

  return (
    <MapModalWrapper minWidthBeforeFullScreen={minWidthBeforeFullScreen}>
      <Box
        sx={{
          backgroundColor: '#3E3E3E',
          color: '#A9E7CB',
          minWidth: minWidthBeforeFullScreen + 'px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'auto',
          borderRadius: '0.625rem',
          maxHeight: '80rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-start', // Changed to move cross to the left
            pl: 0.5,
            pt: 1,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Cross sx={{ height: '1rem' }} />
          </IconButton>
        </Box>
        <Box
          sx={(theme) => ({
            overflowY: 'scroll',
            flexGrow: 1,
            pt: 1,
            pb: 4,
            pr: 4,
            pl: 6, // Increased left padding for content
            '@supports selector(::-webkit-scrollbar)': {
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#878787',
              },
            },
            '@supports not selector(::-webkit-scrollbar)': {
              scrollbarColor: `${theme.palette.neutral.main} transparent`,
            },
          })}
        >
          {properties ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}
              >
                <Typography variant="h2" sx={{ textTransform: 'uppercase' }}>
                  {properties.name}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    pl: 2,
                  }}
                >
                  {properties.municipality}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ textTransform: 'uppercase' }}>
                  {properties.area_ha
                    ? `${formatNumber(properties.area_ha, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} HEHTAARIA`
                    : ''}
                </Typography>
              </Box>
              <Box sx={{ mt: 4 }}>
                <Typography variant="body1">
                  {properties.description}
                </Typography>
              </Box>
            </>
          ) : (
            <Typography id="area-modal-description">
              <T keyName="no_features_selected" ns="luonnonmetsakartat">
                No features selected or data available.
              </T>
            </Typography>
          )}
        </Box>
      </Box>
    </MapModalWrapper>
  )
}

export default AreaModal
