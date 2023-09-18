const assert = require('assert')
const exec = require('./exec')
const fs = require('fs')
const paths = require('./paths')

/**
 * Checks whether a path exists
 * @param {string} p  File or directory path
 * @returns {Promise<boolean>}
 */
async function exists(p) {
  assert.ok(p, "Arg 'p' must not be empty")
  try {
    await fs.promises.stat(p)
    return true
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw err
  }
}
exports.exists = exists

/**
 * Recreates the _temp directory
 * @returns {Promise}
 */
async function reinitTemp() {
  const temp = paths.temp
  assert.ok(temp, 'Expected paths.temp to be defined')
  await exec.exec('rm', ['-rf', temp])
  await exec.exec('mkdir', ['-p', temp])
}
exports.reinitTemp = reinitTemp
