const MAIN_APPLET = 'main'

const fail = (message) => {
  throw new Error(`appletSelection: ${message}`)
}

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export const normalizeAppletSelectionInput = (input) => {
  if (input == null) return []

  const values = Array.isArray(input) ? input : [input]
  if (values.some((value) => typeof value !== 'string')) {
    fail('selection must be a comma-delimited string or an array of strings.')
  }

  const seen = new Set()
  const normalized = []

  for (const value of values) {
    for (const token of value.split(',')) {
      const applet = token.trim().toLowerCase()
      if (!applet || seen.has(applet)) continue
      seen.add(applet)
      normalized.push(applet)
    }
  }

  return normalized
}

export const createAppletSelectionContract = (appletConf) => {
  if (!isRecord(appletConf)) {
    fail('appletConf must be an object.')
  }

  const appletNames = Object.keys(appletConf)
  if (!Object.hasOwn(appletConf, MAIN_APPLET)) {
    fail(`appletConf must define the "${MAIN_APPLET}" applet.`)
  }
  for (const applet of appletNames) {
    if (applet !== applet.trim().toLowerCase() || !applet) {
      fail(
        `appletConf key ${JSON.stringify(
          applet
        )} must be lowercase and trimmed.`
      )
    }
    if (!isRecord(appletConf[applet])) {
      fail(`configuration for "${applet}" must be an object.`)
    }
  }

  const knownApplets = new Set(appletNames)

  const normalizeSelection = (input) => {
    const compiledApplets = normalizeAppletSelectionInput(input)
    const unknownApplets = compiledApplets.filter(
      (applet) => !knownApplets.has(applet)
    )

    return Object.freeze({
      compiledApplets: Object.freeze([...compiledApplets]),
      unknownApplets: Object.freeze(unknownApplets),
    })
  }

  const resolveSelection = ({ input, useManifestFallback }) => {
    const normalized = normalizeSelection(input)
    const usedFallback =
      useManifestFallback && normalized.compiledApplets.length === 0
    const compiledApplets = usedFallback
      ? [...appletNames]
      : [...normalized.compiledApplets]

    if (compiledApplets.length === 0) {
      fail('selection is empty.')
    }
    if (normalized.unknownApplets.length > 0) {
      fail(`unknown applet(s): ${normalized.unknownApplets.join(', ')}.`)
    }

    const includesMain = compiledApplets.includes(MAIN_APPLET)
    const selectedNonMainApplets = compiledApplets.filter(
      (applet) => applet !== MAIN_APPLET
    )

    if (!includesMain && selectedNonMainApplets.length !== 1) {
      fail(
        `unsupported selection ${JSON.stringify(
          compiledApplets.join(',')
        )}. Without "${MAIN_APPLET}", exactly one applet must be listed.`
      )
    }

    const standaloneApplet = includesMain ? null : selectedNonMainApplets[0]

    return Object.freeze({
      compiledApplets: Object.freeze(compiledApplets),
      selectedNonMainApplets: Object.freeze(selectedNonMainApplets),
      includesMain,
      isStandalone: standaloneApplet != null,
      standaloneApplet,
      mode:
        standaloneApplet == null ? 'main' : `standalone:${standaloneApplet}`,
      usedFallback,
    })
  }

  return Object.freeze({
    APPLET_NAMES: Object.freeze([...appletNames]),
    normalizeSelection,
    resolveRuntimeSelection: (input) =>
      resolveSelection({ input, useManifestFallback: true }),
    resolveStrictSelection: (input) =>
      resolveSelection({ input, useManifestFallback: false }),
  })
}
