/* eslint-disable */
import { LobbyData } from './lobby.data.mjs'
/* eslint-enable */
import { Repository } from '../repository.mjs'

/**
* Repository managing all active lobbies.
* @extends {Repository<LobbyData, string>}
*/
export class LobbyRepository extends Repository { }
