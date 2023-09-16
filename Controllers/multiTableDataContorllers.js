const AmenityModel = require("../Model/HotelModel/amenitiesModel")
const FacilitiesModel = require("../Model/HotelModel/facilitymodels")
const PropertyTypes = require("../Model/HotelModel/propertyTypesModel")
const RoomsTypeModel = require("../Model/HotelModel/roomsTypeModel")




const GetTheHotelResource = async (req, res) => {
    try {
        const [amenities, roomType, facilities, propertyTypes] = await Promise.all([
            AmenityModel.find({}), RoomsTypeModel.find({}), FacilitiesModel.find({}), PropertyTypes.find({})
        ])

        res.status(200).json({ error: false, message: "success", data: { amenities, roomType, facilities, propertyTypes } })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}





module.exports = { GetTheHotelResource }