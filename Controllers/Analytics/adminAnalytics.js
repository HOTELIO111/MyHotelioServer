const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const VendorModel = require("../../Model/HotelModel/vendorModel");
const Booking = require("../../Model/booking/bookingModel");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const AdminModel = require("../../Model/AdminModel/adminModel");
const AgentModel = require("../../Model/AgentModel/agentModel");

const FindHotelsAddedByCount = async (req, res) => {
  try {
    const response = await HotelModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "$isAddedBy",
          count: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const AdminHotelInfo = async (req, res) => {
  try {
    const response = await HotelModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "hotelAnalytics",
          totalHotels: { $sum: 1 },
          totalApprovedHotels: {
            $sum: {
              $cond: {
                if: { $eq: ["$isAdminApproved", true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalInactiveHotel: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", false] },
                then: 1,
                else: 0,
              },
            },
          },
          totalActiveHotel: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", true] },
                then: 1,
                else: 0,
              },
            },
          },
          totalApprovedAndActive: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$status", true] },
                    { $eq: ["$isAdminApproved", true] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
          totalUnApprovedHotel: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ["$status", false] },
                    { $eq: ["$isAdminApproved", false] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalHotels: "$totalHotels",
          totalApprovedHotels: "$totalApprovedHotels",
          totalInactiveHotel: "$totalInactiveHotel",
          totalActiveHotel: "$totalActiveHotel",
          totalApprovedAndActive: "$totalApprovedAndActive",
          totalUnApprovedHotel: "$totalUnApprovedHotel",
        },
      },
    ]);

    res
      .status(200)
      .json({ error: false, message: "success", data: response[0] });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const BookingAnalyticsAdmin = async (req, res) => {
  try {
    const response = await Booking.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "$bookingStatus",
          total: { $sum: "$numberOfRooms" },
        },
      },
      // {
      //   $project: {
      //     _status: "$bookings",
      //     allBookings: { $sum: "$bookings.total" },
      //   },
      // },
    ]);

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const Last30DaysBookingsAdmin = async (req, res) => {
  try {
    const response = await Booking.aggregate([
      { $match: {} },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            bookingStatus: "$bookingStatus",
          },
          totalRooms: { $sum: "$numberOfRooms" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalBooking: {
            $push: {
              bookingStatus: "$_id.bookingStatus",
              totalRooms: "$totalRooms",
            },
          },
          totalRooms: { $sum: "$totalRooms" },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    // const response = await VendorModel.aggregate([

    //   { $match: {} },
    //   {
    //     $lookup: {
    //       from: "bookings",
    //       localField: "hotels",
    //       foreignField: "hotel",
    //       pipeline: [
    //         {
    //           $group: {
    //             _id: {
    //               date: {
    //                 $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
    //               },
    //               bookingStatus: "$bookingStatus",
    //             },
    //             totalRooms: { $sum: "$numberOfRooms" },
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: "$_id.date",
    //             totalBooking: {
    //               $push: {
    //                 bookingStatus: "$_id.bookingStatus",
    //                 totalRooms: "$totalRooms",
    //               },
    //             },
    //             totalRooms: { $sum: "$totalRooms" },
    //           },
    //         },
    //         { $sort: { _id: -1 } },
    //       ],
    //       as: "bookings",
    //     },
    //   },
    // ]);

    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetUsersAndBookingInfo = async (req, res) => {
  try {
    const [customer, vendor, agents, bookings] = await Promise.all([
      CustomerAuthModel.find({}),
      VendorModel.find({}),
      AgentModel.find({}),
      Booking.find({ bookingStatus: ["confirmed", "pending"] }),
    ]);
    res.status(200).json({
      error: false,
      message: "success",
      data: {
        customer: customer.length,
        agents: agents.length,
        vendor: vendor.length,
        bookings: bookings.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetDashboardHotelAndBookingInfo = async (req, res) => {
  try {
    const response = await HotelModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "totals",
          hotels: { $sum: 1 },
          rooms: { $sum: { $sum: "$rooms.counts" } },
          newlyAddedHotels: {
            $sum: {
              $cond: {
                if: {
                  $gte: ["$createdAt", { $subtract: [new Date(), 604800000] }], // 604800000 milliseconds = 7 days
                },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({ error: true, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

const GetPartnersInfoStats = async (req, res) => {
  try {
    const response = await VendorModel.aggregate([
      { $match: {} },
      {
        $group: {
          _id: "partners",
          partner: { $sum: 1 },
          activePartners: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", true] },
                then: 1,
                else: 0,
              },
            },
          },
          inActivePartners: {
            $sum: {
              $cond: {
                if: { $eq: ["$status", false] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({ error: false, message: "success", data: response });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  FindHotelsAddedByCount,
  AdminHotelInfo,
  BookingAnalyticsAdmin,
  Last30DaysBookingsAdmin,
  GetUsersAndBookingInfo,
  GetDashboardHotelAndBookingInfo,
  GetPartnersInfoStats,
};
