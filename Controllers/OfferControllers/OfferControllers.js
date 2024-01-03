const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const OfferModel = require("../../Model/offersModal/OffersModel");

const CreateOffer = async (req, res) => {
  try {
    const _already = await OfferModel.findOne({ code: req.body.code });
    if (_already)
      return res
        .status(409)
        .json({ error: true, message: "Aready This Offer Code is Registered" });
    const CreateOffer = await new OfferModel({
      ...req.body,
      code: req.body.code?.toUpperCase(),
    }).save();
    if (!CreateOffer)
      return res
        .status(400)
        .json({ error: true, message: "missing credentials" });
    res
      .status(200)
      .json({ error: false, message: "success", data: CreateOffer });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const UpdateOffer = async (req, res) => {
  const { id } = req.params;
  try {
    const _findCodeData = await OfferModel.findOne({
      code: req.body.code.toUpperCase(),
    });
    console.log(req.body.code.toUpperCase());
    if (_findCodeData._id !== id)
      return res.status(409).json({
        error: true,
        message: "Another Data is already exists with this Offer Code",
      });
    const response = await OfferModel.findByIdAndUpdate(
      id,
      { ...req.body, code: req.body.code.toUpperCase() },
      {
        new: true,
      }
    );
    if (!response)
      return res.status(400).json({
        error: true,
        message: "missing data or no data found with id",
      });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const DeleteOffers = async (req, res) => {
  const { id, code } = req.query;
  let _delete = {};
  if (id) {
    _delete._id = id;
  }
  if (code) {
    _delete.code = { $regex: code, $options: "i" };
  }

  try {
    const response = await OfferModel.deleteMany(_delete);
    if (response.deletedCount === 0)
      return res.status(400).json({
        error: true,
        message: `No data found to delete`,
      });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetAllOfferCode = async (req, res) => {
  const { id, code } = req.query;
  let _find = {};
  if (id) {
    _find._id = id;
  }
  if (code) {
    _find.code = { $regex: code, $options: "i" };
  }
  try {
    const response = await OfferModel.find(_find);
    if (!response)
      return res.status(400).json({
        error: true,
        message: `No data found with ${_find._id} or ${_find.code}`,
      });
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetHotelOffers = async (req, res) => {
  const { hotelid, roomid, validFor } = req.query;
  try {
    const _hoteldata = await HotelModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(hotelid) } },
      {
        $project: {
          room: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: "$rooms",
                      as: "room",
                      cond: {
                        $eq: [
                          "$$room._id",
                          new mongoose.Types.ObjectId(roomid),
                        ],
                      },
                    },
                  },
                  as: "roomdata",
                  in: "$$roomdata.price",
                },
              },
              0,
            ],
          },
        },
      },
    ]);
    const RoomPrice = _hoteldata[0]?.room;
    const date = new Date();
    const _offers = await OfferModel.aggregate([
      {
        $match: {
          "validation.upto": { $gte: date },
          "validation.validFor": validFor,
          "validation.minTransactions": { $lte: RoomPrice },
        },
      },
      {
        $addFields: {
          discount: {
            $cond: {
              if: { $ne: ["$codeDiscount.percentage", 0] },
              then: {
                $multiply: [
                  { $divide: ["$codeDiscount.percentage", 100] },
                  RoomPrice,
                ],
              },
              else: "$codeDiscount.amount",
            },
          },
        },
      },
      { $sort: { discount: -1 } },
    ]);

    if (!_offers)
      return res.status(404).json({
        error: true,
        message: "no offers availiable for this hotel or room",
      });
    res.status(200).json({
      error: false,
      message: "success",
      data: _offers,
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  CreateOffer,
  UpdateOffer,
  DeleteOffers,
  GetAllOfferCode,
  GetHotelOffers,
};
