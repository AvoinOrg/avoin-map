import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import { useTranslate } from '@tolgee/react'
import { useMutation } from '@tanstack/react-query'

import { useAuthSession } from '#/common/auth'
import {
  Box,
  type AppSystemStyleObject,
  toSxArray,
} from '#/common/style/theme'
import { Folder } from '#/components/common/Folder'
import { Error as ErrorIcon, Exclamation, Info } from '#/components/icons'
import EditableText, {
  type EditableTextEvent,
} from '#/components/common/EditableText'
import { LoadingSpinner } from '#/components/Loading'

import { CalculationState, PlanConf } from '../common/types'
import { useAppletStore } from '../state/appletStore'
import { usePlanPostMutation } from '../common/queries/planPostMutation'

type AppSxItem = Exclude<NonNullable<AppSystemStyleObject>, readonly unknown[]>
type SaveTooltipTriggerProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  'color'
> & {
  ref?: React.Ref<HTMLElement>
}

const toAppSxItemArray = (sx?: AppSystemStyleObject) =>
  toSxArray(sx) as AppSxItem[]

const SvgBox = Box as unknown as React.ComponentType<
  React.ComponentProps<'svg'> & {
    component?: 'svg'
    sx?: AppSystemStyleObject
  }
>

const SavePlanIcon = ({ sx }: { sx?: AppSystemStyleObject }) => (
  <SvgBox
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
    sx={[
      {
        display: 'inline-block',
        width: '1.5rem',
        height: '1.5rem',
        flexShrink: 0,
      },
      ...toAppSxItemArray(sx),
    ]}
  >
    <path
      fill="currentColor"
      d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4ZM12 19c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3ZM6 5h9v4H6V5Zm13 14H5V5h.5v6h11V5.17L19 7.67V19Z"
    />
  </SvgBox>
)

