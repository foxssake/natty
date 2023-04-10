import { sessionRepository } from '../sessions/session.repository.mjs'
import { NotificationService } from './notification.service.mjs'

export const notificationService = new NotificationService({
  sessionRepository
})
