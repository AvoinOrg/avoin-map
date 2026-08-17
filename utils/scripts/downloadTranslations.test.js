const path = require('path')
const appletConf = require('../../appletConf.json')
const {
  downloadTranslations,
  resolveTranslationDownloadPlan,
} = require('./downloadTranslations')

const projectRoot = path.resolve(__dirname, '../..')
const manifestApplets = Object.keys(appletConf)
const standaloneApplets = manifestApplets.filter((applet) => applet !== 'main')

describe('downloadTranslations selection planning', () => {
  it('plans the full manifest selection without credentials', () => {
    const plan = resolveTranslationDownloadPlan({
      projectRoot,
      raw: manifestApplets,
    })

    expect(plan.compiledApplets).toEqual(manifestApplets)
    expect(plan.namespaces).toEqual(
      manifestApplets.map((applet) => appletConf[applet].localeNs)
    )
    expect(plan.languages).toEqual(['en', 'fi'])
  })

  it.each(standaloneApplets)(
    'plans standalone %s with shared main locale intersection',
    (applet) => {
      const plan = resolveTranslationDownloadPlan({ projectRoot, raw: applet })
      const appletConfig = appletConf[applet]
      const mainConfig = appletConf.main
      const mainLangs = appletConfig.langs.filter((lang) =>
        mainConfig.langs.includes(lang)
      )

      expect(plan.compiledApplets).toEqual([applet])
      expect(plan.namespaces).toEqual([
        appletConfig.localeNs,
        mainConfig.localeNs,
      ])
      expect(plan.nsToAllowedLangs).toEqual({
        [appletConfig.localeNs]: appletConfig.langs,
        [mainConfig.localeNs]: mainLangs,
      })
    }
  )

  it('fails invalid selection before checking credentials or making a request', async () => {
    const httpClient = jest.fn()

    await expect(
      downloadTranslations({
        env: {},
        httpClient,
        projectRoot,
        raw: 'main,unknown',
      })
    ).rejects.toThrow(/unknown applet/i)
    await expect(
      downloadTranslations({ env: {}, httpClient, projectRoot, raw: '' })
    ).rejects.toThrow(/selection is empty/i)
    expect(httpClient).not.toHaveBeenCalled()
  })

  it('checks credentials only after producing a valid plan', async () => {
    await expect(
      downloadTranslations({ env: {}, projectRoot, raw: 'carbon' })
    ).rejects.toThrow(/Tolgee API URL or API Key is missing/i)
  })
})
