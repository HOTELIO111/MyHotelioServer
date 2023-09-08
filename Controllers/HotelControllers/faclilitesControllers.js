const FacilitiesModel = require("../../Model/HotelModel/facilitymodels");
const { IsWho } = require("../../helper/hotel/hotel_helper");


const AddFacility = async (req, res) => {
    const { id } = req.params
    const formdata = req.body;

    try {
        const isAvailable = await FacilitiesModel.findOne({ title: formdata.title })
        if (isAvailable) return res.status(409).json({ error: true, message: "Already Registered" })


        const isReg = await new FacilitiesModel({
            ...formdata,
        }).save()
        if (!isReg) return res.status(400).json({ error: true, message: "Register Failed ! please try again" })

        res.status(200).json({ error: false, message: "success", data: isReg })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// delete the room type  

const DeleteFacilities = async (req, res) => {
    const { id } = req.params;

    FacilitiesModel.findByIdAndDelete(id).then(() => {
        res.status(200).json({ error: false, message: " deleted successfully " })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}


// update the RoomType 
const UpdateFacility = async (req, res) => {
    const { id } = req.params;
    const formdata = req.body;

    try {
        const facData = await FacilitiesModel.findById(id)
        if (formdata.title !== facData.title) {
            const oldOne = await FacilitiesModel.findOne({ title: formdata.title })
            if (oldOne) return res.status(409).json({ error: true, message: "already Amenity is available" })
        }

        // now update the data
        const isUpdated = await FacilitiesModel.findByIdAndUpdate(id, formdata, { new: true })
        if (!isUpdated) return res.status(400).json({ error: true, message: "updation failed" })

        res.status(200).json({ error: false, message: 'Facility updated successfully', data: isUpdated })

    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// delete all the room type 

const DeleteAllFacility = async (req, res) => {

    FacilitiesModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "All Amenity deleted successfully " })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}


// Getall Room type
const GetFacility = async (req, res) => {
    const { id } = req.query;
    const credentials = id ? { _id: id } : {}
    try {
        const data = await FacilitiesModel.find(credentials)
        if (!data) return res.status(404).json({ error: true, message: "no user found" })

        res.status(200).json({ error: false, message: 'success', data: data })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}









module.exports = {
    AddFacility,
    GetFacility,
    DeleteAllFacility,
    UpdateFacility,
    DeleteFacilities
};
