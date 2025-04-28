const Sunbed = require('../models/Sunbed');
const Restaurant = require('../models/Restaurant');

const addSunbed = async (req, res) => {
  try {
    const { price, type, number, disabled, disappear, latitude, longitude } = req.body;
    const { restaurantId, floorplanId } = req.body;

    // Create the sunbed with coordinates
    const sunbed = new Sunbed({
      price,
      type,
      number,
      disabled,
      disappear,
      latitude,
      longitude
    });
    await sunbed.save();

    // Add sunbed to the floorplan's sunbeds array
    const restaurant = await Restaurant.findById(restaurantId).populate('floorplans');
    const floorplan = restaurant.floorplans.id(floorplanId);
    if (!floorplan) {
      return res.status(404).json({ message: 'Floorplan not found' });
    }
    floorplan.sunbeds.push(sunbed._id);
    await restaurant.save();

    // Optionally, populate sunbeds for response
    await floorplan.populate('sunbeds');

    res.status(201).json(restaurant);
  } catch (error) {
    console.error('Error adding sunbed:', error);
    res.status(500).json({ message: 'Failed to add sunbed', error });
  }
};

module.exports = { addSunbed };