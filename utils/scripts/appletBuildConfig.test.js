const path = require('path')
const appletConf = require('../../appletConf.json')
const {
  getCompiledAppletConfig,
  parseCompiledApplets,
  resolveCompiledAppletConfig,
} = require('./appletBuildConfig')

const projectRoot = path.resolve(__dirname, '../..')

describe('appletBuildConfig', () => {
  it('delegates normalization to the shared selection contract', () => {
    expect(parseCompiledApplets(' Main, carbon,MAIN ')).toEqual([
      'main',
      'carbon',
    ])
  })

  it('maps shared selection facts to the pruning compatibility shape', () => {
    const config = resolveCompiledAppletConfig({
      appletConf,
      raw: [' Carbon ', 'carbon'],
      scriptName: 'testScript',
    })

    expect(config).toMatchObject({
      compiledApplets: ['carbon'],
      compiledNonMain: ['carbon'],
      includesMain: false,
      isStandalone: true,
      keepOnlyApplet: 'carbon',
      standaloneApplet: 'carbon',
      mode: 'standalone:carbon',
    })
    expect([...config.selectedApplets]).toEqual(['carbon'])
  })

  it.each([undefined, '', ' , '])('rejects strict empty input %p', (raw) => {
    expect(() =>
      resolveCompiledAppletConfig({ appletConf, raw, scriptName: 'testScript' })
    ).toThrow(/testScript: invalid NEXT_PUBLIC_COMPILED_APPLETS.*selection is empty/i)
  })

  it('rejects unknown and multi-standalone input with script context', () => {
    expect(() =>
      resolveCompiledAppletConfig({
        appletConf,
        raw: 'main,unknown',
        scriptName: 'testScript',
      })
    ).toThrow(/testScript:.*unknown applet\(s\): unknown/i)
    expect(() =>
      resolveCompiledAppletConfig({
        appletConf,
        raw: 'carbon,energy',
        scriptName: 'testScript',
      })
    ).toThrow(/without "main", exactly one applet/i)
  })

  it('loads the manifest and keeps normalized selection through the filesystem adapter', () => {
    expect(
      getCompiledAppletConfig({
        projectRoot,
        raw: ' MAIN, Energy,main ',
        scriptName: 'testScript',
      })
    ).toMatchObject({
      compiledApplets: ['main', 'energy'],
      compiledNonMain: ['energy'],
      mode: 'main',
    })
  })
})
