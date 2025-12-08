const actionConfig = require('./action-config')
const argHelper = require('./arg-helper')
const debugHelper = require('./debug-helper')
const fs = require('fs')

async function main() {
  try {
    // Command line args
    const args = getArgs()

    // Get a list of action config files
    const files = args.all ? await actionConfig.getFilePaths() : [actionConfig.getFilePath(args.owner, args.repo)]
    debugHelper.debug(`files: ${files}`)
    
    for (const file of files) {
      // Load the config
      const config = await actionConfig.loadFromPath(file)
      
      // Add ignore tags
      if (!config.ignoreTags) {
        config.ignoreTags = []
      }
      
      // Add new patterns (avoid duplicates)
      for (const pattern of args.ignoreTags) {
        if (!config.ignoreTags.includes(pattern)) {
          config.ignoreTags.push(pattern)
        }
      }
      
      // Write config back
      await fs.promises.writeFile(file, JSON.stringify(config, null, '  '))
      console.log(`Updated config file: ${file}`)
      console.log(`  ignoreTags: ${JSON.stringify(config.ignoreTags)}`)
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
  ignoreTags = []
}

/**
 * Get the command line args
 * @returns {Args}
 */
function getArgs() {
  const parsedArgs = argHelper.parse(['all'], ['ignore-tags'])
  const result = new Args()
  result.all = !!parsedArgs.flags['all']

  // Validate ignore-tags is provided
  if (!parsedArgs.options['ignore-tags']) {
    argHelper.throwError('--ignore-tags is required')
  }

  // Parse ignore-tags (comma-separated version prefixes like v1,v2)
  const prefixes = parsedArgs.options['ignore-tags'].split(',').map(t => t.trim()).filter(t => t)
  for (const prefix of prefixes) {
    // Convert simple version prefix like "v1" to regex pattern "^v1(\\..*)?$"
    // This matches "v1", "v1.0", "v1.0.0", etc.
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result.ignoreTags.push(`^${escapedPrefix}(\\..*)?$`)
  }

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
      argHelper.throwError('Expected exactly one arg (nwo) or --all flag')
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
  console.error('USAGE: add-ignore-tags.sh --ignore-tags versions [--all | nwo]')
  console.error(`  --ignore-tags     Comma-separated version prefixes to ignore. For example: v1,v2`)
  console.error(`  --all             Apply to all existing action configs`)
  console.error(`  nwo               Name with owner. For example: actions/checkout`)
}

main()
