/**
* Game data.
*/
export class GameData {
  /**
  * Game id.
  * @type {string}
  */
  id

  /**
  * Game name.
  * @type {string}
  */
  name

  /**
  * Construct instance.
  * @param {GameData} [options] Options
  */
  constructor (options) {
    options && Object.assign(this, options)
  }
}
