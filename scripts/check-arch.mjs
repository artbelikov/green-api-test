import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import process from 'node:process'

const SRC = join(process.cwd(), 'src')

const LAYER_RANKS = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  pages: 4,
  app: 5,
}

const violations = []

const sourceFiles = (dir) => {
  const found = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) {
      found.push(...sourceFiles(path))
    } else if (/\.(ts|tsx)$/.test(entry)) {
      found.push(path)
    }
  }
  return found
}

const stripExtension = (segment) => segment.replace(/\.(ts|tsx)$/, '')

const resolveTarget = (importerFile, specifier) => {
  const importerSegments = relative(SRC, importerFile)
    .split(sep)
    .map((segment) => stripExtension(segment))
  if (specifier.startsWith('.')) {
    return posix
      .normalize(posix.join(posix.dirname(importerSegments.join(posix.sep)), specifier))
      .split('/')
      .map((segment) => stripExtension(segment))
  }
  if (!specifier.startsWith('@/')) {
    return null
  }
  return specifier
    .slice(2)
    .split('/')
    .map((segment) => stripExtension(segment))
}

const importerContext = (importerFile) => {
  const importerSegments = relative(SRC, importerFile).split(sep)
  if (importerSegments.length === 1) {
    return null
  }
  const slice = importerSegments[0]
  const rank = LAYER_RANKS[slice]
  return rank === undefined ? null : { slice, rank }
}

const report = (importerFile, lineNumber, specifier, reason) => {
  const importerPath = relative(process.cwd(), importerFile).split(sep).join(posix.sep)
  violations.push(`${importerPath}:${lineNumber} ${reason} "${specifier}"`)
}

const checkImport = (importerFile, lineNumber, specifier) => {
  const target = resolveTarget(importerFile, specifier)
  if (target === null) {
    return
  }
  const importer = importerContext(importerFile)
  if (target[0] === '..') {
    report(importerFile, lineNumber, specifier, 'relative import escapes src/')
    return
  }
  if (importer === null) {
    return
  }
  const targetLayer = LAYER_RANKS[target[0]]
  if (targetLayer === undefined) {
    return
  }
  if (specifier.startsWith('.')) {
    if (target[0] !== importer.slice) {
      report(
        importerFile,
        lineNumber,
        specifier,
        `relative import leaves the ${importer.slice} slice — use the @/ alias`,
      )
    }
    return
  }
  if (importer.rank < targetLayer) {
    report(
      importerFile,
      lineNumber,
      specifier,
      `upward import ${importer.slice} → ${target[0]} breaks the FSD direction`,
    )
    return
  }
  if (target[0] === 'shared') {
    return
  }
  const crossSlice = target[1] !== undefined && target[1] !== importer.slice
  const deep = target.length > 2 && crossSlice && !specifier.endsWith('.module.css')
  if (deep) {
    report(
      importerFile,
      lineNumber,
      specifier,
      `deep import into ${target[1]} bypasses its public API (index.ts)`,
    )
  }
}

for (const file of sourceFiles(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    for (const match of line.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)) {
      checkImport(file, lineNumber, match[1])
    }
    for (const match of line.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      checkImport(file, lineNumber, match[1])
    }
  })
}

if (violations.length > 0) {
  console.error('FSD import-direction violations:')
  for (const violation of violations) {
    console.error(`  ${violation}`)
  }
  process.exit(1)
}

console.log(`FSD import-direction OK — ${sourceFiles(SRC).length} files under src/ scanned`)
