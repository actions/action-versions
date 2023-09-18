const assert = require('assert')

class Patterns {
  patterns = []

  /**
   * @param {string[]} p  Array of pattern strings
   */
  constructor(p) {
    assert.ok(p && p.length, "Arg 'p' must not be empty")
    for (const pattern of p) {
      this.patterns.push(new Pattern(pattern))
    }
  }

  /**
   * Tests whether the ref is a match
   * @param {string} str
   * @returns {boolean}
   */
  test(str) {
    assert.ok(str, "Arg 'str' must not be empty")
    let result = false
    for (const pattern of this.patterns) {
      result = pattern.test(str, result)
    }

    return result
  }
}

class Pattern {
  include = true
  regexp = undefined

  /**
   * @param {string} pattern 
   */
  constructor(pattern) {
    assert.ok(pattern, "Arg 'pattern' must not be empty")
    if (pattern.startsWith('-')) {
      this.include = false
    }
    else {
      assert.ok(pattern.startsWith('+'), 'Pattern must start with + or -')
    }

    pattern = pattern.substr(1)
    assert.ok(pattern, 'Pattern must not be empty')
    this.regexp = new RegExp(pattern)
  }

  /**
   * @param {string} str      String to test
   * @param {boolean} status  Whether currently included or excluded
   */
  test(str, status) {
    assert.ok(str, "Arg 'str' must not be empty")
    if (this.include) {
      return status || this.regexp.test(str)
    }

    return status && !this.regexp.test(str)
  }
}
exports.Patterns = Patterns
