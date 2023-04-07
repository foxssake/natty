import { describe, it } from 'node:test'
import assert from 'node:assert'
import { HeaderValidator } from '../../../src/validators/require.header.mjs'

describe('HeaderValidator', () => {
  it('should pass', () => {
    // Given
    const body = {}
    const header = { foo: 'bar' }
    const context = {}

    const validator = new HeaderValidator('foo')

    // When
    validator.validate(body, header, context)

    // Then pass
  })

  it('should fail', () => {
    // Given
    const body = {}
    const header = { bar: 'foo' }
    const context = {}

    const validator = new HeaderValidator('foo')

    // When + then
    assert.throws(() =>
      validator.validate(body, header, context)
    )
  })
})
