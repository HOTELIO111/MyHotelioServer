const {
  GetNotificationEvent,
  GenerateInAppIdNotifications,
} = require("../../../helper/notifications/notificationsEvents");
require("dotenv").config();

const NotificationManager = async (data) => {
  const eventId = data.data.eventid;
  const eventTitle = data.data.eventTitle;
  // get notiication Details
  const _notificationDetails = await GetNotificationEvent(eventId);
  if (!_notificationDetails)
    return GenerateInAppIdNotifications({
      subject: `No event Id found for ${eventTitle} using this even id ${eventId}`,
      message:
        "accessing wrong event id please contact for developer we cannot send the notification ",
      sender: process.env.SERVERID,
      recipient: process.env.ADMIN,
      mood: "warning",
    });

  // sever to admin ho gaya hai aage ka bhejo
  //
  try {
  } catch (error) {}
};
module.exports = NotificationManager;

// date -

/*
{
  data :{
     subject 
  }
} 
*/
