require('dotenv').config()

const axios = require('axios')
const AdmZip = require('adm-zip')
const fs = require('fs')
const path = require('path')
const { getCompiledAppletConfig } = require('./appletBuildConfig')

const toUnique = (values) => Array.from(new Set(values))

const createTranslationDownloadPlan = ({ appletConf, selection }) => {
  const nsToAllowedLangs = {}

  for (const appletKey of selection.compiledApplets) {
    const applet = appletConf[appletKey]
    const localeNs = applet?.localeNs
    if (!localeNs) {
      throw new Error(
        `downloadTranslations: applet "${appletKey}" is missing required key "localeNs" in appletConf.json.`
      )
    }

    nsToAllowedLangs[localeNs] = toUnique([
      ...(nsToAllowedLangs[localeNs] || []),
      ...(Array.isArray(applet.langs) ? applet.langs : []),
    ])
  }

  if (!selection.includesMain) {
    const mainApplet = appletConf.main
    const mainNs = mainApplet?.localeNs
    if (!mainNs) {
      throw new Error(
        'downloadTranslations: applet "main" is missing required key "localeNs" in appletConf.json.'
      )
    }

    const desiredLangs = toUnique(Object.values(nsToAllowedLangs).flat())
    const mainLangs = Array.isArray(mainApplet.langs) ? mainApplet.langs : []
    const sharedMainLangs = desiredLangs.filter((lang) =>
      mainLangs.includes(lang)
    )
    if (sharedMainLangs.length > 0) {
      nsToAllowedLangs[mainNs] = sharedMainLangs
    }
  }

  const namespaces = Object.keys(nsToAllowedLangs)
  const languages = toUnique(Object.values(nsToAllowedLangs).flat())
  if (namespaces.length === 0 || languages.length === 0) {
    throw new Error(
      'downloadTranslations: no namespaces or languages selected. Check appletConf.json and NEXT_PUBLIC_COMPILED_APPLETS.'
    )
  }

  return {
    compiledApplets: [...selection.compiledApplets],
    languages,
    namespaces,
    nsToAllowedLangs,
  }
}

const resolveTranslationDownloadPlan = ({
  projectRoot,
  raw,
  scriptName = 'downloadTranslations',
}) => {
  const buildConfig = getCompiledAppletConfig({ projectRoot, raw, scriptName })
  return createTranslationDownloadPlan({
    appletConf: buildConfig.appletConf,
    selection: buildConfig,
  })
}

const downloadTranslations = async ({
  env = process.env,
  httpClient = axios,
  projectRoot = path.resolve(__dirname, '../..'),
  raw,
} = {}) => {
  const plan = resolveTranslationDownloadPlan({
    projectRoot,
    raw: raw ?? env.NEXT_PUBLIC_COMPILED_APPLETS,
  })

  const tolgeeApiUrl = env.TOLGEE_API_URL
  const tolgeeApiKey = env.TOLGEE_API_KEY
  if (!tolgeeApiUrl || !tolgeeApiKey) {
    throw new Error('downloadTranslations: Tolgee API URL or API Key is missing.')
  }

  const params = new URLSearchParams({
    ak: tolgeeApiKey,
    languages: plan.languages.join(','),
    format: 'JSON',
    structureDelimiter: '.',
    filterNamespace: plan.namespaces.join(','),
  })
  const response = await httpClient({
    url: `${tolgeeApiUrl}/v2/projects/export?${params.toString()}`,
    method: 'GET',
    responseType: 'arraybuffer',
  })

  const zip = new AdmZip(response.data)
  for (const entry of zip.getEntries()) {
    const entryNameParts = entry.entryName.split('/')
    if (entryNameParts.length !== 2) continue

    const [namespace, languageFile] = entryNameParts
    const language = path.basename(languageFile, '.json')
    const allowedLangsForNs = plan.nsToAllowedLangs[namespace]
    if (!allowedLangsForNs?.includes(language)) continue

    const outputPath = path.resolve(
      projectRoot,
      'i18n',
      namespace,
      `${language}.json`
    )
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    const content = JSON.parse(entry.getData().toString('utf8'))
    fs.writeFileSync(outputPath, JSON.stringify(content, null, 2))
    console.log(
      `Translations for '${language}' in namespace '${namespace}' downloaded and saved to '${outputPath}'`
    )
  }

  return plan
}

const main = async () => {
  try {
    await downloadTranslations()
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

if (require.main === module) {
  void main()
}

module.exports = {
  createTranslationDownloadPlan,
  downloadTranslations,
  resolveTranslationDownloadPlan,
}
