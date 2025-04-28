// models/Sunbed.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const sunbedSchema = new Schema({
    dates: [Object],
    disabled: { type: String, required: true },
    disappear: { type: String, required: true },
    number: { type: String, required: true },
    price: { type: String, required: true },
    type: { type: String, required: true },
    latitude: { type: Number }, 
    longitude: { type: Number },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" }
});

const Sunbed = mongoose.model('Sunbed', sunbedSchema);

module.exports = Sunbed;
