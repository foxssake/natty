import { Message, MessageHeader } from '@elementbound/nlon'
import { Client } from '../client.mjs'

export class LobbiesClient extends Client {
  /**
  * Create a new lobby.
  *
  * Saves the lobby id in `context.lobbyId`
  * @param {string} name Lobby name
  * @param {boolean} [isPublic=true] Is public?
  * @returns {Promise<string>} Lobby id
  */
  async create (name, isPublic) {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/create',
        authorization: this.context.authorization
      }),
      body: {
        name,
        public: isPublic ?? true
      }
    }))

    corr.finish()

    const response = await corr.next()

    this.context.lobbyId = response.lobby.id
    return response.lobby.id
  }

  /**
  * Deleta a lobby.
  * @param {string} lobbyId Lobby id
  */
  async delete (lobbyId) {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/delete',
        authorization: this.context.authorization
      }),
      body: {
        lobby: {
          id: lobbyId
        }
      }
    }))

    corr.finish()
    await corr.next()
  }

  /**
  * Join a lobby.
  *
  * Saves the lobby id in `context.lobbyId`
  * @param {string} lobbyId Lobby id
  */
  async join (lobbyId) {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/join',
        authorization: this.context.authorization
      }),
      body: {
        lobby: {
          id: lobbyId
        }
      }
    }))

    corr.finish()
    await corr.next()

    this.context.lobbyId = lobbyId
  }

  /**
  * Leave the currently joined lobby.
  *
  * Resets the lobby id in `context.lobbyId`
  */
  async leave () {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/leave',
        authorization: this.context.authorization
      })
    }))

    corr.finish()
    await corr.next()

    this.context.lobbyId = undefined
  }

  /**
  * List all lobbies.
  * @returns {AsyncGenerator<string>} Lobby id's
  */
  async * list () {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/list',
        authorization: this.context.authorization
      })
    }))

    for await (const chunk of corr.all()) {
      for (const lobby of chunk.lobbies) {
        yield lobby.id
      }
    }
  }

  /**
  * Currently joined lobby
  * @type {string}
  */
  get lobbyId () {
    return this.context.lobbyId
  }
}
