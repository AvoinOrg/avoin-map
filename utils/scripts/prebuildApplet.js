// TODO: Fix this spaghetti solution. This is a temporary fix to make
// the selected applet subpath the root path

const fs = require('fs')
const path = require('path')

const projectRoot = path.join(__dirname, '..', '..')
const appletsPath = path.join(
    projectRoot,
    'src',
    'app',
    '[locale]',
    '(map)',
    '(applets)'
)
const applet = process.env.APPLET || process.argv[2]
if (!applet) {
    console.error('No applet specified.')
    process.exit(1)
}

const appletPath = path.join(appletsPath, applet)
const pagePath = path.join(projectRoot, 'src', 'app', '(ui)', 'page.tsx')
const tsConfigPath = path.join(projectRoot, 'tsconfig.json')


function updateTsConfig() {
    if (fs.existsSync(tsConfigPath)) {
        const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'))

        tsConfig.compilerOptions.paths[`applets/${applet}/*`] = [
            `src/app/[locale]/(map)/(applets)/(${applet})/*`,
        ]

        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2))
    }
}

function renameAndCleanup() {
    // Rename selected applet folder
    if (fs.existsSync(appletPath)) {
        const newAppletPath = path.join(appletsPath, `(${applet})`)
        fs.renameSync(appletPath, newAppletPath)
    }

    // Remove other folders in (applets), except the selected applet
    fs.readdirSync(appletsPath).forEach((file) => {
        const filePath = path.join(appletsPath, file)
        if (
            fs.statSync(filePath).isDirectory() &&
            !filePath.endsWith(`(${applet})`)
        ) {
            fs.rmSync(filePath, { recursive: true })
        }
    })

    // Remove page.tsx
    if (fs.existsSync(pagePath)) {
        fs.unlinkSync(pagePath)
    }

    updateTsConfig()
}

renameAndCleanup()
