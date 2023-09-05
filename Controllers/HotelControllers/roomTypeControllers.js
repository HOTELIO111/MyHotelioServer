const RoomsTypeModel = require("../../Model/HotelModel/roomsTypeModel");


const AddRoomType = async (req, res) => {
    const formdata = req.body;
    try {
        // check the roomtype is already registered or not 
        const ifReg = await RoomsTypeModel.findOne({ roomType: formdata.roomType })
        if (ifReg) return res.status(409).json({ error: true, message: "Room Type is already registered" })
        // regiter a new root Type
        const isAdded = await new RoomsTypeModel(formdata).save()
        if (!isAdded) return res.status(400).json({ error: true, message: "request failed check the fields and try again" })

        res.status(200).json({ error: false, message: "success", data: isAdded })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// delete the room type  

const DeleteRoomType = async (req, res) => {
    const { id } = req.params;

    RoomsTypeModel.findByIdAndDelete(id).then(() => {
        res.status(200).json({ error: false, message: "Room Type deleted successfully " })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}


// update the RoomType 
const UpdateRoomType = async (req, res) => {
    const { id } = req.params;
    const formdata = req.body;

    try {
        const roomTypeData = await RoomsTypeModel.findById(id)
        if (formdata.roomType !== roomTypeData.roomType) {
            const oldOne = await RoomsTypeModel.findOne({ roomType: formdata.roomType })
            if (oldOne) return res.status(409).json({ error: true, message: "already Room Type is available" })
        }

        // now update the data
        const isUpdated = await RoomsTypeModel.findByIdAndUpdate(id, formdata, { new: true })
        if (!isUpdated) return res.status(400).json({ error: true, message: "updation failed" })

        res.status(200).json({ error: false, message: 'Room type updated successfully', data: isUpdated })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// delete all the room type 

const DeleteRoomTypeAll = async (req, res) => {

    RoomsTypeModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "All Room Type deleted successfully " })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}


// Getall Room type
const GetRoomType = async (req, res) => {
    const { id } = req.query;
    const credentials = id ? { _id: id } : {}
    try {
        const data = await RoomsTypeModel.find(credentials)
        if (!data) return res.status(404).json({ error: true, message: "no user found" })

        res.status(200).json({ error: false, message: 'success', data: data })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}




module.exports = {
    AddRoomType,
    DeleteRoomType,
    UpdateRoomType,
    DeleteRoomTypeAll,
    GetRoomType
};
