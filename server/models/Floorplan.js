const mongoose = require('mongoose');
const { Schema } = mongoose;

const floorPlanSchema = new Schema({
    floorplancolumns: { type: String, default: "3" }, 
    floorplanrows: { type: String, default: "3" }, 
    sunbeds: [{ type: Schema.Types.ObjectId, ref: 'Sunbed' }] 
});

const Floorplan = mongoose.model('Floorplan', floorPlanSchema);

module.exports = Floorplan;
