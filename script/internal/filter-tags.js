// Filters tags from an action config based on latestMajorVersions and latestVersionsPerMajor.
// Reads JSON config from stdin, outputs allowed tag names (one per line).

async function main() {
  let input = ''
  for await (const chunk of process.stdin) {
    input += chunk
  }

  const config = JSON.parse(input)
  const tags = Object.keys(config.tags || {})
  const latestMajorVersions = config.latestMajorVersions || 0 // 0 = unlimited
  const latestVersionsPerMajor = config.latestVersionsPerMajor || 0 // 0 = unlimited

  if (!latestMajorVersions && !latestVersionsPerMajor) {
    // No filtering configured, output all tags
    for (const tag of tags) {
      console.log(tag)
    }
    return
  }

  // Parse version info from tag names
  const versionTags = []
  const nonVersionTags = []

  for (const tag of tags) {
    const match = tag.match(/^v(\d+)(?:\.(\d+))?(?:\.(\d+))?$/)
    if (!match) {
      nonVersionTags.push(tag)
      continue
    }

    const major = parseInt(match[1], 10)
    const minor = match[2] !== undefined ? parseInt(match[2], 10) : -1
    const patch = match[3] !== undefined ? parseInt(match[3], 10) : -1
    const isMajorOnly = minor === -1

    versionTags.push({ tag, major, minor, patch, isMajorOnly })
  }

  // Find distinct major versions sorted descending (newest first)
  const majorVersions = [...new Set(versionTags.map(v => v.major))].sort((a, b) => b - a)

  // Apply latestMajorVersions filter
  const allowedMajors = new Set(
    latestMajorVersions > 0 ? majorVersions.slice(0, latestMajorVersions) : majorVersions
  )

  // Always include non-version tags
  const result = [...nonVersionTags]

  for (const major of allowedMajors) {
    const tagsForMajor = versionTags.filter(v => v.major === major)

    // Always include major-only pointers (e.g., "v4")
    for (const v of tagsForMajor.filter(v => v.isMajorOnly)) {
      result.push(v.tag)
    }

    // Sort non-major-only tags by version descending (latest first)
    const sortedVersions = tagsForMajor
      .filter(v => !v.isMajorOnly)
      .sort((a, b) => {
        if (a.minor !== b.minor) return b.minor - a.minor
        return b.patch - a.patch
      })

    // Apply latestVersionsPerMajor filter
    const kept = latestVersionsPerMajor > 0
      ? sortedVersions.slice(0, latestVersionsPerMajor)
      : sortedVersions

    for (const v of kept) {
      result.push(v.tag)
    }
  }

  for (const tag of result) {
    console.log(tag)
  }
}

main().catch(err => {
  console.error(err.message)
  process.exitCode = 1
})
