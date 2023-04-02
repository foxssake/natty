import { Message, MessageHeader } from '@elementbound/nlon'
import assert from 'node:assert'
import { Client } from '../client.mjs'

export class LobbiesClient extends Client {
  async create (name) {
    assert(this.game, 'Game not set!')

    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/create',
        authorization: this.context.authorization,
        game: this.game
      }),
      body: {
        name
      }
    }))

    corr.finish()

    const response = await corr.next()

    this.context.lobbyId = response.lobby.id
  }

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
  }

  async leave () {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/leave',
        authorization: this.context.authorization
      })
    }))

    corr.finish()
    await corr.next()
  }

  async * list () {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'lobby/list',
        authorization: this.context.authorization,
        game: this.game
      })
    }))

    for await (const chunk of corr.all()) {
      for (const lobby of chunk.lobbies) {
        yield lobby.id
      }
    }
  }

  /**
  * Current game id
  * @type {string}
  */
  get game () {
    return this.context.game
  }

  set game (v) {
    this.context.game = v
  }

  /** @type {string} */
  get lobbyId () {
    return this.context.lobbyId
  }
}
