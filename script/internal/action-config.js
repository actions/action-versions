const assert = require('assert')
const exec = require('./exec')
const fs = require('fs')
const git = require('./git')
const path = require('path')
const paths = require('./paths')
const Patterns = require('./patterns').Patterns

const defaultPatterns = ['+^master$', '+^v[0-9]+(\\.[0-9]+){0,2}$']
exports.defaultPatterns = defaultPatterns

class ActionConfig {
  /**
   * Repository owner
   */
  owner = ''

  /**
   * Repository name
   */
  repo = ''

  /**
   * Ref include/exclude regexp patterns
   * @type {string[]}
   */
  patterns = []

  /**
   * Tag patterns to ignore during packaging
   * @type {string[]|undefined}
   */
  ignoreTags = undefined

  /**
   * Branch versions (ref to commit SHA)
   * @type {{[ref: string]: string}}
   */
  branches = {}

  /**
   * Default branch to checkout, defaults to master
   * @type {string}
   */
  defaultBranch = 'master'

  /**
   * Tag versions
   * @type {{[ref: string]: TagVersion}}
   */
  tags = {}
}
exports.ActionConfig = ActionConfig

class TagVersion {
  /**
   * Commit SHA
   */
  commit = ''

  /**
   * SHA of the annotated tag, or undefined for a lightweight tag
   * @type {string|undefined}
   */
  tag = undefined
}
exports.TagVersion = TagVersion

/**
 * Adds a new action config file
 * @param {string} owner
 * @param {string} repo
 * @param {string[]} patternStrings
 * @param {string} defaultBranch
 * @param {string[]|undefined} ignoreTags
 * @returns {Promise}
 */
async function add(owner, repo, patternStrings, defaultBranch, ignoreTags) {
  assert.ok(owner, "Arg 'owner' must not be empty")
  assert.ok(repo, "Arg 'repo' must not be empty")
  assert.ok(patternStrings, "Arg 'patternStrings' must not be null")
  assert.ok(defaultBranch, "Arg 'defaultBranch' must not be empty")

  if (patternStrings.length === 0) {
    patternStrings = defaultPatterns
  }

  const patterns = new Patterns(patternStrings)
  const file = getFilePath(owner, repo)
  const config = new ActionConfig()
  config.owner = owner
  config.repo = repo
  config.patterns = patternStrings
  if (ignoreTags && ignoreTags.length > 0) {
    config.ignoreTags = ignoreTags
  }
  config.defaultBranch = defaultBranch

  const tempDir = path.join(paths.temp, `${owner}_${repo}`)
  await exec.exec('rm', ['-rf', tempDir])
  await exec.exec('mkdir', ['-p', tempDir])
  const originalCwd = process.cwd()
  try {
    process.chdir(tempDir)
    await exec.exec('pwd')

    // Clone
    await git.init()
    await git.gcAutoDisable()
    await git.remoteAdd(owner, repo)
    await git.fetch()

    // Snapshot branches
    let branches = await git.branchList()
    branches = branches.filter(x => patterns.test(x))
    for (const branch of branches) {
      config.branches[branch] = await git.logCommitSha(`refs/remotes/origin/${branch}`)
    }

    // Snapshot tags
    let tags = await git.tagList()
    tags = tags.filter(x => patterns.test(x))
    for (const tag of tags) {
      const tagVersion = new TagVersion()
      tagVersion.commit = await git.logCommitSha(`refs/tags/${tag}`)
      tagVersion.tag = await git.revParse(`refs/tags/${tag}`)
      if (tagVersion.commit === tagVersion.tag) {
        delete tagVersion.tag
      }
      config.tags[tag] = tagVersion
    }

    // Write config
    await exec.exec('mkdir', ['-p', path.dirname(file)])
    await fs.promises.writeFile(file, JSON.stringify(config, null, '  '))
    console.log(`Added config file: ${file}`)
  }
  finally {
    process.chdir(originalCwd)
  }
}
exports.add = add

/**
 * Returns the action config file path
 * @param {string} owner
 * @param {string} repo
 * @returns {string}
 */

function getFilePath(owner, repo) {
  assert.ok(owner, "Arg 'owner' must not be empty")
  assert.ok(repo, "Arg 'repo' must not be empty")
  return path.join(paths.actionsConfig, `${owner}_${repo}.json`)
}
exports.getFilePath = getFilePath

/**
 * Returns the action config file paths
 * @returns {Promise<string[]>}
 */
async function getFilePaths() {
  const names = await fs.promises.readdir(paths.actionsConfig)
  return names.filter(x => x.endsWith('.json')).map(x => path.join(paths.actionsConfig, x))
}
exports.getFilePaths = getFilePaths

/**
 * Loads an action config file
 * @param {string} owner
 * @param {string} repo
 * @returns {Promise<ActionConfig>}
 */
async function load(owner, repo) {
  assert.ok(owner, "Arg 'owner' must not be empty")
  assert.ok(repo, "Arg 'repo' must not be empty")
  const file = getFilePath(owner, repo)
  const buffer = await fs.promises.readFile(file)
  return JSON.parse(buffer.toString())
}
exports.load = load

/**
 * Loads an action config file from a specific path
 * @param {string} file  File path
 * @returns {Promise<ActionConfig>}
 */
async function loadFromPath(file) {
  assert.ok(file, "Arg 'file' must not be empty")
  const buffer = await fs.promises.readFile(file)
  return JSON.parse(buffer.toString())
}
exports.loadFromPath = loadFromPath
