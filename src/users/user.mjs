/**
* Class representing a User.
* @extends {DataObject<User>}
*/
export class User {
  /**
  * User's unique id
  * @type {string}
  */
  id

  /**
  * User's nickname
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
