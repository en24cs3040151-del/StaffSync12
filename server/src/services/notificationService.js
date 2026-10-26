import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipient,
  title,
  message,
  type = 'SYSTEM',
  relatedResource = null
}) => {
  try {
    if (!recipient) return null;
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedResource
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error.message);
    return null;
  }
};
