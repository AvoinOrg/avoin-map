const path = require('path')

const VISUAL_ROOT_DIR = path.join(process.cwd(), '.visual-regression')

const VISUAL_DIRS = {
  root: VISUAL_ROOT_DIR,
  baseline: path.join(VISUAL_ROOT_DIR, 'baseline'),
  current: path.join(VISUAL_ROOT_DIR, 'current'),
  diff: path.join(VISUAL_ROOT_DIR, 'diff'),
  report: path.join(VISUAL_ROOT_DIR, 'report'),
}

const DEFAULT_VIEWPORTS = [
  {
    id: 'desktop',
    width: 1440,
    height: 900,
    isMobile: false,
    deviceScaleFactor: 1,
  },
  {
    id: 'mobile',
    width: 390,
    height: 844,
    isMobile: true,
    deviceScaleFactor: 2,
    hasTouch: true,
  },
]

const DEFAULT_MASK_SELECTORS = [
  '#map',
  '#map canvas',
  '.maplibregl-canvas-container',
  '.maplibregl-canvas',
]

const DEFAULT_WAIT_FOR_SELECTOR = 'body'
const DEFAULT_SETTLE_MS = 600
const DEFAULT_SERVER_TIMEOUT_MS = 120000
const DEFAULT_BASELINE_DIFF_THRESHOLD = 0

module.exports = {
  DEFAULT_BASELINE_DIFF_THRESHOLD,
  DEFAULT_MASK_SELECTORS,
  DEFAULT_SERVER_TIMEOUT_MS,
  DEFAULT_SETTLE_MS,
  DEFAULT_VIEWPORTS,
  DEFAULT_WAIT_FOR_SELECTOR,
  VISUAL_DIRS,
}
