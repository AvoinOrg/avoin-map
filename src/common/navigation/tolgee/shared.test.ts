import appletConf from '../../../../appletConf.json'
import { resolveTolgeeSelectionConfig } from './shared'

const manifestApplets = Object.keys(appletConf) as Array<keyof typeof appletConf>
const standaloneApplets = manifestApplets.filter((applet) => applet !== 'main')

describe('Tolgee applet selection configuration', () => {
  it('uses the full manifest fallback for empty runtime input', () => {
    const config = resolveTolgeeSelectionConfig(' , ')

    expect(config.selection.compiledApplets).toEqual(manifestApplets)
    expect(config.selection.usedFallback).toBe(true)
    expect(Object.keys(config.allNsLangs)).toEqual(
      manifestApplets.map((applet) => appletConf[applet].localeNs)
    )
    expect(config.locales).toEqual(['en', 'fi'])
  })

  it.each(standaloneApplets)(
    'selects %s plus shared main translations with intersected locales',
    (applet) => {
      const config = resolveTolgeeSelectionConfig([applet.toUpperCase(), applet])
      const appletConfig = appletConf[applet]
      const mainConfig = appletConf.main
      const sharedMainLangs = appletConfig.langs.filter((lang) =>
        mainConfig.langs.includes(lang)
      )

      expect(config.selection).toMatchObject({
        compiledApplets: [applet],
        standaloneApplet: applet,
      })
      expect(config.allNsLangs[appletConfig.localeNs]).toEqual({
        langs: appletConfig.langs,
      })
      expect(config.allNsLangs[mainConfig.localeNs]).toEqual({
        langs: sharedMainLangs,
      })
      expect(config.locales).toEqual(appletConfig.langs)
    }
  )

  it('rejects unknown and multi-standalone runtime input', () => {
    expect(() => resolveTolgeeSelectionConfig('main,unknown')).toThrow(
      /unknown applet/i
    )
    expect(() => resolveTolgeeSelectionConfig(['carbon', 'energy'])).toThrow(
      /exactly one applet/i
    )
  })
})
