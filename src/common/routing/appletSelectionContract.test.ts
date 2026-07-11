import appletConf from '../../../appletConf.json'
import {
  createAppletSelectionContract,
  normalizeAppletSelectionInput,
} from './appletSelectionContract/index.js'
import {
  appletSelectionContract,
  resolveRuntimeAppletSelection,
  resolveStrictAppletSelection,
} from './appletBuildMode'

// CommonJS is a supported adapter boundary and is compared directly here.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { resolveCompiledAppletConfig } = require('../../../utils/scripts/appletBuildConfig')

const manifestApplets = Object.keys(appletConf)
const standaloneApplets = manifestApplets.filter((applet) => applet !== 'main')

describe('applet selection contract', () => {
  it.each([
    [undefined, []],
    ['', []],
    ['  , , ', []],
    [' Main, CARBON ,main, carbon ', ['main', 'carbon']],
    [[' Main ', 'CARBON', 'main,energy'], ['main', 'carbon', 'energy']],
  ])('normalizes %p deterministically', (input, expected) => {
    expect(normalizeAppletSelectionInput(input)).toEqual(expected)
    expect(appletSelectionContract.normalizeSelection(input).compiledApplets).toEqual(
      expected
    )
  })

  it('rejects invalid array entries instead of coercing them', () => {
    expect(() =>
      normalizeAppletSelectionInput(['main', 1] as unknown as string[])
    ).toThrow(/array of strings/i)
  })

  it('collects normalized unknowns in first-seen order', () => {
    expect(
      appletSelectionContract.normalizeSelection(
        ' UNKNOWN, missing,unknown,MAIN '
      )
    ).toEqual({
      compiledApplets: ['unknown', 'missing', 'main'],
      unknownApplets: ['unknown', 'missing'],
    })
  })

  it('uses the full manifest in manifest order only for runtime-empty input', () => {
    const runtime = resolveRuntimeAppletSelection(' , ')

    expect(runtime.compiledApplets).toEqual(manifestApplets)
    expect(runtime.usedFallback).toBe(true)
    expect(runtime.includesMain).toBe(true)
    expect(runtime.mode).toBe('main')
    expect(() => resolveStrictAppletSelection(' , ')).toThrow(/selection is empty/i)
  })

  it('rejects unknown and unsupported multi-standalone selections in both policies', () => {
    for (const resolve of [
      resolveStrictAppletSelection,
      resolveRuntimeAppletSelection,
    ]) {
      expect(() => resolve('main,unknown,UNKNOWN')).toThrow(
        /unknown applet\(s\): unknown/i
      )
      expect(() => resolve(standaloneApplets.slice(0, 2))).toThrow(
        /without "main", exactly one applet/i
      )
    }
  })

  it.each(standaloneApplets)('derives standalone facts for %s', (applet) => {
    expect(resolveStrictAppletSelection([applet])).toMatchObject({
      compiledApplets: [applet],
      selectedNonMainApplets: [applet],
      includesMain: false,
      isStandalone: true,
      standaloneApplet: applet,
      mode: `standalone:${applet}`,
      usedFallback: false,
    })
  })

  it('derives main mode for main alone and main plus selected applets', () => {
    expect(resolveStrictAppletSelection('main')).toMatchObject({
      compiledApplets: ['main'],
      selectedNonMainApplets: [],
      includesMain: true,
      isStandalone: false,
      standaloneApplet: null,
      mode: 'main',
    })
    expect(resolveStrictAppletSelection(['CARBON', 'main', 'energy'])).toMatchObject(
      {
        compiledApplets: ['carbon', 'main', 'energy'],
        selectedNonMainApplets: ['carbon', 'energy'],
        mode: 'main',
      }
    )
  })

  it('keeps TypeScript and CommonJS adapters in parity across the build matrix', () => {
    const selections = [manifestApplets, ...standaloneApplets.map((name) => [name])]

    for (const raw of selections) {
      const runtime = resolveStrictAppletSelection(raw)
      const script = resolveCompiledAppletConfig({
        appletConf,
        raw,
        scriptName: 'test',
      })

      expect(script.compiledApplets).toEqual(runtime.compiledApplets)
      expect(script.compiledNonMain).toEqual(runtime.selectedNonMainApplets)
      expect(script.includesMain).toBe(runtime.includesMain)
      expect(script.isStandalone).toBe(runtime.isStandalone)
      expect(script.standaloneApplet).toBe(runtime.standaloneApplet)
      expect(script.mode).toBe(runtime.mode)
    }
  })

  it('validates the manifest boundary', () => {
    expect(() => createAppletSelectionContract({ carbon: {} })).toThrow(
      /must define the "main" applet/i
    )
    expect(() =>
      createAppletSelectionContract({ main: {}, Carbon: {} })
    ).toThrow(/lowercase and trimmed/i)
  })
})
