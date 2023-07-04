const HotelModel = require("../../Model/HotelModel/HotelModel");
const VendorModel = require("../../Model/HotelModel/VendorModel");




const RegisterHotel = async (req, res) => {
    const customerId = req.params.id

    // check the hotel is already registered or not 
    const IsRegistered = await HotelModel.findOne({ hotelEmail: req.body.hotelEmail })
    if (IsRegistered) return res.status(409).json({ error: true, message: "Hotel Already Registered With this Email" });

    // Register the hotel 
    const response = await new HotelModel(req.body).save()
    if (!response) return res.status(400).json({ error: true, message: "Not Registered" })

    // find the user and update this hotel id in th
    const Vendor = await VendorModel.findByIdAndUpdate(id, { $push: { hotels: response._id } }, { new: true });
    if (!Vendor) return res.status(400).json({ error: true, message: "Hotel Not Registered Try Again" })


    res.status(200).json({ error: false, data: response });
}


// Get all the data 
const GetAllHotel = async (req, res) => {

    try {
        const AllData = await HotelModel.find({})
        if (!AllData) return res.status(400).json({ error: true, message: "No Data Found" })
        res.status(200).json({ error: true, data: AllData })
    } catch (error) {
        res.status(500).json({ error })
    }

}

const GetSingleHotel = async (req, res) => {
    const Id = req.params.id
    try {
        // check the hotel with id 
        const isHotel = await HotelModel.findById(Id)
        if (!isHotel) return res.status(404).json({ error: true, message: "No Data Found" })
        // return the response 
        res.status(200).json({ error: false, data: isHotel });
    } catch (error) {
        res.status(500).json({ error })
    }
}


// Update the Hotel Data 
const UpdateHotelData = async (req, res) => {
    const id = req.params.id

    try {
        const isUser = await HotelModel.findById(id)
        if (!isUser) return res.status(404).json({ error: true, message: "No Data Found" })
        // Find the hotel  
        const isFoundandUpdated = await HotelModel.findByIdAndUpdate(id, {
            ...req.body,
            hotelEmail: isUser.hotelEmail
        }, { new: true });
        if (!isFoundandUpdated) return res.status(400).json({ error: true, message: "No Updated" })

        res.status(200).json({ error: false, data: isFoundandUpdated, message: "Updated Successfully " })
    } catch (error) {
        res.status(500).json({ error })
    }
}

const DeleteSingleHotel = async (req, res) => {
    // id of the user to delete
    const id = req.params.id

    // find the data and delete the data
    HotelModel.findByIdAndDelete(id).then(() => {
        res.status(200).json({ error: false, message: "Deleted Successfully" })
    }).catch((err) => {
        res.status(500).json(err)
    })
}

// delet all the dat
const DeleteAllHotelData = async (req, res) => {

    // find the data and delete the data
    HotelModel.deleteMany({}).then(() => {
        res.status(200).json({ error: false, message: "Deleted Successfully" })
    }).catch((err) => {
        res.status(500).json(err)
    })
}



module.exports = { RegisterHotel, GetAllHotel, GetSingleHotel, UpdateHotelData, DeleteSingleHotel, DeleteAllHotelData };