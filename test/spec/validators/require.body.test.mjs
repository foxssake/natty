import { describe, it } from 'node:test'
import assert from 'node:assert'
import { BodyPresenceValidator } from '../../../src/validators/require.body.mjs'
import { Correspondence } from '@elementbound/nlon'

const failureCases = [
  { name: 'should fail undefined', input: undefined },
  { name: 'should fail null', input: null },
  { name: 'should fail End', input: Correspondence.End }
]

describe('BodyPresenceValidator', () => {
  it('should pass', () => {
    // Given
    const validator = new BodyPresenceValidator()
    const body = 'hello'
    const header = {}
    const context = {}

    // When
    validator.validate(body, header, context)

    // Then pass
  })

  failureCases.forEach(kase => {
    it(kase.name, () => {
      // Given
      const validator = new BodyPresenceValidator()
      const body = kase.input
      const header = {}
      const context = {}

      // When + then
      assert.throws(() => 
        validator.validate(body, header, context)
      )
    })
  })
})
