const assert = require('assert')
const exec = require('./exec')

/**
 * Gets a list of branches from origin. For example: ["master"]
 * @returns {Promise<string[]>}
 */
async function branchList() {
  const result = []

  // Note, this implementation uses "rev-parse --symbolic-full-name" because:
  // - The output from "branch --list" is difficult when in a detached HEAD state.
  // - There is a bug in Git 2.18 that causes "rev-parse --symbolic" to output symbolic full names.
  const execResult = await exec.exec('git', ['rev-parse', '--symbolic-full-name', '--remotes=origin'])
  for (let ref of execResult.stdout.trim().split('\n')) {
    ref = ref.trim()
    if (!ref) {
      continue
    }

    const prefix = 'refs/remotes/origin/'
    if (!ref.startsWith(prefix) || ref.length === prefix.length) {
      throw new Error(`Unexpected branch format '${ref}'`)
    }

    ref = ref.substr(prefix.length)
    result.push(ref)
  }

  return result
}
exports.branchList = branchList

/**
 * Disable automatic garbage collection
 * @returns {Promise}
 */
async function gcAutoDisable() {
  await exec.exec('git', ['config', '--local', 'gc.auto', '0'])
}
exports.gcAutoDisable = gcAutoDisable

/**
 * Fetches the repo
 * @returns {Promise}
 */
async function fetch() {
  const args = [
    '-c',
    'protocol.version=2',
    'fetch',
    '--tags',
    '--no-recurse-submodules',
    'origin'
  ]

  await exec.exec('git', args)
}
exports.fetch = fetch

/**
 * Initializes a repo
 * @returns {Promise}
 */
async function init() {
  await exec.exec('git', ['init'])
}
exports.init = init

/**
 * Resolves a ref to a commit SHA
 * @param {string} ref
 * @returns {Promise<string>}
 */
async function logCommitSha(ref) {
  assert.ok(ref, "Arg 'ref' must not be empty")
  const execResult = await exec.exec('git', ['log', '-1', '--format=format:%H%n', ref])
  return execResult.stdout.trim()
}
exports.logCommitSha = logCommitSha

/**
 * Adds a remote
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise}
 */
async function remoteAdd(owner, repo) {
  assert.ok(owner, "Arg 'owner' must not be empty")
  assert.ok(repo, "Arg 'repo' must not be empty")
  await exec.exec('git', ['remote', 'add', 'origin', `https://github.com/${owner}/${repo}.git`])
}
exports.remoteAdd = remoteAdd

/**
 * Resolves a ref to a SHA. For a branch or lightweight tag, the commit SHA is returned.
 * For an annotated tag, the tag SHA is returned.
 * @param {string} ref  For example: 'refs/heads/master' or '/refs/tags/v1'
 * @returns {Promise<string>}
 */
async function revParse(ref) {
  assert.ok(ref, "Arg 'ref' must not be empty")
  const execResult = await exec.exec('git', ['rev-parse', ref])
  return execResult.stdout.trim()
}
exports.revParse = revParse

/**
 * Returns a list of tags. For example: ["v1", "v2"]
 * @returns {Promise<string[]>}
 */
async function tagList() {
  const execResult = await exec.exec('git', ['tag', '--list'])
  return execResult.stdout.trim().split('\n').filter(str => str && str.length > 0)
}
exports.tagList = tagList
