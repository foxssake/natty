import { Correspondence } from "@elementbound/nlon"

export class MissingBodyError extends Error { }

export function requireBody () {
  return function (body, _header, _context) {
    if (body === undefined || body === null || body === Correspondence.End) {
      throw new MissingBodyError('Missing message body!')
    }
  }
}
