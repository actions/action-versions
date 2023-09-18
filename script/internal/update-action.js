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
      assert.ok(patterns && patterns.length, 'Existing patterns must not be empty')
      await actionConfig.add(owner, repo, patterns, defaultBranch)
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
}

/**
 * Get the command line args
 * @returns {Args}
 */
function getArgs() {
  const parsedArgs = argHelper.parse(['all'])
  const result = new Args()
  result.all = !!parsedArgs.flags['all']

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

function printUsage() {
  console.error('USAGE: update-action.sh nwo')
  console.error(`  nwo     Name with owner. For example: actions/checkout`)
}

main()