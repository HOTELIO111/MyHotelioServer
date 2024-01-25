const { bookingCancelConfirmations } = require("../../../data/emailFormats");
const SendMail = require("../../../Controllers/Others/Mailer");
const NotificationsEvents = require("../../../helper/notifications/Notification");

require("dotenv").config();

const EmailWorker = async (data) => {
  const eventId = data.data.eventId;
  const notification = new NotificationsEvents(data.name, eventId);
  const eventdata = notification.findEventData();
  if (!eventdata)
    return notification.SendInAppNotification(
      `Wrong EventId using ${eventId}`,
      `wrong event id implemented ${eventId} please check it or make it correct`,
      process.env.ADMIN,
      "warning",
      process.env.SERVERID
    );

  // check the data of event  and send which type of notification has to send
};

module.exports = { EmailWorker };
