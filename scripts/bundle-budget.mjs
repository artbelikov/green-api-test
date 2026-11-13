import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { gzipSync } from 'node:zlib'

const BUDGET_BYTES = 300 * 1024
const DIST_HTML = join(process.cwd(), 'dist', 'index.html')
const DIST_ASSETS = join(process.cwd(), 'dist', 'assets')

const html = readFileSync(DIST_HTML, 'utf8')
const assetNames = new Set()
for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
  assetNames.add(match[1].replace('/assets/', ''))
}

if (assetNames.size === 0) {
  console.error('bundle budget check failed: no assets referenced by dist/index.html')
  process.exit(1)
}

const distFiles = readdirSync(DIST_ASSETS).filter((file) => /\.(js|css)$/.test(file))
const allAssets = new Map()
for (const file of distFiles) {
  const raw = readFileSync(join(DIST_ASSETS, file))
  allAssets.set(file, {
    raw: raw.length,
    gzip: gzipSync(raw, { level: 9 }).length,
  })
}

let initialGzip = 0
let initialRaw = 0
const report = []
for (const name of assetNames) {
  const sizes = allAssets.get(name)
  if (sizes === undefined) {
    console.error(
      `bundle budget check failed: ${name} referenced by index.html but missing in dist/assets`,
    )
    process.exit(1)
  }
  initialGzip += sizes.gzip
  initialRaw += sizes.raw
  report.push(`  ${name}  gzip ${sizes.gzip} B  raw ${sizes.raw} B`)
}

const lazyGzip = [...allAssets.entries()]
  .filter(([name]) => !assetNames.has(name))
  .reduce((total, [, sizes]) => total + sizes.gzip, 0)

for (const line of report) {
  console.log(line)
}
console.log(
  `initial payload: gzip ${(initialGzip / 1024).toFixed(1)} KB (raw ${(initialRaw / 1024).toFixed(1)} KB), deferred chunks: gzip ${(lazyGzip / 1024).toFixed(1)} KB`,
)

if (initialGzip >= BUDGET_BYTES) {
  console.error(
    `bundle budget check failed: initial payload ${initialGzip} B exceeds the ${BUDGET_BYTES} B gzip budget`,
  )
  process.exit(1)
}
console.log(`bundle budget OK: initial gzip below ${(BUDGET_BYTES / 1024).toFixed(0)} KB`)
