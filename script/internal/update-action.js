const actionConfig = require('./action-config')
const argHelper = require('./arg-helper')
const assert = require('assert')
const debugHelper = require('./debug-helper')
const fsHelper = require('./fs-helper')

async function main() {
  try {
    // Command line args
    const args = getArgs()

    // Reinit _temp
    await fsHelper.reinitTemp()

    // Get a list of action config files
    const files = args.all ? await actionConfig.getFilePaths() : [actionConfig.getFilePath(args.owner, args.repo)]
    debugHelper.debug(`files: ${files}`)
    for (const file of files) {
      // Load the config
      const config = await actionConfig.loadFromPath(file)
      const owner = config.owner
      const repo = config.repo
      const patterns = config.patterns
      const defaultBranch = config.defaultBranch
      const ignoreTags = config.ignoreTags
      const latestMajorVersions = args.latestMajorVersions || config.latestMajorVersions
      const latestVersionsPerMajor = args.latestVersionsPerMajor || config.latestVersionsPerMajor
      assert.ok(patterns && patterns.length, 'Existing patterns must not be empty')
      await actionConfig.add(owner, repo, patterns, defaultBranch, ignoreTags, latestMajorVersions, latestVersionsPerMajor)
    }
  }
  catch (err) {
    // Help
    if (err.code === argHelper.helpCode) {
      printUsage()
      return
    }

    // Arg error?
    if (err.code === argHelper.errorCode) {
      printUsage()
      console.error('')
    }

    // Print error
    debugHelper.debug(err.stack)
    console.error(`ERROR: ${err.message}`)
    process.exitCode = 1
  }
}

class Args {
  all = false
  owner = ''
  repo = ''
  latestMajorVersions = 0
  latestVersionsPerMajor = 0
}

/**
 * Get the command line args
 * @returns {Args}
 */
function getArgs() {
  const parsedArgs = argHelper.parse(['all'], ['latest-major-versions', 'latest-versions-per-major'])
  const result = new Args()
  result.all = !!parsedArgs.flags['all']
  result.latestMajorVersions = parseNonNegativeInt(parsedArgs.options['latest-major-versions'], 'latest-major-versions')
  result.latestVersionsPerMajor = parseNonNegativeInt(parsedArgs.options['latest-versions-per-major'], 'latest-versions-per-major')

  // All
  if (result.all) {
    // Validate no args
    if (parsedArgs.arguments.length) {
      argHelper.throwError(`Expected zero args when '--all' is specified`)
    }
  }
  // Not all
  else {
    // Validate exactly one arg
    if (parsedArgs.arguments.length !== 1) {
      argHelper.throwError('Expected exactly one arg')
    }

    const nwo = parsedArgs.arguments[0]
    const splitNwo = nwo.split('/')
    if (splitNwo.length !== 2 || !splitNwo[0] || !splitNwo[1]) {
      argHelper.throwError(`Invalid nwo '${nwo}'`)
    }
    result.owner = splitNwo[0]
    result.repo = splitNwo[1]
  }

  return result
}

function parseNonNegativeInt(value, name) {
  if (!value) return 0
  const n = Number(value)
  if (!Number.isInteger(n) || n < 0) {
    argHelper.throwError(`--${name} must be a non-negative integer, got '${value}'`)
  }
  return n
}

function printUsage() {
  console.error('USAGE: update-action.sh [--all] [--latest-major-versions N] [--latest-versions-per-major N] [nwo]')
  console.error(`  --all                       Update all configured actions`)
  console.error(`  --latest-major-versions     Update to only keep the latest N major versions`)
  console.error(`  --latest-versions-per-major Update to only keep the latest N version tags per major`)
  console.error(`  nwo                         Name with owner. For example: actions/checkout`)
}

main()