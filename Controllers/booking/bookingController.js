const { CreateBooking } = require("../../helper/booking/bookingHelper");

const RegisterBooking = async (req, res) => {
  const formData = req.body;

  try {
    const booknow = await CreateBooking(formData);
    if (booknow.error === true) return res.status(400).json(booknow);
    res.status(200).json(booknow);
  } catch (error) {
    res.status(500).json({ errro: true, message: error.message });
  }
};

module.exports = { RegisterBooking };
