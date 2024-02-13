const { default: axios } = require("axios");
const SendMail = require("../../Controllers/Others/Mailer");
require("dotenv").config();
const handlebars = require("handlebars");
const NotificationsEventsModel = require("../../Model/Notifications/NotificationEvents");
const NotificationModel = require("../../Model/Notifications/notificationModel");

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
      // const findEventId = await NotificationsEventsModel.findOne({
      //   eventId: this.eventId,
      // });
      const findEventData = await NotificationsEventsModel.aggregate([
        { $match: { eventid: this.eventId } },
        {
          $lookup: {
            from: "email_templates",
            localField: "templates.email",
            foreignField: "_id",
            as: "templates.email",
          },
        },
        {
          $unwind: {
            path: "$templates.email",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "sms_templates",
            localField: "templates.sms",
            foreignField: "_id",
            as: "templates.sms",
          },
        },
        {
          $unwind: { path: "$templates.sms", preserveNullAndEmptyArrays: true },
        },
      ]);
      if (findEventData.length === 0)
        return { error: true, message: "Wrong eventId" };
      this.eventData = findEventData[0];
      this.emailTemplate = findEventData[0]?.templates?.email;
      this.smsTemplate = findEventData[0]?.templates?.sms;

      return { error: false, message: "success", data: findEventData[0] };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async SendNotificationInEvent() {
    if (!this.eventData) {
      await this.findEventData();
    }
    try {
      //  event data check the categorise
      const emailEmaplate = this.emailTemplate;
      const mobileTemplate = this.smsTemplate;
    } catch (error) {
      return { error: true, message: error.message };
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

  async SendMobileNotifications(message, recievers) {
    try {
      const NotificationSchema = {
        user: process.env.W_USER,
        password: process.env.W_PASSWORD,
        senderid: process.env.W_SENDERID,
        mobiles: recievers.join(","),
        sms: `382333 is your account verification OTP. Treat this as confidential. Don't share this with anyone @www.hoteliorooms.com # (otp)`,
      };
      const queryString = new URLSearchParams(NotificationSchema).toString();
      const response = await axios.get(process.env.W_URL + queryString);

      if (response.status === 200) {
        return {
          error: false,
          message: "successfully notified on Mobile Number",
        };
      }
      return { error: true, message: "failed to notifiy on mobile number " };
    } catch (error) {
      return {
        error: true,
        message: `failed to notify through mobile and get error ${error.message}`,
      };
    }
  }

  async GenerateTemplate(template, data) {
    if (!template || !data) return false;
    const templateData = handlebars.compile(template);
    const generatedTemplate = templateData(data);
    return generatedTemplate;
  }

  async DataCaracterise() {
    if (!this.eventId) {
      throw new Error("missing event id it was required");
    }
    switch (this.eventId) {
      case "WELCOME_CUSTOMER":
        const to = ["customer", "admin"];
        return 

      default:
        break;
    }
  }
}

module.exports = NotificationsEvents;
