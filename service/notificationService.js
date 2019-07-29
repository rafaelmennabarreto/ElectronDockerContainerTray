const { Notification } = require('electron');

const NotificationService = {
  sendNotification: (title, message) => {
    new Notification({
      title: title,
      body: message,
    }).show();
  },
};

module.exports = NotificationService;
