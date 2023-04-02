import { NotificationService } from './notification.service.mjs'
import { sessionRepository } from '../sessions/sessions.mjs'

export const notificationService = new NotificationService({
  sessionRepository
})
