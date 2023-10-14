const BookingID = require("../../Model/booking/bookingId");

const bookingIdGenerate = async () => {
  let SeqData;
  SeqData = await BookingID.findOneAndUpdate(
    {},
    { $inc: { seq: 1 } },
    { new: true }
  );

  if (!SeqData) {
    SeqData = await new EmpID({
      id: "HT",
      seq: 1,
    }).save();
  }
  SeqData.seq++;
  return `HT${SeqData.seq.toString().padStart(7, "0")}`;
};

module.exports = bookingIdGenerate;
