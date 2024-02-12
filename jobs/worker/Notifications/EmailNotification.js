const NotificationsEvents = require("../../../helper/notifications/NotificationSystem");
const { NotificationsQueue } = require("../..");
const {
  NotificationType,
} = require("../../../helper/notifications/notificationsEvents");

require("dotenv").config();

const EmailWorker = async (data) => {
  const { name, data: QueueData } = data;
  const eventId = QueueData.eventId;
  const notification = new NotificationsEvents(name, eventId);
  const recipient = data.data.recipient;
  const eventdata = await notification.findEventData();

  if (eventdata.error) {
    const errorMessage = `Wrong EventId using ${notification.eventId}`;
    return notification.SendInAppNotification(
      errorMessage,
      `wrong event id using ${notification.eventId} please check it or make it correct`,
      process.env.ADMIN,
      "warning",
      process.env.SERVERID
    );
  }

  const templateData = notification.eventData.templateKeys.reduce(
    (acc, item) => {
      acc[item] = QueueData[item];
      return acc;
    },
    {}
  );

  const email = {};
  let sms;

  if (notification.emailTemplate) {
    email.html = await notification.GenerateTemplate(
      notification.emailTemplate.html,
      templateData
    );
    email.message = await notification.GenerateTemplate(
      notification.emailTemplate.message,
      templateData
    );

    const emailQueueData = {
      type: NotificationType.email,
      recipient: recipient.email,
      cc: "sharmag226025@gmail.com",
      subject: data.data.subject
        ? data.data.subject
        : notification.eventData.subject,
      html: email.html || "",
      text: email.message || "",
    };

    NotificationsQueue.add(
      `Email send For Event ${notification.eventId}`,
      emailQueueData
    );
  }

  if (notification.smsTemplate) {
    sms = await notification.GenerateTemplate(
      notification.smsTemplate.message,
      templateData
    );

    const smsQueueData = {
      type: NotificationType.mobile,
      recipient: [recipient.mobile],
      text: sms || "Message From Hotelio undefined",
    };

    NotificationsQueue.add(
      `Sms send for Event ${notification.eventId}`,
      smsQueueData
    );
  }
};

module.exports = EmailWorker;
