const NotificationModel = require('../../Model/other/notificationModel');
const { AddNotification, Recipient } = require('../../helper/notifications/notificationHelpers');
const NotificationManager = require('./../../functions/notificationsFunc');



const CreateNotification = async (req, res) => {
    const { recipient, notificationkey, data } = req.query;
    if (!recipient && !notificationkey && !data) return res.status(404).json({ error: true, message: "Invalid Credentials" })

    try {
        const created = new NotificationManager()
        const sended = created.sendNotification(recipient, notificationkey, data)


        const submited = await AddNotification(sended.message, sended.recipient)
        if (!submited) return res.status(400).json({ error: true, message: "notification creation failed" })



        res.status(200).json({ error: false, message: "success", data: submited })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}



const GetRecipientNotification = async (req, res) => {
    const { recipient } = req.params;

    try {
        const data = await Recipient(recipient)
        res.status(200).json({ error: false, message: "success", data: data })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}



// delete notification by id 

const GetDeleteNotificationByID = async (req, res) => {
    const { id } = req.params;

    try {
        const response = await NotificationModel.findByIdAndDelete(id)
        if (!response) return res.status(400).json({ error: true, message: "failed to delete ! try again " })
        res.status(200).json({ error: false, message: "success", data: response })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}



// Delete single vendor all notifications


const DeleteSingeVendorAllNotification = async (req, res) => {
    const { id } = req.params;
    try {
        const isDeleted = await NotificationModel.deleteMany({ recipient: id })
        if (!isDeleted) return res.status(404).json({ error: true, message: "no data found to delete" })

        res.status(200).json({ error: false, message: "success" })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// get all the notificaitons

const GetAllNotifications = async (req, res) => {
    try {
        const response = await NotificationModel.find({});
        if (response.length === 0) {
            return res.status(204).json({ error: false, message: "No data found" });
        }
        res.status(200).json({ error: false, message: "Success", data: response });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
};



const GetDeleteAllTheNotification = () => {
    NotificationModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "success deleted" })
    }).catch((err) => {
        res.status(500).json({ error: true, message: err.message })
    })
}



module.exports = { CreateNotification, GetRecipientNotification, GetDeleteNotificationByID, DeleteSingeVendorAllNotification, GetAllNotifications, GetDeleteAllTheNotification }