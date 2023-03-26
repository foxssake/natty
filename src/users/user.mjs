/**
* Class representing a User.
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
  * Construct instance
  * @param {User} data User data
  */
  constructor (data) {
    data && Object.assign(this, data)
  }
}
