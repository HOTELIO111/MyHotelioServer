const { default: mongoose } = require("mongoose");
const HotelModel = require("../../Model/HotelModel/hotelModel");
const OfferModel = require("../../Model/offersModal/OffersModel");
const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");

class BillingSystem {
  constructor(checkIn, checkOut, totalRooms, totalGuest, customer, agent) {
    this.checkin = new Date(checkIn);
    this.checkout = new Date(checkOut);
    this.totalRooms = totalRooms;
    this.totalGuest = totalGuest;
    this.singleRoomPrice = null;
    this.serviceCharge = 250;
    this.customerid = customer;
    this.offerCode = "";
    this.agentId = agent;
    this.todaysDate = new Date();
    this.offerData = null;
    this.totalDays = function () {
      const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
      const checkinTime = this.checkin.getTime();
      const checkoutTime = this.checkout.getTime();
      const differenceDays = Math.round(
        Math.abs((checkoutTime - checkinTime) / oneDay)
      );
      return differenceDays;
    };
    this.totalRoomAmount = function () {
      const totalAmount =
        this.singleRoomPrice * this.totalRooms * this.totalDays();
      return totalAmount;
    };
    this.validFor = customer ? "customer" : "agent";
    this.discountAmount = function () {
      let amount = 0;
      if (this.offerData.amount !== 0) {
        amount = Math.ceil(this.offerData.amount);
      }
      if (this.offerData.percentage !== 0) {
        amount =
          amount +
          Math.ceil((this.totalRoomAmount() * this.offerData.percentage) / 100);
      }
      return amount;
    };
    this.gstCharge = function () {
      let charge;
      if (this.totalRoomAmount() > 7500) {
        charge = 18;
      } else {
        charge = 12;
      }
      return charge;
    };
    this.gstAmount = function () {
      const gstAmount = Math.ceil(
        (this.totalRoomAmount() * this.gstCharge()) / 100
      );
      return gstAmount;
    };
    this.customerwallet = 0;
  }

  async GetRoomInfoAndOffer(roomid, OfferId) {
    try {
      const response = await HotelModel.aggregate([
        {
          $match: {
            "rooms._id": new mongoose.Types.ObjectId(roomid),
          },
        },
        {
          $addFields: {
            RoomInfo: {
              $filter: {
                input: "$rooms",
                as: "singleRoom",
                cond: {
                  $eq: [
                    "$$singleRoom._id",
                    new mongoose.Types.ObjectId(roomid),
                  ],
                },
              },
            },
          },
        },
        { $unwind: "$RoomInfo" },
        {
          $project: {
            RoomInfo: 1,
            price: "$RoomInfo.price",
          },
        },
        {
          $lookup: {
            from: "offers",
            pipeline: [
              {
                $match: {
                  _id: new mongoose.Types.ObjectId(OfferId),
                  "validation.upto": { $gte: this.todaysDate },
                },
              },
              {
                $addFields: {
                  discount: "$codeDiscount",
                },
              },
              {
                $project: {
                  discount: 1,
                  code: 1,
                },
              },
            ],
            as: "offerDiscount",
          },
        },
        // { $unwind: "$offerDiscount" },
        {
          $addFields: {
            codeDiscount: {
              $cond: {
                if: {
                  $gt: [
                    { $size: { $ifNull: ["$offerDiscount.discount", []] } },
                    0,
                  ],
                },
                then: { $arrayElemAt: ["$offerDiscount.discount", 0] },
                else: { amount: 0, percentage: 0 },
              },
            },
            OfferCode: {
              $cond: {
                if: {
                  $gt: [{ $size: { $ifNull: ["$offerDiscount.code", []] } }, 0],
                },
                then: { $arrayElemAt: ["$offerDiscount.code", 0] },
                else: "",
              },
            },
          },
        },
        {
          $project: {
            RoomInfo: 1,
            codeDiscount: "$codeDiscount",
            OfferCode: 1,
          },
        },
      ]);
      this.singleRoomPrice = response[0].RoomInfo.price;
      this.offerData = response[0].codeDiscount;
      this.offerCode = response[0].OfferCode;
      return {
        error: false,
        data: response,
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async customerWalletManage(customerid) {
    try {
      const response = await CustomerAuthModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(customerid),
            "wallet.expire": { $gte: new Date() },
          },
        },
        {
          $addFields: {
            customerWallet: {
              $cond: {
                if: {
                  $gte: ["$wallet.amount", 0],
                  $gte: ["$wallet.amount", 100],
                },
                then: 100,
                else: "$wallet.amount",
              },
            },
          },
        },
        {
          $project: {
            customerWallet: 1,
          },
        },
      ]);
      this.customerwallet = response[0].customerWallet;
      return {
        error: false,
        message: "success",
        data: response,
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async Calculate() {
    try {
      const BasePrice = this.totalRoomAmount();
      const offerDiscount =
        this.offerCode !== "" && this.discountAmount !== 0
          ? { type: this.offerCode, amount: this.discountAmount() }
          : "No offer applied";
      const totalDiscount = [
        { type: "wallet", amount: this.customerwallet },
        offerDiscount,
      ];
      const discountedAmount = this.customerwallet + this.discountAmount();
      const priceAfterDiscount = this.totalRoomAmount() - discountedAmount;
      const taxAndServices = [
        { type: "Service Fee", amount: this.serviceCharge },
        {
          type: "Hotel GST",
          amount: this.gstAmount(),
          percentage: `${this.gstCharge()}%`,
        },
      ];
      const totalTaxAndServiceAmount = this.serviceCharge + this.gstAmount();
      const totalAmountToPay = priceAfterDiscount + totalTaxAndServiceAmount;
      return {
        error: false,
        data: {
          BasePrice,
          totalDiscount,
          discountedAmount,
          priceAfterDiscount,
          taxAndServices,
          totalTaxAndServiceAmount,
          totalAmountToPay,
        },
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}

module.exports = BillingSystem;
