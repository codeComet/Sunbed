const mongoose = require('mongoose');
const { Schema } = mongoose;



const restaurantSchema = new Schema({
    city: { type: String, required: true },
    deadline: { type: String, required: true },
    floorplans: [{ type: Schema.Types.ObjectId, ref: 'Floorplan'}],
    images: [String], 
    img: { type: String, required: true },
    location: {
        lat: { type: String, required: true },
        lng: { type: String, required: true }
    },
    name: { type: String, required: true },
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
