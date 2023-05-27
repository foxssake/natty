import { describe, it } from 'node:test'
import assert from 'node:assert'
import { byteSize, enumerated, integer, number } from '../../src/config.parsers.mjs'

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

describe('byteSize', () => {
  const validCases = [
    Case('should pass through undefined', undefined, undefined),
    Case('should parse without postfix', '64', 64),
    Case('should parse kb', '64kb', 64 * 1024),
    Case('should parse Mb', '64Mb', 64 * Math.pow(1024, 2)),
    Case('should parse Gb', '64Gb', 64 * Math.pow(1024, 3)),
    Case('should parse Gb', '64Tb', 64 * Math.pow(1024, 4)),
    Case('should parse Pb', '6.4Pb', 6.4 * Math.pow(1024, 5)),
    Case('should parse Eb', '6.4Eb', 6.4 * Math.pow(1024, 6)),
    Case('should parse Zb', '64Zb', 64 * Math.pow(1024, 7)),
    Case('should parse Yb', '64Yb', 64 * Math.pow(1024, 8)),
  ]

  const throwCases = [
    Case('should throw on invalid format', 'no6'),
    Case('should throw on invalid postfix', '64Bb')
  ]

  validCases.forEach(kase =>
    it(kase.name, () => assert.equal(byteSize(kase.input), kase.expected))
  )

  throwCases.forEach(kase =>
    it(kase.name, () => assert.throws(() =>
      byteSize(kase.input)
    ))
  )
})
