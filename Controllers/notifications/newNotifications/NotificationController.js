const GenerateNotificatonsData = require("../../../functions/GenerateNotificationsData");
const { NotificationManagementQueue } = require("../../../jobs");
const NotificationSystem = require("./NotificationSystem");
require("dotenv").config();

//  ================================================ Event List  ==================================================================

const AddEventInList = async (req, res) => {
  const { eventname } = req.params;
  try {
    const register = await NotificationSystem.AddEventId(eventname);
    if (register.error) return res.status(400).json(register);
    res.status(200).json(register);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllEvents = async (req, res) => {
  try {
    const response = await NotificationSystem.GetNotificatinEvents();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ===========================================================Event List End  =====================================================================

// ==========================================================Notification Events ===================================================================

const RegisterNotificationEvent = async (req, res) => {
  const formdata = req.body;
  try {
    const response = await NotificationSystem.CreateNotificationEvent(formdata);
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetNotificationEvent = async (req, res) => {
  const { eventId, id } = req.query;
  try {
    const response = await NotificationSystem.GetNotifyEvents({
      eventId: eventId ? eventId : null,
      id: id ? id : null,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
const UpdateNotificationEvent = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await NotificationSystem.UpdateNotifyEvents({
      id: id,
      formdata: req.body,
    });
    if (response.error) return res.status(400).json(response);
    res
      .status(200)
      .json({ error: false, message: "success", data: response.data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateStatusNotificationEvent = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;
  try {
    let _update = false;
    if (status) {
      _update = status;
    }
    const response = await NotificationSystem.DeactivateEvent(id, _update);
    if (response.error)
      return res.status(400).json({ error: true, message: response.message });
    res
      .status(200)
      .json({ error: false, message: "succcess", data: response.data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// =====================================================Notification Events  End ========================================================================

// ======================================================Notification Templates  =========================================================================

const RegisterNotification = async (req, res) => {
  const formdata = req.body;
  try {
    const response = await NotificationSystem.CreateTempate(formdata);
    if (response.error) return res.status(400).json(response);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetTempalates = async (req, res) => {
  const { eventId } = req.query;
  try {
    const response = await NotificationSystem.GetTempalteByID(eventId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};
const GetAllTemplatesWithFilters = async (req, res) => {
  const { eventId, search, person, type } = req.query;

  // query se chek kro fir aage kro
  try {
    const response = await NotificationSystem.GetAllTemplatesWithFilter({
      eventId,
      search,
      person,
      type,
    });
    if (response.error) return res.status(400).json(response);
    res
      .status(200)
      .json({ error: false, message: "success", data: response.data });
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const DeleteTheTemplateByid = async (req, res) => {
  const { id, evntId } = req.query;
  try {
    const response = await NotificationSystem.DeleteTemplates({
      id: id,
      eventId: evntId,
    });
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateThemTemplate = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await NotificationSystem.UpdateTemplate({
      id: id,
      formdata: formdata,
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// ============================================== End Notification Templates ==================================================================================

const sendNotification = async (req, res) => {
  const { eventId } = req.query;
  try {
    const userData = {
      _id: "6ljeueue523432893ii",
      email: "abhishektrickle@gmail.com",
      name: "Abhishek Sharma",
      mobileNo: 7052237052,
    };
    // const response = await NotificationSystem.ManageNotification({
    //   data: {
    //     customer: {
    //       ...userData,
    //       recipient: "abhishektrickle@gmail.com",
    //       mobile: 7052237052,
    //     },
    //     admin: {
    //       ...userData,
    //       recipient: "admin@hoteliorooms.com",
    //       mobile: 8090300447,
    //       inAppId: `6473242jkklj2362483732`,
    //     },
    //     partner: {
    //       ...userData,
    //       recipient: "partner@gmail.com",
    //       mobile: 9002933234,
    //       inAppId: `6473242jkklj2362483732`,
    //     },
    //     agent: {
    //       ...userData,
    //       recipient: "agent@gmail.com",
    //       mobile: 9002933234,
    //     },
    //   },
    //   eventId: eventId,
    // });
    const notifyData = await GenerateNotificatonsData({
      customer: {
        ...userData,
      },
      admin: {
        ...userData,
      },
    });

    NotificationManagementQueue.add(`eventNotification:${eventId}`, {
      eventId,
      data: notifyData,
    });

    res.status(200).json(notifyData);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const SendCustomBulkEmailNotification = async (req, res) => {
  const { message, recievers, Subject, template } = req.body;
  try {
    const response = await NotificationSystem.SendEmailToCategory({
      message: message ? message : undefined,
      recievers: recievers ? recievers : undefined,
      Subject: Subject ? Subject : undefined,
      template: template ? template : undefined,
    });
    if (response.error) return res.status(400).json(response);
    res.status(200).json({ error: false, message: "success" });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetUserInappNotifications = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await NotificationSystem.GetInAppNotificationByUser(id);
    if (response.error) res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const ReadTheInAppNotifications = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await NotificationSystem.ReadTheInAppNotification(id);
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const CreateInAppNotificationApi = async (req, res) => {
  const formdata = req.body;
  try {
    const response = await NotificationSystem.CreateInAppNotification({
      recipient: formdata.recipient,
      message: formdata.message,
      mood: formdata.mood,
      sender: formdata.sender,
      subject: formdata.subject,
      html: formdata.html ? formdata.html : undefined,
      button: formdata.button ? formdata.button : undefined,
    });
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetALlInAppNotifications = async (req, res) => {
  try {
    const response = await NotificationSystem.GetInappAllNotifications();
    if (response.error) return res.status(400).json(response);
    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  AddEventInList,
  GetAllEvents,
  RegisterNotificationEvent,
  GetNotificationEvent,
  RegisterNotification,
  GetTempalates,
  sendNotification,
  UpdateNotificationEvent,
  UpdateStatusNotificationEvent,
  GetAllTemplatesWithFilters,
  SendCustomBulkEmailNotification,
  DeleteTheTemplateByid,
  UpdateThemTemplate,
  GetUserInappNotifications,
  ReadTheInAppNotifications,
  CreateInAppNotificationApi,
  GetALlInAppNotifications,
};
