const { default: mongoose } = require("mongoose");
const BankDetailsModel = require("../../Model/HotelModel/BankDetails");
const VendorModel = require("../../Model/HotelModel/vendorModel");

const CreateBankDetails = async (vendorid, formdata) => {
  try {
    const response = await new BankDetailsModel(formdata).save();
    if (!response) return { error: true, message: response };
    // update Bank details id in the vendor schema
    await VendorModel.findByIdAndUpdate(
      vendorid,
      {
        bankDetails: response._id,
      },
      {
        new: true,
      }
    );
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const UpdateBankDetails = async (id, formdata) => {
  try {
    const response = await BankDetailsModel.findByIdAndUpdate(id, formdata, {
      new: true,
    });
    if (!response) return { error: true, message: `error message ${response}` };
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const DeleteBankDetails = async (vendorid, id) => {
  try {
    // Check if the provided id is valid
    if (!id) {
      return { error: true, message: "Invalid bank details ID" };
    }

    // Delete bank details document
    const deletedBankDetails = await BankDetailsModel.findByIdAndDelete(id);

    // Check if bank details document was found and deleted
    if (!deletedBankDetails) {
      return {
        error: true,
        message: "Bank details not found or already deleted",
      };
    }

    // Update vendor with null bankDetails
    const updatedVendor = await VendorModel.findByIdAndUpdate(
      vendorid,
      { bankDetails: null },
      { new: true }
    );

    // Check if vendor document was found and updated
    if (!updatedVendor) {
      return { error: true, message: "Vendor not found" };
    }

    return { error: false, message: "Success", data: deletedBankDetails };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

const GetAllBankDetails = async (id) => {
  try {
    let _find = {};
    if (id) {
      _find = { _id: new mongoose.Types.ObjectId(id) };
    }
    const response = await BankDetailsModel.find(_find);
    return { error: false, message: "success", data: response };
  } catch (error) {
    return { error: true, message: error.message };
  }
};

module.exports = {
  CreateBankDetails,
  UpdateBankDetails,
  DeleteBankDetails,
  GetAllBankDetails,
};
