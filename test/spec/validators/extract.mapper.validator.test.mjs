import { describe, it, mock } from 'node:test'
import assert from 'node:assert'
import { ExtractMapperValidator } from '../../../src/validators/extract.mapper.validator.mjs'

describe('ExtractMapperValidator', () => {
  it('should pass', () => {
    // Given
    const expected = 'value'

    const options = {
      extractor: mock.fn(body => body.id),
      mapper: mock.fn(() => expected),
      writer: mock.fn((context, value) => { context.result = value }),
      thrower: mock.fn(() => { throw new Error() })
    }

    const validator = new ExtractMapperValidator(options)

    const body = { id: 2 }
    const header = {}
    const context = {}

    // When
    validator.validate(body, header, context)

    // Then
    assert.equal(context.result, expected)

    assert.equal(options.extractor.mock.callCount(), 1)
    assert.deepEqual(
      options.extractor.mock.calls[0].arguments,
      [body, header, context]
    )

    assert.equal(options.mapper.mock.callCount(), 1)
    assert.deepEqual(
      options.mapper.mock.calls[0].arguments,
      [body.id]
    )

    assert.equal(options.writer.mock.callCount(), 1)
    assert.deepEqual(
      options.writer.mock.calls[0].arguments,
      [context, 'value']
    )

    assert.equal(options.thrower.mock.callCount(), 0)
  })

  it('should throw on failed extract', () => {
    // Given
    const options = {
      extractor: mock.fn(body => undefined),
      mapper: mock.fn(() => {}),
      writer: mock.fn((context, value) => {}),
      thrower: mock.fn(() => { throw new Error() })
    }

    const validator = new ExtractMapperValidator(options)

    const body = { id: 2 }
    const header = {}
    const context = {}

    // When + Then
    assert.throws(() =>
      validator.validate(body, header, context)
    )

    assert.equal(context.result, undefined)

    assert.equal(options.extractor.mock.callCount(), 1)
    assert.deepEqual(
      options.extractor.mock.calls[0].arguments,
      [body, header, context]
    )

    assert.equal(options.mapper.mock.callCount(), 0)
    assert.equal(options.writer.mock.callCount(), 0)

    assert.equal(options.thrower.mock.callCount(), 1)
    assert.deepEqual(
      options.thrower.mock.calls[0].arguments,
      [undefined, undefined]
    )
  })

  it('should throw on failed mapping', () => {
    // Given
    const options = {
      extractor: mock.fn(body => 2),
      mapper: mock.fn(() => undefined),
      writer: mock.fn((context, value) => {}),
      thrower: mock.fn(() => { throw new Error() })
    }

    const validator = new ExtractMapperValidator(options)

    const body = { id: 2 }
    const header = {}
    const context = {}

    // When + Then
    assert.throws(() =>
      validator.validate(body, header, context)
    )

    assert.equal(context.result, undefined)

    assert.equal(options.extractor.mock.callCount(), 1)
    assert.deepEqual(
      options.extractor.mock.calls[0].arguments,
      [body, header, context]
    )

    assert.equal(options.mapper.mock.callCount(), 1)
    assert.deepEqual(
      options.mapper.mock.calls[0].arguments,
      [body.id]
    )

    assert.equal(options.writer.mock.callCount(), 0)

    assert.equal(options.thrower.mock.callCount(), 1)
    assert.deepEqual(
      options.thrower.mock.calls[0].arguments,
      [body.id, undefined]
    )
  })
})
