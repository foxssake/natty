/* eslint-disable */
import { MessageHeader } from '@elementbound/nlon'
/* eslint-enable */
import { requireParam } from '../assertions.mjs'
import { Validator } from './validator.mjs'

/**
* Configurable validator for extract-map validators.
*
* An extract-map validator does exactly what it implies: extracts some data,
* then maps that. If the extraction or mapping fails, an exception is thrown.
*
* @template T, U
*/
export class ExtractMapperValidator extends Validator {
  #extractor
  #mapper
  #writer
  #thrower

  /**
  * Construct validator.
  * @param {object} options Options
  * @param {function(any,MessageHeader,object): T} options.extractor Extractor
  * @param {function(T): U} options.mapper Mapper
  * @param {function(object, U)} options.writer Writer
  * @param {function(T,U)} options.thrower Thrower
  */
  constructor (options) {
    super()
    this.#extractor = requireParam(options.extractor)
    this.#mapper = requireParam(options.mapper)
    this.#writer = requireParam(options.writer)
    this.#thrower = requireParam(options.thrower)
  }

  validate (body, header, context) {
    const extract = this.#extractor(body, header, context) ??
      this.#thrower(undefined, undefined)
    const mapped = this.#mapper(extract) ??
      this.#thrower(extract, undefined)
    this.#writer(context, mapped)
  }
}
