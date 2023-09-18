const isDebug = ['TRUE', '1'].some(x => x === (process.env['GITHUB_ACTIONS_DEBUG'] || '').toUpperCase())

/**
 * Log the message if debug mode
 * @param {string} message
 */
function debug(message) {
  if (isDebug) {
    console.log(message)
  }
}
exports.debug = debug