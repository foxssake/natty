/* eslint-disable */
import { GameData } from './game.data.mjs'
/* eslint-enable */
import { Repository } from '../repository.mjs'

/**
* Game repository.
* @extends {Repository<GameData>}
*/
export class GameRepository extends Repository {
  constructor () {
    super({
      idMapper: game => game.id,
      itemMerger: (a, b) => Object.assign(a, b)
    })
  }
}
