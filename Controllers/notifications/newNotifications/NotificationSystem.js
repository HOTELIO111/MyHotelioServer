const { default: mongoose } = require("mongoose");
const NotifyEventsList = require("../../../Model/Notifications/newNotifications/Events");
const NotificationEvent = require("../../../Model/Notifications/newNotifications/NotificationEvent");
const TemplatesModel = require("../../../Model/Notifications/newNotifications/templatesModel");
const NotificationModel = require("../../../Model/Notifications/newNotifications/NotificationModel");
const InAppNotifyModel = require("../../../Model/Notifications/newNotifications/InAppNotifications");
const handlebars = require("handlebars");
const { NotificationsQueue } = require("../../../jobs");

class NotificationSystem {
  // ======================================= event list ======================================================================
  static async AddEventId(eventName) {
    if (!eventName)
      return { error: true, message: "event Name is Required to create" };
    try {
      // check with the previous event Name
      const _find = await NotifyEventsList.find({
        title: eventName.toUpperCase(),
      });
      if (_find.length > 0) {
        return { error: true, message: "event name is already registered" };
      }
      const _create = await new NotifyEventsList({
        title: eventName.toUpperCase(),
      }).save();
      return {
        error: false,
        message: "successfully registered Event Id",
        data: _create,
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  static async GetNotificatinEvents() {
    try {
      const response = await NotifyEventsList.aggregate([{ $match: {} }]);
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  // ==================================================== notification event list ===============================================================

  // ================================================= Notification events Creation ===========================================================

  static async CreateNotificationEvent(formdata) {
    try {
      const _find = await NotificationEvent.find({ eventId: formdata.eventId });
      if (_find.length > 0)
        return { error: true, message: "already event credentials register" };
      const _create = await new NotificationEvent(formdata).save();
      return { error: false, message: "success", data: _create };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  static async GetNotifyEvents({ id, eventId }) {
    try {
      let _find = {};
      if (id) {
        _find = { _id: new mongoose.Types.ObjectId(id) };
      }
      if (eventId) {
        _find = { eventId: new mongoose.Types.ObjectId(eventId) };
      }
      const response = await NotificationEvent.aggregate([{ $match: _find }]);
      if (!response.length > 0)
        return { error: true, message: "no data found to show" };
      this.notificationEventData = response;
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  // ================================================= Notification events Creation ends ===========================================================

  // ================================================= Notification Templates =========================================================== ============

  static async CreateTempate(formdata) {
    try {
      const response = await new TemplatesModel(formdata).save();
      if (!response)
        return { error: true, message: "please fill the require fields" };
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  static async GetTempalteByID(eventid) {
    let _find = {};
    try {
      if (eventid) {
        _find = { eventId: new mongoose.Types.ObjectId(eventid) };
      }
      const response = await TemplatesModel.aggregate([
        {
          $match: _find,
        },
      ]);
      this.notificationTemplates = response;
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  //   ================================================== Create Template End ==================================================================
  static async CreateNotification(formdata) {
    try {
      const response = await new NotificationModel(formdata).save();
      if (!response) return { error: true, message: "required data missing " };
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  static async ManageNotification({ data, eventId }) {
    if (!this.notificationEventData) {
      await this.GetNotifyEvents({
        eventId: eventId,
      });
    }
    if (!this.notificationTemplates) {
      await this.GetTempalteByID(eventId);
    }
    try {
      // now check the user and generate the template
      const templateKeys = this.notificationEventData[0].templateKeys;
      console.log(templateKeys);
      const notificationsTo = this.notificationEventData[0].notificationTo;

      for (const [key, value] of Object.entries(notificationsTo)) {
        const template = this.notificationTemplates?.find(
          (item) => item.for === key
        );
        const roleData = data[key];

        await this.SendNotification(key, [template], value, roleData);
      }
      return {
        error: true,
        message: "success",
        data: {
          templates: this.notificationTemplates,
          event: this.notificationEventData,
        },
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  static async SendNotification(person, template, data, userData) {
    if (data.email === true) {
      const emailTemplate = this.notificationTemplates?.find(
        (item) => item.type === "email" && item.for === person
      );
      if (emailTemplate) {
        const templateData = this.notificationEventData[0].templateKeys.reduce(
          (acc, item) => {
            acc[item] = userData[item];
            return acc;
          },
          {}
        );
        const subject = await this.GenerateTemplate(
          emailTemplate?.subject,
          templateData
        );
        const message = await this.GenerateTemplate(
          emailTemplate?.message,
          templateData
        );
        const html = await this.GenerateTemplate(
          emailTemplate?.html,
          templateData
        );
        const recipient = userData.recipient;
        const cc = "sharmag226025@gmail.com";

        NotificationsQueue.add(`email To ${person}`, {
          type: "email",
          subject,
          message,
          html,
          recipient,
          cc,
        });
      } else {
        console.log("No template found to send");
      }
    }
    if (data.mobile === true) {
      const mobileTemplate = this.notificationTemplates?.find(
        (item) => item.type === "mobile" && item.for === person
      );
      if (mobileTemplate) {
        const templateData = this.notificationEventData[0].templateKeys.reduce(
          (acc, item) => {
            acc[item] = userData[item];
            return acc;
          },
          {}
        );
        const text = await this.GenerateTemplate(
          mobileTemplate?.message,
          templateData
        );
        const number = userData.mobileNo;
        // this.SendMobile({ text, number });
        NotificationsQueue.add(`Sms To ${person}`, {
          type: "mobile",
          text,
          recipient: [number],
        });
      } else {
        console.log("no mobile template found for this to send");
      }
    }
    if (data.inApp === true) {
      const templateData = this.notificationEventData[0].templateKeys.reduce(
        (acc, item) => {
          acc[item] = userData[item];
          return acc;
        },
        {}
      );
      const InAppTemplate = this.notificationTemplates?.find(
        (item) => item.type === "inApp" && item.for === person
      );
      if (InAppTemplate) {
        const subject = await this.GenerateTemplate(
          InAppTemplate.subject,
          templateData
        );
        const message = await this.GenerateTemplate(
          InAppTemplate.message,
          templateData
        );
        const recipient = userData.inAppId;
        const mood = "info";
        const sender = "ADMINID";
        await this.CreateInAppNotification({
          subject,
          message,
          recipient,
          mood,
          sender,
        });
      } else {
        console.log("No Template found to send Notification for ", person);
      }
    }
  }

  static async SendMail(data) {
    console.log("sended mail", data);
  }

  static async SendMobile(data) {
    console.log("sended Mobile Sms ", data);
  }
  static async CreateInAppNotification(data) {
    try {
      const response = await new InAppNotifyModel({
        recipient: data.recipient,
        message: data.message,
        notification_mood: data.mood,
        sender: data.sender,
        title: data.subject,
      }).save();
      if (!response)
        return {
          error: true,
          message:
            "please fill the required detials to send the in app notification",
        };
      res
        .status(200)
        .json({ error: false, message: "success", data: response });
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
  static async GenerateTemplate(template, data) {
    if (!template || !data) return false;
    const templateData = handlebars.compile(template);
    const generatedTemplate = templateData(data);
    return generatedTemplate;
  }
}

module.exports = NotificationSystem;
