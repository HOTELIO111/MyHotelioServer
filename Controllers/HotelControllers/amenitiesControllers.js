const AmenityModel = require('../../Model/HotelModel/amenitiesModel');

const AddAmenity = async (req, res) => {
    const formdata = req.body;

    try {
        const isAvailable = await AmenityModel.findOne({ title: formdata.title })
        if (isAvailable) return res.status(409).json({ error: true, message: "Already Registered" })

        const isReg = await new AmenityModel(formdata).save()
        if (!isReg) return res.status(400).json({ error: true, message: "Register Failed ! please try again" })

        res.status(200).json({ error: false, message: "success", data: isReg })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// delete the room type  

const DeleteAmenity = async (req, res) => {
    const { id } = req.params;

    AmenityModel.findByIdAndDelete(id).then(() => {
        res.status(200).json({ error: false, message: " deleted successfully " })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}


// update the RoomType 
const UpdateAmenity = async (req, res) => {
    const { id } = req.params;
    const formdata = req.body;

    try {
        const amenityData = await AmenityModel.findById(id)
        if (formdata.title !== amenityData.title) {
            const oldOne = await AmenityModel.findOne({ title: formdata.title })
            if (oldOne) return res.status(409).json({ error: true, message: "already Amenity is available" })
        }

        // now update the data
        const isUpdated = await AmenityModel.findByIdAndUpdate(id, formdata, { new: true })
        if (!isUpdated) return res.status(400).json({ error: true, message: "updation failed" })

        res.status(200).json({ error: false, message: 'Amenity updated successfully', data: isUpdated })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// delete all the room type 

const DeleteAllAmenity = async (req, res) => {

    AmenityModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "All Amenity deleted successfully " })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}


// Getall Room type
const GetAmenity = async (req, res) => {
    const { id } = req.query;
    const credentials = id ? { _id: id } : {}
    try {
        const data = await AmenityModel.find(credentials)
        if (!data) return res.status(404).json({ error: true, message: "no user found" })

        res.status(200).json({ error: false, message: 'success', data: data })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}









module.exports = {
    AddAmenity,
    GetAmenity,
    DeleteAllAmenity,
    UpdateAmenity,
    DeleteAmenity
};
