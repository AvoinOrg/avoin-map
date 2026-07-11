import appletConf from '../../../appletConf.json'
import { createAppletSelectionContract } from './appletSelectionContract/index.js'
import type {
  AppletSelection,
  AppletSelectionInput,
} from './appletSelectionContract/index.js'

export type AppletNamespace = keyof typeof appletConf
export type RuntimeAppletSelection = AppletSelection<AppletNamespace>

export const appletSelectionContract =
  createAppletSelectionContract<AppletNamespace>(appletConf)

export const resolveRuntimeAppletSelection = (
  input: AppletSelectionInput
): RuntimeAppletSelection =>
  appletSelectionContract.resolveRuntimeSelection(input)

export const resolveStrictAppletSelection = (
  input: AppletSelectionInput
): RuntimeAppletSelection =>
  appletSelectionContract.resolveStrictSelection(input)

export const runtimeAppletSelection = resolveRuntimeAppletSelection(
  process.env.PUBLIC_COMPILED_APPLETS
)

export const {
  compiledApplets,
  includesMain,
  isStandalone,
  mode: appletBuildMode,
  standaloneApplet,
} = runtimeAppletSelection

export const getPathnameWithoutLocale = (
  pathname: string,
  locale: string | string[] | null
): string => {
  if (!pathname) return '/'
  if (!locale) return pathname

  const localeValue = Array.isArray(locale) ? locale[0] : locale
  if (!localeValue) return pathname

  const pattern = new RegExp(`^/${localeValue}($|/)`)
  const cleaned = pathname.replace(pattern, '/').replace(/\/+$/, '')
  return cleaned === '' ? '/' : cleaned
}
