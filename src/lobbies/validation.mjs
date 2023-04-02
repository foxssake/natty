import { LobbyRepository } from './lobby.repository.mjs'

class InvalidLobbyError extends Error { }

/**
* Check if message has a valid lobby specified.
*
* Saves lobby in `context.lobby`.
*
* @param {LobbyRepository} lobbyRepository Lobby repository
* @param {function(any, any):string} mapper Body+header to lobby id mapper
* @returns {ReadHandler}
*/
export function requireLobby (lobbyRepository, mapper) {
  return function (body, header, context) {
    context.lobby = lobbyRepository.find(mapper(body, header))
    if (!context.lobby) {
      throw new InvalidLobbyError('Invalid lobby!')
    }
  }
}
