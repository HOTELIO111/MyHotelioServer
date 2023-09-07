



// Get ALl the customer

const CustomerAuthModel = require("../../Model/CustomerModels/customerModel")

const GetallCustomer = async () => {
    const allcustomer = await CustomerAuthModel.find({})
    return (allcustomer)
}


const DeleteTheCustomer = async (id) => {
    try {
        await CustomerAuthModel.findByIdAndDelete(id);
        return { error: false, message: "Deleted successfully" };
    } catch (error) {
        return { error: true, message: error.message };
    }
};



module.exports = { DeleteTheCustomer, GetallCustomer }