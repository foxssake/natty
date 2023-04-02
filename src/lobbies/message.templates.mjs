import { Message, MessageHeader, MessageTypes } from '@elementbound/nlon'
import { User } from '../users/user.mjs'
import { LobbyData } from './lobby.data.mjs'

const Subjects = Object.freeze({
  Join: 'lobby/notif/join',
  Leave: 'lobby/notif/leave',
  Delete: 'lobby/notif/delete'
})

/**
* Create a join lobby notification message.
* @param {User} user Joining user
* @returns {Message}
*/
export function JoinLobbyNotificationMessage (user) {
  return new Message({
    header: new MessageHeader({
      subject: Subjects.Join
    }),
    body: {
      user: {
        id: user.id,
        name: user.name
      }
    }
  })
}

/**
* Create a leave lobby notification message.
* @param {User} user Leaving user
* @returns {Message}
*/
export function LeaveLobbyNotificationMessage (user) {
  return new Message({
    header: new MessageHeader({
      subject: Subjects.Leave
    }),
    body: {
      user: {
        id: user.id
      }
    }
  })
}

/**
* Create a lobby delete notification message.
* @param {LobbyData} lobby Lobby
* @returns {Message}
*/
export function DeleteLobbyNotificationMessage (lobby) {
  return new Message({
    header: new MessageHeader({
      subject: Subjects.Delete
    }),
    body: {
      lobby: {
        id: lobby.id
      }
    }
  })
}
