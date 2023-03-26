/**
* Base class for data objects.
* @template T
*/
export class DataObject {
  /**
  * Construct instance.
  * @param {T} [data] Options
  */
  constructor (data) {
    data && Object.assign(this, data)
  }
}
