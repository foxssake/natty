import { fail } from 'node:assert'
import { Message, MessageHeader } from '@elementbound/nlon'
import { Client } from '../client.mjs'

/**
* Stateful client for session-related subjects.
*/
export class SessionClient extends Client {
  /**
  * Start session by logging in.
  * @param {string} name Username
  * @param {string} game Game id
  * @returns {Promise<string>} Session id
  */
  async login (name, game) {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'session/login',
        game
      }),
      body: {
        name
      }
    }))

    corr.finish()
    const response = await corr.next()
    const session = response.session ?? fail('No session in response!')

    this.context.authorization = session

    return session
  }

  /**
  * Terminate session by logging out.
  */
  async logout () {
    const corr = this.peer.send(new Message({
      header: new MessageHeader({
        subject: 'session/logout',
        authorization: this.context.authorization
      })
    }))

    corr.finish()
    await corr.next()

    this.context.authorization = undefined
  }
}
