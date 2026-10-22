import { EventEmitter } from 'events';

class NotificationEmitter extends EventEmitter {}

const notificationEmitter = new NotificationEmitter();
// Allow up to 200 concurrent listening admin sessions
notificationEmitter.setMaxListeners(200);

export default notificationEmitter;
