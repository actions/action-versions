const child_process = require('child_process')

class ExecResult {
  stdout = ''
  exitCode = 0
}
exports.ExecResult = ExecResult

/**
 * Executes a process
 * @param {string} command
 * @param {string[]} args
 * @param {boolea} allowAllExitCodes
 * @returns {Promise<ExecResult>}
 */
function exec(
  command = '',
  args = [],
  allowAllExitCodes = false
) {
  process.stdout.write(`EXEC: ${command} ${args.join(' ')}\n`)
  return new Promise((resolve, reject) =>
  {
    const execResult = new ExecResult()
    const cp = child_process.spawn(command, args, {})

    // STDOUT
    cp.stdout.on('data', (data) => {
      process.stdout.write(data)
      execResult.stdout += data.toString()
    })

    // STDERR
    cp.stderr.on('data', (data) => {
      process.stderr.write(data)
    })

    // Close
    cp.on('close', (code) => {
      execResult.exitCode = code
      if (code === 0 || allowAllExitCodes) {
        resolve(execResult)
      } else {
        reject(new Error(`Command exited with code ${code}`))
      }
    })
  })
}
exports.exec = exec
