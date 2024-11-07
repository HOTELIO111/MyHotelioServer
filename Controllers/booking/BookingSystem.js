const { default: mongoose } = require("mongoose");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const Booking = require("../../Model/booking/bookingModel");
const cron = require("node-cron");
const {
  CreateThePaymentInfo,
} = require("../../helper/Payments/payementFuctions");
const { BookingQue, CancelWithOutPayment, RefundQueue } = require("../../jobs");
const bookingIdGenerate = require("./bookingIdGenerator");
const ManageCancellationsWithPolicy = require("../../helper/booking/CancellationsPolicy");
const RefundModel = require("../../Model/booking/RefundModel");
const smsService = require("../notifications/sms/smsService");

class BookingSystem {
  constructor() {}

  async GetBookingInfoOfRoom(roomid, checkIn, checkOut) {
    try {
      let response = await Booking.aggregate([
        {
          $match: {
            room: roomid,
            bookingStatus: { $in: ["confirmed", "pending"] },
            $or: [
              {
                "bookingDate.checkIn": {
                  $gte: new Date(checkIn),
                  $lte: new Date(checkOut),
                },
              },
              {
                "bookingDate.checkOut": {
                  $gte: new Date(checkIn),
                  $lte: new Date(checkOut),
                },
              },
              {
                $and: [
                  { "bookingDate.checkIn": { $lte: new Date(checkIn) } },
                  { "bookingDate.checkOut": { $gte: new Date(checkOut) } },
                ],
              },
            ],
          },
        },
        {
          $group: {
            _id: "$room",
            totalRoomsBooked: { $sum: "$numberOfRooms" },
          },
        },
      ]);
      if (response.length === 0) {
        response = [{ totalRoomsBooked: 0 }];
      }

      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async GetSingleRoomCountAnalytics(roomid, checkIn, checkOut) {
    try {
      // const response = await HotelModel.find({ "rooms._id": roomid });
      const response = await HotelModel.aggregate([
        { $match: { "rooms._id": new mongoose.Types.ObjectId(roomid) } },
        {
          $lookup: {
            from: "room-configs",
            localField: "rooms._id",
            foreignField: "roomid",
            pipeline: [
              {
                $match: {
                  roomid: new mongoose.Types.ObjectId(roomid),
                  $or: [
                    {
                      $and: [
                        { from: { $gte: new Date(checkIn) } },
                        { from: { $lte: new Date(checkOut) } },
                      ],
                    },
                    {
                      $and: [
                        { to: { $gte: new Date(checkIn) } },
                        { to: { $lte: new Date(checkOut) } },
                      ],
                    },
                  ],
                },
              },
              {
                $group: {
                  _id: "$will",
                  roomid: { $first: "$roomid" },
                  totalRooms: { $sum: "$rooms" },
                },
              },
            ],
            as: "roomconfig",
          },
        },
        {
          $addFields: {
            totalRooms: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$rooms",
                    as: "room",
                    cond: {
                      $eq: ["$$room._id", new mongoose.Types.ObjectId(roomid)],
                    },
                  },
                },
                0,
              ],
            },
          },
        },
        {
          $project: {
            TotalRooms: "$totalRooms.counts",
            decreasedRoom: {
              $let: {
                vars: {
                  filteredRoom: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$roomconfig",
                          as: "roominfo",
                          cond: { $eq: ["$$roominfo._id", "dec"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$filteredRoom.totalRooms",
              },
            },
            increasedRoom: {
              $let: {
                vars: {
                  filteredRoom: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$roomconfig",
                          as: "roominfo",
                          cond: { $eq: ["$$roominfo._id", "inc"] },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: "$$filteredRoom.totalRooms",
              },
            },
          },
        },
      ]);

      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async GetRoomAvailiability(roomid, from, to) {
    try {
      const [RoomBookings, ALlRooms] = await Promise.all([
        this.GetBookingInfoOfRoom(roomid, from, to),
        this.GetSingleRoomCountAnalytics(roomid, from, to),
      ]);
      const resultData = { ...ALlRooms.data[0], ...RoomBookings.data[0] };
      const roomCount = await this.CalculateRoomCount(resultData);
      return { error: false, message: "success", data: roomCount };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async CalculateRoomCount(data) {
    const TotalRooms = data?.TotalRooms;
    const decreasedRoom = data?.decreasedRoom;
    const increasedRoom = data?.increasedRoom;
    const totalRoomsBooked = data?.totalRoomsBooked;

    let totalCount = TotalRooms;
    if (decreasedRoom) {
      totalCount = totalCount - decreasedRoom;
    }
    if (increasedRoom) {
      totalCount = totalCount + increasedRoom;
    }
    if (totalRoomsBooked) {
      totalCount = totalCount - totalRoomsBooked;
    }
    return totalCount;
  }

  async UpdateCustomer(customerid, updateFields, options = {}) {
    try {
      const id = customerid ? { _id: customerid } : {};
      const updatedCustomer = await CustomerAuthModel.updateMany(
        id,
        updateFields,
        {
          new: true,
          ...options,
        }
      );
      return { error: false, message: "success", data: updatedCustomer };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async UpdateHotel(hotelid, updateFields, options = {}) {
    try {
      const id = hotelid ? { _id: hotelid } : {};
      const updatedCustomer = await HotelModel.updateMany(id, updateFields, {
        new: true,
        ...options,
      });
      return { error: false, message: "success", data: updatedCustomer };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async CreatePreBooking(formdata) {
    try {
      this.bookingId = await bookingIdGenerate();
      const created = await new Booking({
        ...formdata,
        bookingId: this.bookingId,
        bookingStatus: "pending",
        cancellationDueDate:
          new Date(formdata.bookingDate.checkIn).getTime() -
          24 * 60 * 60 * 1000,
        additionalCharges: {
          gst: formdata.amount * (formdata.amount < 2500 ? 0.12 : 0.18),
          serviceFee: 250,
        },
      }).save();
      if (!created) return { error: true, message: "missing required data" };

      const updateCustoemr = await this.UpdateCustomer(created.customer, {
        $push: { bookings: created._id },
      });

      if (!updateCustoemr) {
        created.remove();
        return { error: true, message: "failed to create booking try again" };
      }
      // add the 10 min timer to cancelBooking
      cron.schedule(`*/15 * * * *`, async () => {
        await this.handleCancelWithoutPayment({ bookingId: this.bookingId });
      });

      return { error: false, message: "success", data: created };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async GetbookingData(bookingId) {
    if (!bookingId) {
      return {
        error: true,
        message: "booking id is required to get thhe Booking Data",
      };
    }
    try {
      const response = await Booking.findOne({
        bookingId: bookingId,
      });
      if (!response)
        return { error: true, message: "no data found with this booking id " };
      this.bookingData = response;
      return { error: false, message: "success", data: this.bookingdata };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async FinalizeBooking(formdata, paymentType) {
    if (!this.bookingData) {
      await this.GetbookingData(formdata.order_id);
    }
    try {
      if (formdata.paymentStatus === "Success") {
        this.NotificationHandler("paymentConfirmation");
      }
      // store the payment
      const paymentReg = await CreateThePaymentInfo(formdata);
      // add the booking in Booking Que for other Steps
      await BookingQue.add(
        `Handle Payment for Booking No ${formdata.order_id}`,
        {
          ...formdata,
          paymentType,
        }
      );
      // deducting 100rs from customer wallet ammount
      await this.UpdateCustomer(this.bookingData.customer, {
        $inc: { "wallet.amount": -100 },
      });
      // const paymentReg = formData;
      if (paymentReg.order_status === "Success") {
        return {
          error: false,
          message:
            "Success: Payment received. Booking sent to the hotel for confirmation.",
        };
      } else {
        return {
          error: true,
          data: paymentReg,
          message:
            "Payment Response indicates failure. Please wait for redirection or contact support.",
        };
      }
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async DeleteBooking() {
    try {
      const _deleteBooking = await Booking.deleteMany({});
      if (_deleteBooking.acknowledged === 0)
        return { error: true, message: "no data found to delete" };
      // update in hotel and customer
      const [customer, hotel] = await Promise.all([
        this.UpdateCustomer(null, { $set: { bookings: [] } }),
        this.UpdateHotel(null, { $set: { bookings: [] } }),
      ]);
      if (!customer && !hotel)
        return {
          error: true,
          message: "failed to update in customer and hotel the deleted data",
        };
      return { error: false, message: "success deleted successfully" };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async DeleteBookingById(id) {
    if (!this.bookingData) {
      await this.GetbookingData(id);
    }
    try {
      const _deleteByid = await Booking.findByIdAndDelete(this.bookingData._id);
      if (!_deleteByid)
        return { error: true, message: "no data found with this id" };
      const [hotel, customer] = await Promise.all([
        this.UpdateHotel(this.bookingData.hotel, {
          $pull: { bookings: this.bookingData._id },
        }),
        this.UpdateCustomer(this.bookingData.customer, {
          $pull: { bookings: this.bookingData._id },
        }),
      ]);
      if (!hotel && !customer)
        return {
          error: true,
          message:
            "failed to modify customer and hotel as per booking canceled ",
        };
      return { error: false, message: "success deleted", data: _deleteByid };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async CancelWithOutPayment() {}

  //   =========================== Finalize in Que =====================
  async QueueBookingHandler(data) {
    try {
      if (!this.bookingData) {
        await this.GetbookingData(data.data.order_id);
      }

      this.paymentData = data?.data;
      this.paymentType = this.paymentData?.paymentType;
      let response;
      if (this.paymentType === "pay-at-hotel") {
        response = await this.BookingPayAtHotel();
      } else {
        if (this.paymentData.order_status === "Success") {
          response = await this.BookingConfirm();
        } else {
          response = await this.BookingFailed();
        }
      }
      if (response.error) return response;
      return { error: false, message: "success " };
    } catch (error) {
      console.error("Error in QueueBookingHandler:", error.message);
      return { error: true, message: error.message };
    }
  }

  async BookingConfirm() {
    const amount = parseInt(this.bookingData.amount);
    try {
      const [updatedHotel, updatedBooking] = await Promise.all([
        this.UpdateHotel(this.bookingData.hotel, {
          $push: { bookings: this.bookingData._id },
        }),
        Booking.findByIdAndUpdate(this.bookingData._id, {
          bookingStatus: "confirmed",
          "payment.paymentType": this.paymentData?.paymentType,
          "payment.totalamount": amount,
          "payment.paidamount": this.paymentData?.amount,
          "payment.balanceAmt": amount - this.paymentData?.amount,
        }),
      ]);
      // now send the notification
      this.NotificationHandler("bookingConfirmation");
      return {
        error: false,
        message: "success",
        data: { hotelData: updatedHotel, booking: updatedBooking },
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async BookingFailed() {
    try {
      const findBookingAndUpdate = await Booking.findOneAndUpdate(
        {
          bookingId: this.paymentData?.order_id,
        },
        {
          bookingStatus: "failed",
          "payment.paymentType": this.paymentData?.paymentType,
          "payment.totalamount": this.bookingData?.amount,
          "payment.paidamount": this.paymentData?.amount,
          "payment.balanceAmt":
            this.bookingData?.amount - this.paymentData?.amount,
        }
      );
      // now send the notification
      this.NotificationHandler("bookingFailed");
      return { error: false, booking: findBookingAndUpdate };
    } catch (error) {
      console.error("Error updating booking confirmation:", error.message);
      return { error: true, message: error.message };
    }
  }

  async BookingPayAtHotel() {
    try {
      const findTheBookingAndUpdate = await Booking.findOneAndUpdate(
        {
          bookingId: this.paymentData?.order_id,
        },
        {
          bookingStatus: "confirmed",
          payment: {
            paymentType: "pay-at-hotel",
            totalamount: this.bookingData.totalAmount,
            paidamount: 0,
            balanceAmt: this.bookingData.totalAmount,
          },
        }
      );
      const response = await this.UpdateHotel(this.bookingData.hotel, {
        $push: { bookings: this.bookingData._id },
      });
      if (response.error) return { error: true, message: response.message };
      // now send the notification
      this.NotificationHandler("bookingConfirmation");
      return { error: false, booking: findTheBookingAndUpdate };
    } catch (error) {
      console.error("Error updating booking confirmation:", error.message);
      return { error: true, message: error.message };
    }
  }

  async PayAtHotelBooking(formData, paymentType) {
    if (!this.bookingData) {
      await this.GetbookingData(formData.order_id);
    }
    try {
      this.paymentType = paymentType;
      this.paymentData = formData;

      await BookingQue.add(
        `Handle Payment For Booking No ${this.paymentData?.order_id}`,
        {
          ...this.paymentData,
          paymentType: this.paymentType,
        }
      );
      return { error: false, message: "success" };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async NotificationHandler(type) {
    switch (type) {
      case "paymentConfirmation":
        return smsService.sendPaymentConfirmationSMS({
          bookingId: this.bookingData.bookingId,
          amount: this.bookingData.totalAmount,
          customerMobileNumber: this.bookingData.guest.mobileNo,
        });

      case "bookingConfirmation":
        let checkIn = new Date(this.bookingData.bookingDate.checkIn);
        let checkOut = new Date(this.bookingData.bookingDate.checkOut);
        smsService.sendBookingConfirmationSMS({
          customerName: this.bookingData.guest.name,
          hotelName: "Hotel Name",
          checkIn: `${checkIn.getDate()}/${
            checkIn.getMonth() + 1
          }/${checkIn.getFullYear()}`,
          checkOut: `${checkOut.getDate()}/${
            checkOut.getMonth() + 1
          }/${checkOut.getFullYear()}`,
          roomType: "Room Type",
          bookingId: this.bookingData.bookingId,
          customerMobileNumber: this.bookingData.guest.mobileNo,
        });
        // send the checkIn reminder sms 1 day before the checkIn
        cron.schedule(`0 12 ${checkIn.getDate() - 1} * *`, async () => {
          smsService.sendCheckInReminderSMS({
            hotelName: "Hotel Name",
            checkIn: `${checkIn.getDate()}/${
              checkIn.getMonth() + 1
            }/${checkIn.getFullYear()}`,
            bookingId: this.bookingData.bookingId,
            customerMobileNumber: this.bookingData.guest.mobileNo,
          });
        });

        // send the checkOut reminder sms 1 day before the checkOut
        cron.schedule(`0 12 ${checkOut.getDate() - 1} * *`, async () => {
          smsService.sendCheckOutReminderSMS({
            hotelName: "Hotel Name",
            checkOut: `${checkOut.getDate()}/${
              checkOut.getMonth() + 1
            }/${checkOut.getFullYear()}`,
            bookingId: this.bookingData.bookingId,
            customerMobileNumber: this.bookingData.guest.mobileNo,
          });
        });
        return;

      case "cancelationConfirmation":
        smsService.sendCancellationConfirmationSMS({
          bookingId: this.bookingData.bookingId,
          customerMobileNumber: this.bookingData.guest.mobileNo,
        });
        return;

      default:
        break;
    }
  }

  async handleCancelWithoutPayment(data) {
    if (!this.bookingData) {
      await this.GetbookingData(data.bookingId);
    }
    this.bookingId = data.bookingId;
    try {
      let response;
      if (this.bookingData.bookingStatus === "pending") {
        response = await Booking.findOneAndUpdate(
          {
            bookingId: this.bookingId,
          },
          {
            bookingStatus: "expired",
          },
          {
            new: true,
          }
        );
      }
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async ManageCanellationsAndProceed(bookingId, id, formdata) {
    if (!this.bookingData) {
      await this.GetbookingData(bookingId);
    }
    try {
      const policy = await ManageCancellationsWithPolicy(bookingId);
      let _updated;
      if (policy.amountRefund === 0) {
        _updated = await this.UpdateTheCancellations({
          bookingId: bookingId,
          bookingStatus: "canceled",
          requestedById: id,
          reason: formdata.reason,
          notes: "Booking Canceled successfully ",
          refundAmt: policy?.amountRefund,
          refundStatus: "success",
        });
      } else {
        _updated = await this.UpdateTheCancellations({
          bookingId: bookingId,
          bookingStatus: "canceled",
          requestedById: id,
          reason: formdata.reason,
          notes:
            "Booking canceled successfully , we processing you refund it will take 5-7 business days",
          refundAmt: policy?.amountRefund,
          refundStatus: "pending",
        });

        // Added the data in the queue to do the refund process
        await RefundQueue.add(
          `Handle The Cancellations refund of ${bookingId}`,
          {
            ..._updated,
          }
        );
      }
      if (_updated.error)
        return { error: true, message: "failed to updated cancellations" };
      this.NotificationHandler("cancellationConfirmation");
      return { error: false, message: "success", data: _updated };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async UpdateTheCancellations({
    bookingId,
    bookingStatus,
    cancledStatus,
    requestedById,
    reason,
    notes,
    refundAmt,
    refundStatus,
  }) {
    try {
      const _update = await Booking.findOneAndUpdate(
        {
          bookingId: bookingId,
        },
        {
          bookingStatus: bookingStatus,
          "cancellation.status": cancledStatus,
          "cancellation.requestedBy": requestedById,
          "cancellation.requestedDate": new Date(),
          "cancellation.reason": reason,
          "cancellation.notes": notes,
          "cancellation.refundAmount": refundAmt,
          "cancellation.refundStatus": refundStatus,
        },
        { new: true }
      );

      return { error: false, message: "success", data: _update };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async RegisterRefund({
    totalAmount,
    refundedAmount,
    dateOfCancellation,
    deductionPercentage,
    cancellationReason,
    cancelledBy,
    notes,
    status,
    refundMethod,
    paymentDetails,
    bookingId,
  }) {
    try {
      const response = await new RefundModel({
        totalAmount: totalAmount,
        refundedAmount: refundedAmount,
        dateOfCancellation: dateOfCancellation,
        deductionPercentage,
        cancellationReason,
        cancelledBy,
        notes,
        status,
        refundMethod,
        paymentDetails,
      }).save();

      if (!response)
        return { error: true, message: "error to making record of Refunds" };

      await Booking.findOneAndUpdate(
        { bookingId: bookingId },
        { $push: { refunds: response._di } },
        { new: true }
      );
      return { error: false, message: "success", data: response };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

module.exports = BookingSystem;
