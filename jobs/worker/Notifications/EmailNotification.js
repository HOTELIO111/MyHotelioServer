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
      `wrong event id using ${eventId} please check it or make it correct`,
      process.env.ADMIN,
      "warning",
      process.env.SERVERID
    );

  // now get the event id and make the event notification LineUp
};

module.exports = { EmailWorker };
