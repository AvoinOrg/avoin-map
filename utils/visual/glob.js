const normalizePath = (value) =>
  String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')

const escapeRegex = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, '\\$&')

const globToRegExp = (glob) => {
  const normalized = normalizePath(glob)
  let output = '^'

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]
    const next = normalized[i + 1]

    if (char === '*' && next === '*') {
      output += '.*'
      i++
      continue
    }

    if (char === '*') {
      output += '[^/]*'
      continue
    }

    if (char === '?') {
      output += '[^/]'
      continue
    }

    output += escapeRegex(char)
  }

  output += '$'
  return new RegExp(output)
}

const matchesGlob = ({ filePath, glob }) => globToRegExp(glob).test(normalizePath(filePath))

const matchesAnyGlob = ({ filePath, globs }) =>
  (globs || []).some((glob) => matchesGlob({ filePath, glob }))

module.exports = {
  globToRegExp,
  matchesAnyGlob,
  matchesGlob,
  normalizePath,
}
