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
