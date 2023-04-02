import { fail } from 'node:assert'

/**
* Ensure param is present.
* @param {T} value Param value
* @returns {T} Param value
* @throws on missing param
* @template T
*/
export function requireParam (value) {
  return value ?? fail('Mising parameter!')
}
