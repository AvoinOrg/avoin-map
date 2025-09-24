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

  // Load namespaces and languages from localeConf.json
  const localeConfPath = path.resolve(__dirname, '../../localeConf.json')
  let namespacesArr = []
  let languagesSet = new Set()
  try {
    const raw = fs.readFileSync(localeConfPath, 'utf8')
    const conf = JSON.parse(raw)
    namespacesArr = Object.keys(conf)
    namespacesArr.forEach((ns) => {
      const langs = conf[ns]?.langs || []
      langs.forEach((l) => languagesSet.add(l))
    })
  } catch (e) {
    console.error('Failed to read localeConf.json:', e.message)
    process.exit(1)
  }

  if (namespacesArr.length === 0 || languagesSet.size === 0) {
    console.error('No namespaces or languages found in localeConf.json')
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
  }
}

downloadTranslations()
