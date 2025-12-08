const actionConfig = require('./action-config')
const argHelper = require('./arg-helper')
const assert = require('assert')
const debugHelper = require('./debug-helper')
const exec = require('./exec')
const fsHelper = require('./fs-helper')
const Patterns = require('./patterns').Patterns

async function main() {
  try {
    // Command line args
    const args = getArgs()
    const owner = args.owner
    const repo = args.repo
    const patterns = args.patterns
    const defaultBranch = args.defaultBranch || 'master'
    const ignoreTags = args.ignoreTags

    // File exists?
    const file = actionConfig.getFilePath(owner, repo)
    assert.ok(!(await fsHelper.exists(file)), `File '${file}' already exists. Use 'update-action.sh' instead.`)

    // Reinit _temp
    await fsHelper.reinitTemp()

    // Add the config
    await actionConfig.add(owner, repo, patterns, defaultBranch, ignoreTags)
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
  owner = ''
  repo = ''
  patterns = []
  defaultBranch = ''
  ignoreTags = []
}

/**
 * Get the command line args
 * @returns {Args}
 */
function getArgs() {
  // Parse
  const parsedArgs = argHelper.parse([], ['default-branch', 'ignore-tags'])
  if (parsedArgs.arguments.length < 1) {
    argHelper.throwError('Expected at least one arg')
  }

  // Validate name with owner
  const nwo = parsedArgs.arguments[0]
  const splitNwo = nwo.split('/')
  if (splitNwo.length !== 2 || !splitNwo[0] || !splitNwo[1]) {
    argHelper.throwError(`Invalid nwo '${nwo}'`)
  }

  // Validate patterns
  const patterns = parsedArgs.arguments.slice(1)
  if (patterns.length) {
    try {
      new Patterns(patterns)
    }
    catch (err) {
      argHelper.throwError(err.message)
    }
  }

  // Parse ignore-tags (comma-separated)
  let ignoreTags = []
  if (parsedArgs.options['ignore-tags']) {
    ignoreTags = parsedArgs.options['ignore-tags'].split(',').map(t => t.trim()).filter(t => t)
  }

  return {
    owner: splitNwo[0],
    repo: splitNwo[1],
    patterns: patterns,
    defaultBranch: parsedArgs.options['default-branch'],
    ignoreTags: ignoreTags
  }
}

function printUsage() {
  console.error('USAGE: add-action.sh [--default-branch branch] [--ignore-tags patterns] nwo [(+|-)regexp [...]]')
  console.error(`  --default-branch  Default branch name. For example: master`)
  console.error(`  --ignore-tags     Comma-separated regex patterns for tags to ignore. For example: ^v1(\\..*)?$,^v2(\\..*)?$`)
  console.error(`  nwo               Name with owner. For example: actions/checkout`)
  console.error(`  regexp            Refs to include or exclude. Default: ${actionConfig.defaultPatterns.join(' ')}`)
}

main()