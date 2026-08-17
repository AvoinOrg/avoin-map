export type AppletSelectionInput = string | readonly string[] | null | undefined

export type NormalizedAppletSelection = {
  compiledApplets: readonly string[]
  unknownApplets: readonly string[]
}

export type AppletSelection<Namespace extends string = string> = {
  compiledApplets: readonly Namespace[]
  selectedNonMainApplets: readonly Exclude<Namespace, 'main'>[]
  includesMain: boolean
  isStandalone: boolean
  standaloneApplet: Exclude<Namespace, 'main'> | null
  mode: 'main' | `standalone:${Exclude<Namespace, 'main'>}`
  usedFallback: boolean
}

export type AppletSelectionContract<Namespace extends string = string> = {
  APPLET_NAMES: readonly Namespace[]
  normalizeSelection: (
    input: AppletSelectionInput
  ) => NormalizedAppletSelection
  resolveRuntimeSelection: (
    input: AppletSelectionInput
  ) => AppletSelection<Namespace>
  resolveStrictSelection: (
    input: AppletSelectionInput
  ) => AppletSelection<Namespace>
}

export const normalizeAppletSelectionInput: (
  input: AppletSelectionInput
) => string[]

export const createAppletSelectionContract: <Namespace extends string = string>(
  appletConf: unknown
) => AppletSelectionContract<Namespace>
