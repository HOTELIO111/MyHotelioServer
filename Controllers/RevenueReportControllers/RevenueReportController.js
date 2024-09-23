const mongoose = require("mongoose");
const Booking = require("../../Model/booking/bookingModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");

const getRevenueReportByHotel = async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ error: "Invalid hotel ID" });
    }

    const revenueReport = await Booking.aggregate([
      {
        $match: {
          hotel: new mongoose.Types.ObjectId(hotelId),
        },
      },
      {
        $group: {
          _id: {
            hotel: "$hotel",
            bookingStatus: "$bookingStatus",
          },
          totalRevenue: { $sum: "$amount" },
          numberOfBookings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          hotel: "$_id.hotel",
          bookingStatus: "$_id.bookingStatus",
          totalRevenue: 1,
          numberOfBookings: 1,
        },
      },
    ]);

    if (revenueReport.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this hotel" });
    }

    res.status(200).json(revenueReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const getRevenueReportByHotelPartner = async (req, res) => {
  const { hotelPartnerId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(hotelPartnerId)) {
    return res.status(400).json({ error: "Invalid hotel partner ID" });
  }

  try {
    const revenueReport = await HotelModel.aggregate([
      {
        $match: {
          vendorId: new mongoose.Types.ObjectId(hotelPartnerId),
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "hotel",
          as: "bookings",
        },
      },
      {
        $unwind: "$bookings",
      },
      {
        $group: {
          _id: "$bookings.bookingStatus",
          totalRevenue: { $sum: "$bookings.amount" },
          numberOfBookings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          bookingStatus: "$_id",
          totalRevenue: 1,
          numberOfBookings: 1,
        },
      },
    ]);

    res.status(200).json(revenueReport);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRevenueReportByHotel, getRevenueReportByHotelPartner };
