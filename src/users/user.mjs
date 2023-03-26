import { DataObject } from '../data.mjs'

/**
* Class representing a User.
* @extends {DataObject{User}}
*/
export class User extends DataObject {
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
}
