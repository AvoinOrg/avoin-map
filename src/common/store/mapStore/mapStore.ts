'use client'

import { create, StateCreator } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import { createIndexedDbStorage } from '#/common/utils/store'
import { immer } from 'zustand/middleware/immer'

import {
  MapCoreActions,
  MapCoreSlice,
  MapCoreVars,
  createMapCoreSlice,
} from './mapCoreSlice'
import {
  MapLayerActions,
  MapLayerSlice,
  MapLayerVars,
  createMapLayerSlice,
} from './mapLayerSlice'
import {
  MapFeatureActions,
  MapFeatureSlice,
  MapFeatureVars,
  createMapFeatureSlice,
} from './mapFeatureSlice'
import {
  MapActionActions,
  MapActionSlice,
  MapActionVars,
  createMapActionSlice,
} from './mapActionSlice'
import {
  MapDrawActions,
  MapDrawSlice,
  MapDrawVars,
  createMapDrawSlice,
} from './mapDrawSlice'
import {
  MapDevActions,
  MapDevVars,
  MapDevSlice,
  createMapDevSlice,
} from './mapDevSlice'
import { commonDevtools } from '../shared-devtools'
import { enableMapSet } from 'immer'
import {
  QueueOptions,
  QueueOptionsEnforceKey,
  QueuePriority,
} from '#/common/types/map'
// import { LayerSlice, createLayerSlice } from './layerSlice'
// import { SelectionSlice, createSelectionSlice } from './selectionSlice'
// import { DrawSlice, createDrawSlice } from './drawSlice'
// import { ViewSlice, createViewSlice } from './viewSlice'

// Combine all slice types into a single store type

export type MapStoreActions = MapCoreActions &
  MapLayerActions &
  MapFeatureActions &
  MapActionActions &
  MapDrawActions &
  MapDevActions

export type MapStoreVars = MapCoreVars &
  MapLayerVars &
  MapFeatureVars &
  MapActionVars &
  MapDrawVars &
  MapDevVars

export type MapStoreState = MapCoreSlice &
  MapLayerSlice &
  MapFeatureSlice &
  MapActionSlice &
  MapDrawSlice &
  MapDevSlice
// &
//   LayerSlice &
//   SelectionSlice &
//   DrawSlice &
//   ViewSlice

export type MapStateCreator<S> = StateCreator<
  MapStoreState,
  [['zustand/immer', never]],
  [],
  S
>

export type MapStoreHelpers = {
  queueableFnInit: <A1 extends any[], A2 extends [queueOptions?: QueueOptions]>(
    fn: (...args: A1) => Promise<any>,
    queueOptions: QueueOptionsEnforceKey
  ) => (...args: [...A1, ...A2]) => Promise<any>
}

enableMapSet()

export const useMapStore = create<MapStoreState>()(
  // devtools(
  persist(
    immer((set, get, api) => {
      // A boilerplate for functions that are queued until the map object is ready
      const helpers = {
        queueableFnInit: <
          A1 extends any[],
          A2 extends [queueOptions?: QueueOptions]
        >(
          fn: (...args: A1) => Promise<any>,
          queueOptions: QueueOptionsEnforceKey
        ) => {
          const queueableFn = async (
            fnWithArgs: { fn: (...args: A1) => Promise<any>; args: A1 },
            queueOptions: QueueOptionsEnforceKey
          ) => {
            const { isLoaded, _addToFunctionQueue } = get()

            if (!isLoaded && !queueOptions.skipQueue) {
              return _addToFunctionQueue({
                fn: fnWithArgs.fn,
                args: fnWithArgs.args,
                priority: queueOptions.priority,
                key: queueOptions.key,
                allowDuplicates: queueOptions.allowDuplicates,
              })
            }

            return fnWithArgs.fn(...fnWithArgs.args)
          }

          return new Proxy(fn, {
            apply(_target, _thisArg, args) {
              const fnArgs = args.slice(0, fn.length) as A1

              // initialize queue options with values from the function initialization.
              // If they don't exist, use the default values.
              const qOpts: QueueOptionsEnforceKey = {
                skipQueue:
                  queueOptions?.skipQueue != null
                    ? queueOptions?.skipQueue
                    : false,
                priority:
                  queueOptions?.priority != null
                    ? queueOptions?.priority
                    : QueuePriority.LOW,
                key: queueOptions?.key,
              }

              // Overwrite queue options with values from the function call.
              if (fn.length < args.length) {
                const qArgs = args[fn.length] as QueueOptions
                qOpts.skipQueue =
                  qArgs?.skipQueue != null ? qArgs?.skipQueue : qOpts.skipQueue
                qOpts.priority =
                  qArgs?.priority != null ? qArgs?.priority : qOpts.priority
                qOpts.key = qArgs?.key != null ? qArgs?.key : qOpts.key
                qOpts.allowDuplicates =
                  qArgs?.allowDuplicates != null
                    ? qArgs?.allowDuplicates
                    : qOpts.allowDuplicates
              }
              return queueableFn({ fn: fn, args: fnArgs }, qOpts)
            },
          }) as unknown as (...args: [...A1, ...A2]) => Promise<any>
        },
      }

      return {
        ...createMapCoreSlice(helpers)(set, get, api),
        ...createMapLayerSlice(helpers)(set, get, api),
        ...createMapFeatureSlice(helpers)(set, get, api),
        ...createMapActionSlice(helpers)(set, get, api),
        ...createMapDrawSlice(helpers)(set, get, api),
        ...createMapDevSlice(helpers)(set, get, api),
      }
      // ...createLayerSlice(...args),
      // ...createSelectionSlice(...args),
      // ...createDrawSlice(...args),
      // ...createViewSlice(...args),
    }),
    {
      name: 'mapStorage', // name of item in the storage (must be unique)
      storage: createJSONStorage(
        createIndexedDbStorage({
          dbName: 'map-store',
          storeName: 'mapStorage',
        })
      ),
      partialize: (state: MapStoreState) => {
        return {
          // TODO: fix hydration. Currently rehydrates layerGroups that do not have data
          _hydrationData: {
            layerGroups: {},
            // layerGroups: state._layerGroups,
            persistingLayerGroupAddOptions:
              state._persistingLayerGroupAddOptions,
          },
        }
      },
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error(
              'map store: an error happened during hydration',
              error
            )
          }
          state?._runHydrationActions()
        }
      },
    }
  )
  //   {
  //     ...commonDevtools,
  //     store: 'mapStore',
  //   }
  // )
)
