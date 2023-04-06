import { describe, it } from 'node:test'
import assert from 'node:assert'
import { enumerated, integer, number } from '../../src/config.parsers.mjs'

function Case(name, input, expected) {
  return { name, input, expected }
}

const cases = {
  integer: {
    method: value => integer(value),
    cases: [
      Case('should parse valid', '42', 42),
      Case('should return undefined on invalid', 'asd', undefined),
      Case('should return undefined on empty', '', undefined),
      Case('should return undefined on undefined', undefined, undefined)
    ]
  },

  number: {
    method: value => number(value),
    cases: [
      Case('should parse valid integer', '42', 42),
      Case('should parse valid number', '420.69', 420.69),
      Case('should return undefined on invalid', 'asd', undefined),
      Case('should return undefined on empty', '', undefined),
      Case('should return undefined on undefined', undefined, undefined)
    ]
  },

  enumerated: {
    method: ([value, known]) => enumerated(value, known),
    cases: [
      Case('should return known', ['a', ['a', 'b', 'c']], 'a'),
      Case('should return undefined on unknown', ['f', ['a', 'b']], undefined),
      Case('should return undefined on empty', ['', ['a', 'b']], undefined),
      Case('should return undefined on undefined', [undefined, ['a']], undefined)
    ]
  }
}

Object.entries(cases).forEach(([name, entry]) => {
  describe(name, () => {
    entry.cases.forEach(kase => {
      it(kase.name, () => {
        // Given
        const expected = kase.expected

        // When
        const actual = entry.method(kase.input)

        // Then
        assert.deepEqual(actual, expected)
      })
    })
  })
})
