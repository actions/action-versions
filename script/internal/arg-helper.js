const debugHelper = require('./debug-helper')

/**
 * Parse command line arguments
 */
class Arguments {
  flags = {}

  options = {}

  arguments = []
}
exports.Arguments = Arguments

const helpCode = 'ARGHELP'
exports.helpCode = helpCode

const errorCode = 'ARGV'
exports.errorCode = errorCode

/**
 * Parses the command line arguments
 * @param {string[]} flags       Allowed flags
 * @param {string[]} options     Allowed options
 * @param {boolean} allowArgs    Whether to allow unnamed arguments
 * @returns {Arguments}
 */
function parse(flags, options, allowArgs) {
  flags = flags || []
  options = options || []
  allowArgs = typeof(allowArgs) === 'boolean' ? allowArgs : true

  const result = new Arguments()

  // Check for --help
  const argv = process.argv.slice(2)
  if (argv.some(x => x === '--help')) {
    throwError('Help requested', helpCode)
  }

  // Parse
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const nextArg = i + 1 < argv.length ? argv[i + 1] : null

    // Starts with "--"
    if (arg.startsWith('--')) {
      const name = arg.substr(2)

      // Legal flag
      if (flags.some(x => x === name)) {
        debugHelper.debug(`arg: ${arg} (flag)`)
        result.flags[name] = true
        continue
      }

      // Unknown option
      if (!options.some(x => x === name)) {
        throwError(`Unknown option '${name}'`)
      }

      // Missing value following option
      if (nextArg === null || nextArg.startsWith('--')) {
        throwError(`Option '${name}' must have a value`)
      }

      // Legal option
      debugHelper.debug(`arg: ${arg} (option)`)
      result.options[name] = nextArg
      i++
      continue
    }

    // Unexpected argument
    if (!allowArgs) {
      throwError(`Unexpected argument '${arg}'`)
    }

    // Legal argument
    debugHelper.debug(`arg: ${arg}`)
    result.arguments.push(arg)
  }

  return result
}
exports.parse = parse

function throwError(message, code) {
  const err = new Error(message)
  err.code = code || errorCode
  throw err
}
exports.throwError = throwError