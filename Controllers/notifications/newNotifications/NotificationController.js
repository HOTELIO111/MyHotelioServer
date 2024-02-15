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
        _id: "6u634345u36345u4344u3",
        email: "admin@gmal.com",
        mobileNo: 8090300447,
        info: userData,
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

module.exports = {
  AddEventInList,
  GetAllEvents,
  RegisterNotificationEvent,
  GetNotificationEvent,
  RegisterNotification,
  GetTempalates,
  sendNotification,
};
