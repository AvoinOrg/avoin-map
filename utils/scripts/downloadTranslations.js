require('dotenv').config()
const axios = require('axios')
const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')

async function downloadTranslations() {
  const TOLGEE_API_URL = process.env.TOLGEE_API_URL
  const TOLGEE_API_KEY = process.env.TOLGEE_API_KEY

  if (!TOLGEE_API_URL || !TOLGEE_API_KEY) {
    console.error('Tolgee API URL or API Key is missing')
    process.exit(1)
  }

  const parseCompiledApplets = (raw) =>
    (raw || '')
      .toLowerCase()
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  // Load applets and languages from appletConf.json, but only for the applets
  // listed in NEXT_PUBLIC_COMPILED_APPLETS.
  const appletConfPath = path.resolve(__dirname, '../../appletConf.json')
  let appletConf = null
  let compiledApplets = parseCompiledApplets(
    process.env.NEXT_PUBLIC_COMPILED_APPLETS
  )

  const namespacesSet = new Set()
  const languagesSet = new Set()
  const nsToAllowedLangs = {}
  try {
    const raw = fs.readFileSync(appletConfPath, 'utf8')
    appletConf = JSON.parse(raw)

    if (compiledApplets.length === 0) {
      console.error('NEXT_PUBLIC_COMPILED_APPLETS is missing or empty')
      process.exit(1)
    }

    compiledApplets.forEach((appletKey) => {
      const applet = appletConf[appletKey]
      if (!applet) {
        console.error(
          `Unknown applet "${appletKey}" in NEXT_PUBLIC_COMPILED_APPLETS. Add it to appletConf.json or fix the env var.`
        )
        process.exit(1)
      }

      const localeNs = applet.localeNs
      if (!localeNs) {
        console.error(
          `Applet "${appletKey}" is missing required key "localeNs" in appletConf.json`
        )
        process.exit(1)
      }

      namespacesSet.add(localeNs)

      const langs = applet.langs || []
      nsToAllowedLangs[localeNs] = langs
      langs.forEach((l) => languagesSet.add(l))
    })

    // Many shared UI components use the "main" namespace (avoin-map). Even for
    // standalone applet builds, we want to ship those translations for the
    // locales that the active applet supports.
    if (!compiledApplets.includes('main')) {
      const mainApplet = appletConf.main
      const mainNs = mainApplet?.localeNs
      if (mainNs) {
        namespacesSet.add(mainNs)
        const desiredLangs = Array.from(languagesSet)
        const mainLangs =
          desiredLangs.length > 0 ? desiredLangs : mainApplet.langs || []
        nsToAllowedLangs[mainNs] = mainLangs
        mainLangs.forEach((l) => languagesSet.add(l))
      }
    }
  } catch (e) {
    console.error('Failed to read appletConf.json:', e.message)
    process.exit(1)
  }

  const namespacesArr = Array.from(namespacesSet)

  if (namespacesArr.length === 0 || languagesSet.size === 0) {
    console.error(
      'No namespaces or languages selected. Check appletConf.json and NEXT_PUBLIC_COMPILED_APPLETS.'
    )
    process.exit(1)
  }

  const languages = Array.from(languagesSet).join(',')
  const namespaces = namespacesArr.join(',')
  const format = 'JSON'
  const structureDelimiter = '.'

  const url = `${TOLGEE_API_URL}/v2/projects/export?ak=${TOLGEE_API_KEY}&languages=${languages}&format=${format}&structureDelimiter=${structureDelimiter}&filterNamespace=${namespaces}`

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    })

    const zip = new AdmZip(response.data)
    const zipEntries = zip.getEntries()

    zipEntries.forEach((entry) => {
      const entryNameParts = entry.entryName.split('/')
      if (entryNameParts.length === 2) {
        const [namespace, languageFile] = entryNameParts
        const language = path.basename(languageFile, '.json')

        const allowedLangsForNs = nsToAllowedLangs[namespace]
        if (allowedLangsForNs && !allowedLangsForNs.includes(language)) {
          // Tolgee exports a fixed set of languages for all namespaces.
          // We only write files for languages declared for that namespace.
          return
        }

        const outputPath = path.resolve(
          __dirname,
          `../../i18n/${namespace}/${language}.json`
        )

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })

        const content = JSON.parse(entry.getData().toString('utf8'))
        fs.writeFileSync(outputPath, JSON.stringify(content, null, 2))

        console.log(
          `Translations for '${language}' in namespace '${namespace}' downloaded and saved to '${outputPath}'`
        )
      }
    })
  } catch (error) {
    console.error('Failed to download and extract translations:', error.message)
    process.exit(1)
  }
}

downloadTranslations()
