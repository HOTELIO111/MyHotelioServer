const VendorModel = require("../../Model/HotelModel/vendorModel");
const {
  CreateBankDetails,
  UpdateBankDetails,
  DeleteBankDetails,
} = require("../../helper/vendor/bankDetails");

const AddPartnerBankDetials = async (req, res) => {
  const { vendorid } = req.params;
  const data = req.body;
  try {
    const response = await CreateBankDetails(vendorid, data);
    if (response.error) return res.status(400).json(response);
    res
      .status(200)
      .json({ error: false, message: response.message, data: response.data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdatePartnerBankDetails = async (req, res) => {
  const { id } = req.params;
  const formdata = req.body;
  try {
    const response = await UpdateBankDetails(id, formdata);
    if (response.error) return res.status(400).json(response);
    res
      .status(200)
      .json({ error: false, message: response.message, data: response.data });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeletePartnerBankDetails = async (req, res) => {
  const { vendorid, id } = req.params;
  try {
    const response = await DeleteBankDetails(vendorid, id);
    if (response.error) return res.status(400).json(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetPartnerBankDetails = async (req, res) => {
  const { vendorid } = req.params;
  try {
    const [vendor, admin] = await Promise.all([VendorModel.findById(vendorid) , ]);
  } catch (error) {}
};

module.exports = {
  AddPartnerBankDetials,
  UpdatePartnerBankDetails,
  DeletePartnerBankDetails,
};
