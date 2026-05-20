#!/usr/bin/env node

const path = require('path')
const { spawnSync } = require('child_process')

const HELP_TEXT = `\
Usage:
  yarn visual:after-edit -- <file> [file...]
  yarn visual:after-edit -- --files a.tsx,b.tsx
  yarn visual:after-edit -- --storage-state .dev/browser-state/localhost-3000.storage-state.json <file>
  yarn visual:after-edit -- --no-start <file> [file...]
  yarn visual:after-edit

Behavior:
  Runs the visual regression runner in changed mode.
  Targets http://127.0.0.1:3000 by default (reuse running dev server first).
  If no files are provided, the underlying runner falls back to git-detected changes.

Options:
  --base-url <url>            Override the target app URL
  --browser-mode <mode>       Browser mode passed to the visual runner
  --storage-state <path>      Playwright storage state JSON (cookies/localStorage/IndexedDB)
  --start-command <cmd>       Override fallback dev server command
  --no-start                  Fail instead of starting a temporary dev server
  --files <csv>               Additional comma-separated file list
  --help                      Show this help
`

const parseArgs = (argv) => {
  const args = {
    baseUrl: 'http://127.0.0.1:3000',
    browserMode: null,
    storageState: null,
    startCommand: null,
    noStart: false,
    help: false,
    files: [],
  }

  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]

    if (!token || token === '--') {
      continue
    }

    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }

    if (token === '--no-start') {
      args.noStart = true
      continue
    }

    if (token.startsWith('--base-url=')) {
      args.baseUrl = token.slice('--base-url='.length)
      continue
    }
    if (token === '--base-url') {
      args.baseUrl = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--browser-mode=')) {
      args.browserMode = token.slice('--browser-mode='.length)
      continue
    }
    if (token === '--browser-mode') {
      args.browserMode = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--storage-state=')) {
      args.storageState = token.slice('--storage-state='.length)
      continue
    }
    if (token === '--storage-state') {
      args.storageState = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--start-command=')) {
      args.startCommand = token.slice('--start-command='.length)
      continue
    }
    if (token === '--start-command') {
      args.startCommand = argv[i + 1]
      i++
      continue
    }

    if (token.startsWith('--files=')) {
      args.files.push(token.slice('--files='.length))
      continue
    }
    if (token === '--files') {
      args.files.push(argv[i + 1] || '')
      i++
      continue
    }

    if (token.startsWith('-')) {
      throw new Error(`Unknown option: ${token}`)
    }

    args.files.push(token)
  }

  args.files = Array.from(
    new Set(
      args.files
        .flatMap((value) => String(value || '').split(','))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  )

  return args
}

const run = () => {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    console.log(HELP_TEXT)
    process.exit(0)
  }

  const runnerPath = path.join(__dirname, 'run.js')
  const commandArgs = [runnerPath, '--mode=changed', `--base-url=${args.baseUrl}`]

  if (args.browserMode) {
    commandArgs.push(`--browser-mode=${args.browserMode}`)
  }
  if (args.storageState) {
    commandArgs.push(`--storage-state=${args.storageState}`)
  }
  if (args.startCommand) {
    commandArgs.push(`--start-command=${args.startCommand}`)
  }
  if (args.noStart) {
    commandArgs.push('--no-start')
  }
  if (args.files.length > 0) {
    commandArgs.push(`--files=${args.files.join(',')}`)
  }

  if (args.files.length > 0) {
    console.log(
      `Running visual changed check for ${args.files.length} file(s) against ${args.baseUrl}`
    )
  } else {
    console.log(`Running visual changed check against ${args.baseUrl} (git-detected changes)`)
  }

  const result = spawnSync(process.execPath, commandArgs, {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: process.env,
  })

  if (typeof result.status === 'number') {
    process.exit(result.status)
  }

  process.exit(1)
}

run()
