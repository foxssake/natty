import { DataObject } from '../data.mjs'

/**
* Game data.
* @extends {DataObject<GameData>}
*/
export class GameData extends DataObject {
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
}
