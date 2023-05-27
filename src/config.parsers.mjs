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

export function byteSize (value) {
  if (value === undefined) {
    return value
  }

  const postfixes = ['kb', 'mb', 'gb', 'tb', 'pb', 'eb', 'zb', 'yb']
  const pattern = /^([0-9\.,]+)([a-zA-Z]*)/

  const groups = pattern.exec(value)
  assert(groups, `Input "${value}" is not a size!`)

  const nominator = groups[1]
  const postfix = groups[2]

  if (!postfix) {
    return number(value)
  }

  const idx = postfixes.findIndex(pf => pf === postfix.toLowerCase())
  assert(idx >= 0, `Unknown byte postfix "${postfix}"!`)

  return number(nominator) * Math.pow(1024, idx + 1)
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
