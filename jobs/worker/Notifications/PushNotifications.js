const admin = require("firebase-admin");
class PushNotificationService {
  static async sendToDevice(fcmToken, title, message, data = {}) {
    const notificationPayload = {
      notification: {
        title: title,
        body: message,
      },
      data: data,
    };

    try {
      const response = await admin
        .messaging()
        .send({ ...notificationPayload, token: fcmToken });
      console.log("Successfully sent push notification:", response);
      return { error: false, message: "Successfully sent push notification" };
    } catch (error) {
      console.error("Error sending push notification:", error);
      return { error: true, message: error.message };
    }
  }

  static async subscribeToTopic(fcmToken, topic) {
    try {
      const response = await admin
        .messaging()
        .subscribeToTopic(fcmToken, topic);
      console.log("Successfully subscribed to topic:", response);
      return { error: false, message: "Successfully subscribed to topic" };
    } catch (error) {
      console.error("Error subscribing to topic:", error);
      return { error: true, message: error.message };
    }
  }

  static async unsubscribeFromTopic(fcmToken, topic) {
    try {
      const response = await admin
        .messaging()
        .unsubscribeFromTopic(fcmToken, topic);
      console.log("Successfully unsubscribed from topic:", response);
      return { error: false, message: "Successfully unsubscribed from topic" };
    } catch (error) {
      console.error("Error unsubscribing from topic:", error);
      return { error: true, message: error.message };
    }
  }
}

module.exports = PushNotificationService;
