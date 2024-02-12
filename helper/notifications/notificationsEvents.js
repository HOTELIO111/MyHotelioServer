// create Email Template

const NotificationsEventsModel = require("../../Model/Notifications/NotificationEvents");
const EmailTemplates = require("../../Model/Notifications/EmailTemplates");
const SMSTemplates = require("../../Model/Notifications/MobileTemplates");
const NotificationModel = require("../../Model/Notifications/notificationModel");

const GenerateEmailTemplate = async (formdata) => {
  try {
    const response = await new EmailTemplates(formdata).save();
    if (!response)
      return { error: true, message: "failed to create Email Template" };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const UpdateEmailTemplate = async (id, formdata) => {
  const userid = id;
  try {
    const response = await EmailTemplates.findByIdAndUpdate(userid, formdata, {
      new: true,
    });
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const DeleteEmailTemplate = async (id) => {
  try {
    const response = await EmailTemplates.findByIdAndDelete(id);
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetAllEmailTemplate = async () => {
  try {
    const response = await EmailTemplates.find({});
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// =================================== create Mobile Template ============================

const GenerateMobileTemplate = async (formdata) => {
  try {
    const response = await new SMSTemplates(formdata).save();
    if (!response)
      return { error: true, message: "failed to create Email Template" };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const UpdateMobileTemplate = async (id, formdata) => {
  const userid = id;
  try {
    const response = await SMSTemplates.findByIdAndUpdate(userid, formdata, {
      new: true,
    });
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const DeleteMobileTemplate = async (id) => {
  try {
    const response = await SMSTemplates.findByIdAndDelete(id);
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetMobileTempaltes = async () => {
  try {
    const response = await SMSTemplates.find({});
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ============================================== Email and Mobile notification Events ==============================

const GenerateNotificationEvents = async (formData) => {
  try {
    const response = await NotificationsEventsModel.create(formData);
    if (!response)
      return { error: true, message: "Error in creating notification events" };
    return { error: false, data: response }; // Assuming you want to return the response data on success
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const UpdateNotificationEvents = async (id, formdata) => {
  try {
    const response = await NotificationsEventsModel.findByIdAndUpdate(
      id,
      formdata,
      { new: true }
    );
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const DeleteNotificationEvent = async (id) => {
  try {
    const response = await NotificationsEventsModel.findByIdAndDelete(id);
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetNotificationEvent = async (eventid) => {
  try {
    let _find = {};
    if (eventid) {
      _find = { eventId: eventid };
    }
    const response = await NotificationsEventsModel.find(_find);
    if (!response) return { error: true, message: response };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// Admin Notificatgions

// data Format

const GenerateInAppIdNotifications = async ({
  subject,
  message,
  recipient,
  mood,
  sender,
}) => {
  try {
    const response = await new NotificationModel({
      title: subject,
      message: message,
      recipient: recipient,
      notification_mood: mood,
      sender: sender,
    }).save();
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// send Email Notifications
const SendNow = async ({ to, subject, html, text, cc }) => {
  const mailOptions = {
    from: process.env.SENDEREMAIL,
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
  // Send Mail
  await SendMail(mailOptions);
};

const NotificationType = {
  mobile: "mobile",
  inApp: "inApp",
  email: "email",
};

module.exports = {
  GenerateEmailTemplate,
  UpdateEmailTemplate,
  DeleteEmailTemplate,
  GetAllEmailTemplate,
  GenerateMobileTemplate,
  UpdateMobileTemplate,
  DeleteMobileTemplate,
  GetMobileTempaltes,
  GenerateNotificationEvents,
  UpdateNotificationEvents,
  DeleteNotificationEvent,
  GetNotificationEvent,
  GenerateInAppIdNotifications,
  SendNow,
  NotificationType,
};
