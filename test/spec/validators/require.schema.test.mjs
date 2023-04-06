import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { SchemaValidationError, SchemaValidator } from '../../../src/validators/require.schema.mjs'

describe('SchemaValidator', () => {
  it('should delegate to ajv', () => {
    // Given
    const ajv = {
      validate: mock.fn(() => true)
    }
    const schema = 'test/schema'
    const body = 'test'
    const header = {}
    const context = {}

    const validator = new SchemaValidator({ ajv, schema })

    // When
    validator.validate(body, header, context)
    console.log({
      actual: ajv.validate.mock.calls,
      expected: [[schema, body]]
    })

    // Then
    assert.equal(ajv.validate.mock.callCount(), 1)
    assert.deepEqual(ajv.validate.mock.calls[0].arguments, [schema, body])
  })

  it('should throw if ajv throws', () => {
    // Given
    const ajv = {
      validate: () => {
        throw new SchemaValidationError()
      }
    }
    const schema = 'test/schema'
    const body = 'test'
    const header = {}
    const context = {}

    const validator = new SchemaValidator({ ajv, schema })

    // When + then
    assert.throws(
      () => validator.validate(body, header, context),
      SchemaValidationError
    )
  })
})
