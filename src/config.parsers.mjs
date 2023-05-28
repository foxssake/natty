import assert from 'node:assert'

/**
  * Parse config value as integer.
  *
  * @param {any} value Value
  * @returns {number?} Integer or undefined
  */
export function integer (value) {
  const result = parseInt(value)
  return isNaN(result) ? undefined : result
}

/**
* Parse config value as number
*
* @param {any} value Value
* @returns {number?} Number or undefined
*/
export function number (value) {
  const result = parseFloat(value)
  return isNaN(result) ? undefined : result
}

/**
* Split an input into nominator and unit
* @param {string} value
* @returns {number[]}
*/
function extractUnit (value) {
  const pattern = /^([0-9.,]+)([a-zA-Z]*)/

  const groups = pattern.exec(value)
  assert(groups, `Can't parse input "${value}"`)

  return [groups[1], groups[2]]
}

/**
* Parse config value as human-readable size
*
* @param {any} value Value
* @returns {number?} Number or undefined
*/
export function byteSize (value) {
  if (value === undefined) {
    return value
  }

  const postfixes = ['b', 'kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb']

  const [nominator, unit] = extractUnit(value)

  const idx = postfixes.findIndex(pf => pf === (unit || 'b').toLowerCase())
  assert(idx >= 0, `Unknown byte postfix "${unit}"!`)

  return number(nominator) * Math.pow(1024, idx)
}

/**
* Parse config value as human-readable duration
*
* @param {any} value Value
* @returns {number?} Number or undefined
*/
export function duration (value) {
  if (value === undefined) {
    return value
  }

  const units = {
    '': 1,
    'us': 0.000001,
    'ms': 0.001,
    's': 1,
    'm': 60,
    'h': 3600,
    'hr': 3600,
    'd': 86400,
    'w': 604800,
    'mo': 2592000,
    'yr': 31536000
  }

  const [nominator, unit] = extractUnit(value.toLowerCase())
  assert(units[unit], `Unknown duration unit "${unit}"!`)

  return number(nominator) * units[unit]
}

/**
  * Parse config value as enum.
  *
  * @param {any} value Value
  * @param {Array} values Allowed values
  * @returns {any?} Allowed value or undefined
  */
export function enumerated (value, values) {
  return values.includes(value)
    ? value
    : undefined
}
