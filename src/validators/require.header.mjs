export class MissingHeaderError extends Error { }

export class MissingAuthorizationError extends Error { }

/**
* Validate that header is present.
* @param {string} name Header name
* @param {function(): Error} [errorSupplier] Error supplier method
* @returns {ReadHandler}
*/
export function requireHeader (name, errorSupplier) {
  errorSupplier ??= () => new MissingHeaderError(`Missing header: ${name}`)

  return function (_body, header, _context) {
    if (header[name] === undefined) {
      throw errorSupplier()
    }
  }
}

export function requireAuthorization () {
  return requireHeader(
    'authorization',
    () => new MissingAuthorizationError('Missing authorization header!')
  )
}
