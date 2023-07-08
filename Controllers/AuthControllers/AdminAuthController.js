const AdminModel = require("../../Model/AdminModel/AdminModel");

const router = require("express").Router();


const GetAddTheAdmin = async (req, res) => {
    const formdata = req.body;
    // check if the admin is registered 
    const isAdmin = await AdminModel.find({})
    if (isAdmin) return res.status(409).json({ error: true, message: "Admin Is Already Registerd" })

    try {
        const result = await new AdminModel(formdata).save()
        if (!result) return res.status(400).json({ error: true, message: "Not Registered" })

        res.status(200).json({ error: false, data: result })
    } catch (error) {
        res.status(500).json(error)
    }
}


