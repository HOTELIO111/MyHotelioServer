const SendMail = require("../../Controllers/Others/Mailer");
const NotificationsEventsModel = require("../../Model/Notifications/NotificationEvents");

class NotificationsEvents {
  constructor(event, eventId) {
    this.eventType = event;
    this.eventId = eventId;
  }

  async findEventData() {
    if (!this.eventId && !this.eventType) {
      return "Provide the eventId and eventType";
    }

    try {
      const findEventId = await NotificationsEventsModel.findOne({
        eventId: this.eventId,
      });

      if (!findEventId) return "Wrong eventId";

      return findEventId;
    } catch (error) {
      return error.message;
    }
  }

  async SendInAppNotification(subject, message, recipient, mood, sender) {
    try {
      const response = await new NotificationModel({
        title: subject,
        message: message,
        recipient: recipient,
        notification_mood: mood,
        sender: sender,
      }).save();

      if (!response) {
        return { error: true, message: "Failed to send notification" };
      }

      return { error: false, message: "Success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async SendEmailNotifications(to, subject, html, text, cc) {
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: to,
      subject: subject,
    };

    if (html) {
      mailOptions.html = html;
    }

    if (text) {
      mailOptions.text = text;
    }

    if (cc) {
      mailOptions.cc = cc;
    }

    try {
      await SendMail(mailOptions);
      return { error: false, message: "Email notification sent successfully" };
    } catch (error) {
      return {
        error: true,
        message: `Failed to send email notification: ${error.message}`,
      };
    }
  }

  async SendMobileNotifications(message, reciever) {
    // const 
  }
}

module.exports = NotificationsEvents;
