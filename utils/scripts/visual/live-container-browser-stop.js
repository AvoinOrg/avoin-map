#!/usr/bin/env node

const { LIVE_BROWSER_PATHS, clearContainerSessionMetadata, isPidAlive, readContainerSessionMetadata } = require('./liveSharedBrowser')

const HELP_TEXT = `\
Usage:
  node utils/scripts/visual/live-container-browser-stop.js [options]

Options:
  --timeout-ms <ms>           Wait time before SIGKILL escalation (default: 5000)
  --force-clean               Remove stale metadata even if no running process is found
  --help                      Show this help
`

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const parseArgs = (argv) => {
  const args = {
    timeoutMs: 5000,
    forceClean: false,
    help: false,
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
    if (token === '--force-clean') {
      args.forceClean = true
      continue
    }
    if (token.startsWith('--timeout-ms=')) {
      args.timeoutMs = Number(token.slice('--timeout-ms='.length))
      continue
    }
    if (token === '--timeout-ms') {
      i++
      args.timeoutMs = Number(argv[i])
      continue
    }
    throw new Error(`Unknown option: ${token}`)
  }

  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error(`Invalid --timeout-ms value: ${args.timeoutMs}`)
  }

  return args
}

const waitForExit = async ({ pid, timeoutMs }) => {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (!isPidAlive(pid)) {
      return true
    }
    await delay(200)
  }
  return !isPidAlive(pid)
}

const run = async () => {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    console.log(HELP_TEXT)
    return
  }

  let session
  try {
    session = readContainerSessionMetadata()
  } catch (error) {
    if (!args.forceClean) {
      throw error
    }
    const removed = clearContainerSessionMetadata()
    console.log(
      JSON.stringify(
        {
          action: 'force-clean',
          removed,
          sessionFile: LIVE_BROWSER_PATHS.containerSessionFile,
          note: error instanceof Error ? error.message : String(error),
        },
        null,
        2
      )
    )
    return
  }

  if (!session) {
    console.log(
      JSON.stringify(
        {
          action: 'noop',
          stopped: false,
          reason: 'no-session-file',
          sessionFile: LIVE_BROWSER_PATHS.containerSessionFile,
        },
        null,
        2
      )
    )
    return
  }

  const pidAliveBefore = isPidAlive(session.pid)
  let signalSequence = []

  if (pidAliveBefore) {
    try {
      process.kill(session.pid, 'SIGTERM')
      signalSequence.push('SIGTERM')
    } catch {
      // ignore and continue with status checks
    }

    let exited = await waitForExit({ pid: session.pid, timeoutMs: args.timeoutMs })
    if (!exited) {
      try {
        process.kill(session.pid, 'SIGKILL')
        signalSequence.push('SIGKILL')
      } catch {
        // ignore
      }
      exited = await waitForExit({ pid: session.pid, timeoutMs: 1000 })
      if (!exited) {
        throw new Error(
          `Failed to stop container Chromium process ${session.pid}; process is still alive after SIGTERM/SIGKILL.`
        )
      }
    }
  }

  const removed = clearContainerSessionMetadata()
  console.log(
    JSON.stringify(
      {
        action: 'stopped',
        stopped: pidAliveBefore,
        pid: session.pid,
        cdpUrl: session.cdpUrl,
        sessionFile: LIVE_BROWSER_PATHS.containerSessionFile,
        removedMetadata: removed,
        signalSequence,
      },
      null,
      2
    )
  )
}

run().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(message)
  process.exit(1)
})
