#!/usr/bin/env node

const {
  DEFAULT_LOCK_TTL_MS,
  getLockStatus,
  releaseControlLock,
  takeControlLock,
} = require('./liveControlLock')

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/live-control-lock.js status [options]
  node utils/scripts/visual/live-control-lock.js take --owner codex [options]
  node utils/scripts/visual/live-control-lock.js release --owner codex [options]

Commands:
  status                     Print lock status JSON
  take                       Acquire/replace a live-control lock
  release                    Release a live-control lock

Options:
  --owner <name>             Lock owner (typically codex or human)
  --mode <mode>              host-cdp|container-headed (default: host-cdp)
  --cdp-url <url>            Include CDP endpoint in lock metadata
  --origin <origin>          Include origin in lock metadata
  --page-url <url>           Include page URL in lock metadata
  --ttl-ms <ms>              Lock TTL in milliseconds (default: ${DEFAULT_LOCK_TTL_MS})
  --note <text>              Optional note stored in lock metadata
  --lock-path <path>         Override lock file path
  --force                    Override owner checks / existing lock
  --help                     Show this help
`

const parseArgs = (argv) => {
  const args = {
    command: null,
    owner: null,
    mode: 'host-cdp',
    cdpUrl: null,
    origin: null,
    pageUrl: null,
    ttlMs: DEFAULT_LOCK_TTL_MS,
    note: null,
    lockPath: null,
    force: false,
    help: false,
  }

  const tokens = [...argv]
  if (tokens[0] && !tokens[0].startsWith('-')) {
    args.command = tokens.shift()
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (!token || token === '--') {
      continue
    }
    if (token === '--help' || token === '-h') {
      args.help = true
      continue
    }
    if (token === '--force') {
      args.force = true
      continue
    }

    const readValue = () => {
      i++
      return tokens[i]
    }

    if (token.startsWith('--owner=')) {
      args.owner = token.slice('--owner='.length)
      continue
    }
    if (token === '--owner') {
      args.owner = readValue()
      continue
    }

    if (token.startsWith('--mode=')) {
      args.mode = token.slice('--mode='.length)
      continue
    }
    if (token === '--mode') {
      args.mode = readValue()
      continue
    }

    if (token.startsWith('--cdp-url=')) {
      args.cdpUrl = token.slice('--cdp-url='.length)
      continue
    }
    if (token === '--cdp-url') {
      args.cdpUrl = readValue()
      continue
    }

    if (token.startsWith('--origin=')) {
      args.origin = token.slice('--origin='.length)
      continue
    }
    if (token === '--origin') {
      args.origin = readValue()
      continue
    }

    if (token.startsWith('--page-url=')) {
      args.pageUrl = token.slice('--page-url='.length)
      continue
    }
    if (token === '--page-url') {
      args.pageUrl = readValue()
      continue
    }

    if (token.startsWith('--ttl-ms=')) {
      args.ttlMs = Number(token.slice('--ttl-ms='.length))
      continue
    }
    if (token === '--ttl-ms') {
      args.ttlMs = Number(readValue())
      continue
    }

    if (token.startsWith('--note=')) {
      args.note = token.slice('--note='.length)
      continue
    }
    if (token === '--note') {
      args.note = readValue()
      continue
    }

    if (token.startsWith('--lock-path=')) {
      args.lockPath = token.slice('--lock-path='.length)
      continue
    }
    if (token === '--lock-path') {
      args.lockPath = readValue()
      continue
    }

    throw new Error(`Unknown option: ${token}`)
  }

  return args
}

const run = () => {
  const args = parseArgs(process.argv.slice(2))

  if (args.help || !args.command) {
    console.log(HELP_TEXT)
    process.exit(args.help ? 0 : 1)
  }

  if (args.command === 'status') {
    console.log(JSON.stringify(getLockStatus({ lockPath: args.lockPath }), null, 2))
    return
  }

  if (args.command === 'take') {
    const result = takeControlLock({
      owner: args.owner,
      mode: args.mode,
      cdpUrl: args.cdpUrl,
      origin: args.origin,
      pageUrl: args.pageUrl,
      ttlMs: args.ttlMs,
      note: args.note,
      lockPath: args.lockPath,
      force: args.force,
    })
    console.log(JSON.stringify(result, null, 2))
    return
  }

  if (args.command === 'release') {
    const result = releaseControlLock({
      owner: args.owner,
      lockPath: args.lockPath,
      force: args.force,
    })
    console.log(JSON.stringify(result, null, 2))
    return
  }

  throw new Error(`Unknown command: ${args.command}`)
}

try {
  run()
} catch (error) {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
}
