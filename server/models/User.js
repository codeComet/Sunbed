const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  restaurantId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  role: { type: String ,required: true},
  floorplanId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Floorplan' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
