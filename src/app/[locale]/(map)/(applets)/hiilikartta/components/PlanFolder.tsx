'use client'

import React from 'react'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

import { Folder } from '#/components/common/Folder'
import { Box } from '#/components/common/PandaBox'
import SimpleTooltip from '#/components/common/SimpleTooltip'
import TText from '#/components/common/TText'
import { Error as ErrorIcon, Exclamation, Info } from '#/components/icons'
import EditableText from '#/components/common/EditableText'
import { LoadingSpinner } from '#/components/Loading'

import { CalculationState, PlanConf } from '../common/types'
import { useAppletStore } from '../state/appletStore'
import { planPostMutation } from '../common/queries/planPostMutation'
import SaveIcon from './SaveIcon'

const PlanFolder = ({
  planConf,
  height,
  isNameEditable = false,
}: {
  planConf: PlanConf
  height: number
  isNameEditable?: boolean
}) => {
  const updatePlanConf = useAppletStore((state) => state.updatePlanConf)
  const planPost = useMutation(planPostMutation())
  const { status } = useSession()
  const { t } = useTranslate('hiilikartta')

  const isSaveEnabled =
    status === 'authenticated' &&
    !planPost.isPending &&
    ![CalculationState.INITIALIZING, CalculationState.CALCULATING].includes(
      planConf.calculationState
    ) &&
    planConf.data.features.length > 0

  const handleNameChange = (event: { target: { value: string } }) => {
    updatePlanConf(planConf.id, { name: event.target.value })
  }

  const handleSyncClick = (
    event: React.MouseEvent<Element> | React.KeyboardEvent<Element>
  ) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation?.()

    if (planConf) {
      planPost.mutate(planConf)
    }
  }

  const handleSyncKeyDown = (event: React.KeyboardEvent) => {
    if (!isSaveEnabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      handleSyncClick(event)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          mb: '-0.8rem',
          zIndex: 1000,
          color:
            planPost.isError && !planPost.isPending
              ? 'warning.dark'
              : 'neutral.darker',
        }}
      >
        <SimpleTooltip
          title={
            [
              CalculationState.INITIALIZING,
              CalculationState.CALCULATING,
            ].includes(planConf.calculationState)
              ? t(
                  'sidebar.my_plans.unable_to_save_with_calculations_in_progress'
                )
              : planConf.data.features.length === 0
              ? t('sidebar.my_plans.unable_to_save_empty_plan')
              : status !== 'authenticated'
              ? t('sidebar.my_plans.sign_in_to_save')
              : t('sidebar.my_plans.unable_to_save')
          }
          disabled={isSaveEnabled || planPost.isPending}
        >
          <Box
            component="span"
            onClick={isSaveEnabled ? handleSyncClick : undefined}
            role="button"
            tabIndex={isSaveEnabled ? 0 : undefined}
            aria-disabled={!isSaveEnabled ? 'true' : undefined}
            aria-label={
              planPost.isPending
                ? `Saving plan ${planConf.name}`
                : `Save plan ${planConf.name}`
            }
            onKeyDown={handleSyncKeyDown}
            sx={{
              display: 'inline-flex',
              flexDirection: 'row',
              alignItems: 'end',
              '&:hover': {
                cursor: planPost.isPending
                  ? 'wait'
                  : isSaveEnabled
                  ? 'pointer'
                  : 'not-allowed',
              },
              mr: '1px',
              height: '16px',
              opacity: isSaveEnabled ? 1 : 0.6,
            }}
          >
            {planConf.cloudLastSaved && !planPost.isPending && (
              <>
                <Box
                  component="span"
                  sx={{ display: 'inline', typography: 'body7', mr: 0.5 }}
                >
                  <TText
                    ns="hiilikartta"
                    keyName="sidebar.plan_settings.last_saved"
                  />
                </Box>
                <Box component="span" sx={{ display: 'inline', typography: 'body7' }}>
                  {new Date(planConf.cloudLastSaved).toLocaleString()}
                </Box>
              </>
            )}
            {!planConf.cloudLastSaved && !planPost.isPending && (
              <>
                <Box component="span" sx={{ display: 'inline', typography: 'body7' }}>
                  <TText
                    ns="hiilikartta"
                    keyName="sidebar.plan_settings.save_plan"
                  />
                </Box>
              </>
            )}
            {planPost.isPending && (
              <>
                <Box component="span" sx={{ display: 'inline', typography: 'body7' }}>
                  <TText
                    ns="hiilikartta"
                    keyName="sidebar.plan_settings.saving_plan"
                  />
                </Box>
              </>
            )}
            {planPost.isPending && (
              <LoadingSpinner
                color="secondary"
                size={15}
                sx={{ height: '12px', ml: '4px', mr: '3px', mb: '1px' }}
              />
            )}
            {!planPost.isPending && (
              <SaveIcon
                sx={{
                  ml: '4px',
                  mb: '-3px',
                  color:
                    planPost.isError && !planPost.isPending
                      ? 'warning.dark'
                      : '#71797E',
                }}
              ></SaveIcon>
            )}
            {planPost.isError && !planPost.isPending && (
              <>
                <Exclamation
                  sx={{ height: '1.1rem', mb: '0.5px', color: 'warning.dark' }}
                ></Exclamation>
              </>
              )}
          </Box>
        </SimpleTooltip>
      </Box>

      <Folder height={height}>
        <Box
          sx={{
            pt: 2,
            pl: 3,
            pb: 3,
            pr: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: '1',
            height: '100%',
          }}
        >
          {isNameEditable ? (
            <EditableText
              textSx={{ typography: 'h2', color: 'neutral.darker' }}
              value={planConf.name}
              onChange={handleNameChange}
              textFieldAriaLabel={`Plan name for ${planConf.name}`}
              editButtonAriaLabel={`Edit plan name ${planConf.name}`}
              saveButtonAriaLabel={`Save plan name ${planConf.name}`}
              cancelButtonAriaLabel={`Cancel editing plan name ${planConf.name}`}
            />
          ) : (
            <Box
              component="h2"
              sx={{ m: 0, typography: 'h2', color: 'neutral.darker' }}
            >
              {planConf.name}
            </Box>
          )}

          {![CalculationState.NOT_STARTED].includes(
            planConf.calculationState
          ) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
              }}
            >
              {[
                CalculationState.INITIALIZING,
                CalculationState.CALCULATING,
              ].includes(planConf.calculationState) && (
                <>
                  <Box
                    sx={{
                      typography: 'h7',
                      color: 'secondary.dark',
                      lineHeight: '1',
                    }}
                  >
                    <TText
                      keyName={
                        planConf.calculationState ===
                        CalculationState.INITIALIZING
                          ? 'sidebar.my_plans.calculations_starting'
                          : 'sidebar.my_plans.calculations_in_progress'
                      }
                      ns={'hiilikartta'}
                    />
                  </Box>

                  <LoadingSpinner
                    color="secondary"
                    size={25}
                    sx={{ height: '10px' }}
                  />
                </>
              )}
              {planConf.calculationState === CalculationState.ERRORED && (
                <>
                  <Box
                    sx={{
                      typography: 'h7',
                      color: 'warning.dark',
                      lineHeight: '1',
                    }}
                  >
                    <TText
                      keyName={'sidebar.my_plans.calculations_errored'}
                      ns={'hiilikartta'}
                    />
                  </Box>
                  <ErrorIcon
                    sx={{ color: 'warning.dark', height: '24px' }}
                  ></ErrorIcon>
                </>
              )}
              {planConf.calculationState === CalculationState.FINISHED && (
                <>
                  <Box
                    sx={{
                      typography: 'h7',
                      color: 'secondary.dark',
                      lineHeight: '1',
                    }}
                  >
                    <TText
                      keyName={'sidebar.my_plans.calculations_finished'}
                      ns={'hiilikartta'}
                    />
                  </Box>
                  <Info sx={{ color: 'secondary.dark', height: '24px' }}></Info>
                </>
              )}
            </Box>
          )}
        </Box>
      </Folder>
    </Box>
  )
}

export default PlanFolder