const DisabledSaveTooltip = ({
  title,
  disabled,
  children,
}: {
  title: React.ReactNode
  disabled: boolean
  children: (props: SaveTooltipTriggerProps) => React.ReactElement
}) => {
  if (disabled || title == null) {
    return children({})
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        delay={0}
        closeDelay={0}
        render={(triggerProps) => {
          const {
            color: ignoredColor,
            type: ignoredType,
            ...resolvedTriggerProps
          } = triggerProps as SaveTooltipTriggerProps & {
            color?: string
            type?: string
          }
          void ignoredColor
          void ignoredType

          return children(resolvedTriggerProps)
        }}
      />
      <Tooltip.Portal>
        <Tooltip.Positioner
          side="bottom"
          sideOffset={8}
          style={{ zIndex: 1500, pointerEvents: 'none' }}
        >
          <Tooltip.Popup
            style={{ position: 'relative', pointerEvents: 'none' }}
            render={(popupProps) => (
              <Box
                {...popupProps}
                role="tooltip"
                sx={{
                  maxWidth: 240,
                  px: 1,
                  py: 0.75,
                  borderRadius: '5px',
                  backgroundColor: '#111111',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  lineHeight: 1.35,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.22)',
                }}
              >
                {title}
                <Tooltip.Arrow
                  render={(arrowProps) => (
                    <Box
                      {...arrowProps}
                      sx={{
                        position: 'absolute',
                        width: 8,
                        height: 8,
                        top: -4,
                        left: 'calc(50% - 4px)',
                        backgroundColor: '#111111',
                        transform: 'rotate(45deg)',
                      }}
                    />
                  )}
                />
              </Box>
            )}
          />
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

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
  const planPost = useMutation(usePlanPostMutation())
  const { status } = useAuthSession()
  const { t } = useTranslate('hiilikartta')

  const isSaveEnabled =
    status === 'authenticated' &&
    !planPost.isPending &&
    ![CalculationState.INITIALIZING, CalculationState.CALCULATING].includes(
      planConf.calculationState
    ) &&
    planConf.data.features.length > 0

  const handleNameChange = (event: EditableTextEvent) => {
    updatePlanConf(planConf.id, { name: event.target.value })
  }

  const handleSyncClick = (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
  ) => {
    event.preventDefault()
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()

    if (planConf) {
      planPost.mutate(planConf)
    }
  }

  const handleSyncKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (!isSaveEnabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      handleSyncClick(event)
    }
  }

  const disabledSaveTooltipTitle = [
    CalculationState.INITIALIZING,
    CalculationState.CALCULATING,
  ].includes(planConf.calculationState)
    ? t('sidebar.my_plans.unable_to_save_with_calculations_in_progress')
    : planConf.data.features.length === 0
      ? t('sidebar.my_plans.unable_to_save_empty_plan')
      : status !== 'authenticated'
        ? t('sidebar.my_plans.sign_in_to_save')
        : t('sidebar.my_plans.unable_to_save')

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
        <DisabledSaveTooltip
          title={disabledSaveTooltipTitle}
          disabled={isSaveEnabled || planPost.isPending}
        >
          {(tooltipTriggerProps) => {
            const handleSaveActionClick = (
              event: React.MouseEvent<HTMLElement>
            ) => {
              tooltipTriggerProps.onClick?.(event)

              if (isSaveEnabled) {
                handleSyncClick(event)
              }
            }

            const handleSaveActionKeyDown = (
              event: React.KeyboardEvent<HTMLElement>
            ) => {
              tooltipTriggerProps.onKeyDown?.(event)
              handleSyncKeyDown(event)
            }

            return (
              <Box
                {...tooltipTriggerProps}
                onClick={handleSaveActionClick}
                role="button"
                tabIndex={isSaveEnabled ? 0 : undefined}
                aria-disabled={!isSaveEnabled ? 'true' : undefined}
                aria-label={
                  planPost.isPending
                    ? `Saving plan ${planConf.name}`
                    : `Save plan ${planConf.name}`
                }
                onKeyDown={handleSaveActionKeyDown}
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
                      {t('sidebar.plan_settings.last_saved')}
                    </Box>
                    <Box
                      component="span"
                      sx={{ display: 'inline', typography: 'body7' }}
                    >
                      {new Date(planConf.cloudLastSaved).toLocaleString()}
                    </Box>
                  </>
                )}
                {!planConf.cloudLastSaved && !planPost.isPending && (
                  <>
                    <Box
                      component="span"
                      sx={{ display: 'inline', typography: 'body7' }}
                    >
                      {t('sidebar.plan_settings.save_plan')}
                    </Box>
                  </>
                )}
                {planPost.isPending && (
                  <>
                    <Box
                      component="span"
                      sx={{ display: 'inline', typography: 'body7' }}
                    >
                      {t('sidebar.plan_settings.saving_plan')}
                    </Box>
                  </>
                )}
                {planPost.isPending && (
                  <LoadingSpinner
                    color="secondary"
                    size={15}
                    sx={{
                      height: '12px',
                      ml: '4px',
                      mr: '3px',
                      mb: '1px',
                    }}
                  />
                )}
                {!planPost.isPending && (
                  <SavePlanIcon
                    sx={{
                      ml: '4px',
                      mb: '-3px',
                      color:
                        planPost.isError && !planPost.isPending
                          ? 'warning.dark'
                          : '#71797E',
                    }}
                  />
                )}
                {planPost.isError && !planPost.isPending && (
                  <>
                    <Exclamation
                      sx={{
                        height: '1.1rem',
                        mb: '0.5px',
                        color: 'warning.dark',
                      }}
                    ></Exclamation>
                  </>
                )}
              </Box>
            )
          }}
        </DisabledSaveTooltip>
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
              component="span"
              sx={{ typography: 'h2', color: 'neutral.darker' }}
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
                    {t(
                      planConf.calculationState === CalculationState.INITIALIZING
                        ? 'sidebar.my_plans.calculations_starting'
                        : 'sidebar.my_plans.calculations_in_progress'
                    )}
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
                    {t('sidebar.my_plans.calculations_errored')}
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
                    {t('sidebar.my_plans.calculations_finished')}
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
