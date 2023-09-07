const CustomerAuthModel = require("../../Model/CustomerModels/customerModel")
const { DeleteTheCustomer } = require("../../helper/customers/customer_helper")


const GetallCustomer = async (req, res) => {
    try {
        const allcustomer = await CustomerAuthModel.find({})
        if (!allcustomer) return res.status(404).json({ error: true, message: "no user found" })

        res.status(200).json({ error: false, message: "success", data: allcustomer })
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}


const DeleteCustomerById = async (req, res) => {
    const { id } = req.params;

    try {
        const response = await DeleteTheCustomer(id)
        if (response.error) return res.status(400).json(response)

        res.status(200).json(response)
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
}



module.exports = { GetallCustomer, DeleteCustomerById }