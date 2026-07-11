#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const usage = () => {
  console.error(`Usage:
  node upsert_tolgee_translations.mjs --file <entries.json> [--project-id 1]
      [--namespace <namespace>] [--api-url <url>] [--api-key <key>] [--dry-run]

Input JSON:
  [
    {
      "key": "example.key",
      "namespace": "avoin-map",
      "translations": {
        "fi": "Esimerkki",
        "en": "Example"
      }
    }
  ]

Notes:
  - Accepts "key" or "keyName" in input, but always sends "key" to Tolgee.
  - If --namespace is given, it is used as the default for entries missing a namespace.
`)
}

const parseArgs = (argv) => {
  const args = {
    projectId: '1',
    dryRun: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--dry-run') {
      args.dryRun = true
      continue
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`)
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`)
    }

    if (arg === '--file') {
      args.file = next
    } else if (arg === '--project-id') {
      args.projectId = next
    } else if (arg === '--namespace') {
      args.namespace = next
    } else if (arg === '--api-url') {
      args.apiUrl = next
    } else if (arg === '--api-key') {
      args.apiKey = next
    } else {
      throw new Error(`Unknown flag: ${arg}`)
    }

    i += 1
  }

  if (!args.file) {
    throw new Error('Missing required --file')
  }

  return args
}

const readEntries = (filePath) => {
  const resolved = path.resolve(filePath)
  const raw = fs.readFileSync(resolved, 'utf8')
  const parsed = JSON.parse(raw)

  if (Array.isArray(parsed)) {
    return parsed
  }

  if (parsed && Array.isArray(parsed.entries)) {
    return parsed.entries
  }

  throw new Error('Input file must be a JSON array or { "entries": [...] }')
}

const normalizeEntry = (entry, defaultNamespace) => {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    throw new Error('Each entry must be an object')
  }

  const key = entry.key ?? entry.keyName
  const namespace = entry.namespace ?? defaultNamespace
  const translations = entry.translations

  if (!key || typeof key !== 'string') {
    throw new Error('Each entry must include a string "key"')
  }

  if (!namespace || typeof namespace !== 'string') {
    throw new Error(
      `Entry "${key}" is missing "namespace". Set it per entry or pass --namespace.`
    )
  }

  if (
    !translations ||
    typeof translations !== 'object' ||
    Array.isArray(translations)
  ) {
    throw new Error(`Entry "${key}" must include a "translations" object`)
  }

  const normalizedTranslations = {}

  for (const [lang, value] of Object.entries(translations)) {
    if (typeof value !== 'string') {
      throw new Error(
        `Entry "${key}" language "${lang}" must be a string, got ${typeof value}`
      )
    }
    normalizedTranslations[lang] = value
  }

  if (Object.keys(normalizedTranslations).length === 0) {
    throw new Error(`Entry "${key}" must include at least one translation`)
  }

  return {
    key,
    namespace,
    translations: normalizedTranslations,
  }
}

const main = async () => {
  try {
    const args = parseArgs(process.argv.slice(2))
    const apiUrl = args.apiUrl || process.env.TOLGEE_API_URL
    const apiKey = args.apiKey || process.env.TOLGEE_API_KEY

    if (!apiUrl) {
      throw new Error('Missing Tolgee API URL. Pass --api-url or set TOLGEE_API_URL.')
    }

    if (!apiKey && !args.dryRun) {
      throw new Error(
        'Missing Tolgee API key. Pass --api-key or set TOLGEE_API_KEY.'
      )
    }

    const entries = readEntries(args.file).map((entry) =>
      normalizeEntry(entry, args.namespace)
    )

    if (args.dryRun) {
      console.log(JSON.stringify({ projectId: args.projectId, entries }, null, 2))
      return
    }

    const endpoint = `${apiUrl.replace(/\/$/, '')}/v2/projects/${args.projectId}/translations`

    for (const entry of entries) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify(entry),
      })

      if (!response.ok) {
        const body = await response.text()
        throw new Error(
          `Tolgee write failed for ${entry.namespace}:${entry.key} (${response.status}): ${body}`
        )
      }

      const langs = Object.keys(entry.translations).join(', ')
      console.log(`[ok] ${entry.namespace}:${entry.key} (${langs})`)
    }
  } catch (error) {
    console.error(error.message)
    usage()
    process.exit(1)
  }
}

await main()
