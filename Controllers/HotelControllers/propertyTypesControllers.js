const PropertyTypes = require("../../Model/HotelModel/propertyTypesModel");

const AddPropertyType = async (req, res) => {
    const { name } = req.query;

    try {
        const isAdded = await new PropertyTypes({
            name
        }).save()
        if (!isAdded) return res.status(400).json({ error: true, message: "property type not added please try again " })
        res.status(200).json({ error: false, message: "success", data: isAdded })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


// Delete the property types 


const DeletePropertyTypes = async (req, res) => {
    const query = req.query;
    if (query.id) return res.status(401).json({ error: true, message: "please use the '_id' parameter instead of 'id' " })
    await PropertyTypes.deleteMany(query).then(() => {
        res.status(200).json({ error: false, message: "success" })
    }).catch((error) => {
        res.status(500).json({ error: true, message: error.message })
    })
}



// get all the property types 
const GetThePropertyTypes = async (req, res) => {
    const query = req.query;
    if (query.id) return res.status(401).json({ error: true, message: "please use the '_id' parameter instead of 'id' " })

    try {
        const data = await PropertyTypes.find(query)
        if (!data) return res.status(204).json({ error: false, message: "No data found with this id " })
        res.status(200).json({ error: false, message: "success", data: data })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}










module.exports = { AddPropertyType, DeletePropertyTypes, GetThePropertyTypes }