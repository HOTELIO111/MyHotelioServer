const { AddNotification } = require("../helper/notifications/notificationHelpers");





// Create a notification manager
class NotificationManager {
    constructor() {
        this.notificationTemplates = {
            "vendor-welcome": "Hello {{name}}, welcome to Hotelio Partner Dashboard! We are excited to have you as a Hotel Partner. Get started now.",
            "kyc-req": "Dear {{name}}, your KYC request has been sent. We will review it shortly.",
            "kyc-approved": "Congratulations, {{name}}! Your KYC has been approved. You can now access all features.",
            "hotel-add": "Great news, {{name}}! Your hotel '{{hotelName}}' has been added successfully. Start managing your listings now.",
            "hotel-booking": "You have a new booking for one of your hotel rooms at '{{hotelName}}'. Check your booking reports.",
            "apply-coupon": "An admin has applied the coupon code '{{couponCode}}' for every room. Enjoy the discounts!",
            "account-suspension": "Attention, {{name}}! Your account has been suspended. Please contact support for more information."
        };
    }

    sendNotification(recipientId, notificationKey, data) {
        if (notificationKey in this.notificationTemplates) {
            let notificationText = this.notificationTemplates[notificationKey];

            // Replace placeholders with actual data
            for (const key in data) {
                const placeholder = `{{${key}}}`;
                notificationText = notificationText.replace(placeholder, data[key]);
            }

            return { "recipient": recipientId, "message": notificationText }; // Notification sent successfully
        } else {
            return false; // Invalid notification key
        }
    }
}

module.exports = NotificationManager;


// -- vendor register welcome notification  - vendor-welcome
// -- vendor request for kyc sent -  kyc-req
// -- vendor kyc accepted  - kyc-approved
// -- vendor hotel added successfully - hotel-add
// -- vendor booking by some one booking reports  -  hotel-booking
// -- admin applies a coupon for every rooms  - apply-coupon
// -- admin account suspension   - account-suspension
