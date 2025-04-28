const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  sunbedId: { type: mongoose.Schema.Types.ObjectId, required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  payment: { type: String, required: true },
  randomId: { type: String, required: true },
  sunbedRandomId: { type: String, required: true },
  isAdmin: { type: Boolean, required: true },
  isManager: { type: Boolean, required: true },
  isClosed: { type: Boolean, required: true }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
