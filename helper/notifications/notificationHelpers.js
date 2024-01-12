const NotificationModel = require("../../Model/Notifications/notificationModel")




const AddNotification = async (message, recipient) => {

    const response = await new NotificationModel({
        message: message,
        recipient: recipient
    }).save()

    return response

}




// Get the Recipient through id 
const Recipient = async (id) => {
    const response = await NotificationModel.find({ recipient: id })
    if (!response) return null

    return response
}


module.exports = { AddNotification, Recipient }