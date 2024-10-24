const CustomerAuthModel = require("../../Model/CustomerModels/customerModel");

const addToWishlist = async (req, res) => {
  const { userId, hotelId } = req.body;
  try {
    const user = await CustomerAuthModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: true, msg: "User not found" });
    }
    if (!user.favourites.includes(hotelId)) {
      user.favourites.push(hotelId);
      await user.save();
      return res.status(200).json(user);
    }
    res.status(400).json({ error: false, msg: "Hotel already in wishlist" });
  } catch (error) {
    res.status(500).json({ error: true, msg: error.message });
  }
};

const removeFromWishlist = async (req, res) => {
  const { userId, hotelId } = req.body;
  try {
    const user = await CustomerAuthModel.findById(userId);

    if (!user) {
      return res.status(404).json({ error: true, msg: "User not found" });
    }
    user.favourites = user.favourites.filter(
      (fav) => fav.toString() !== hotelId
    );
    await user.save();

    res.status(200).json({ error: false, user });
  } catch (error) {
    res.status(500).json({ error: true, msg: error.message });
  }
};

module.exports = { addToWishlist, removeFromWishlist };
