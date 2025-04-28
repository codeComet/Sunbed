const Floorplan = require('../models/Floorplan');
const Restaurant = require('../models/Restaurant');
const Sunbed = require('../models/Sunbed');
const User = require('../models/User');
const Worker = require('../models/Worker');

async function createRestaurant(req, res) {
  const {restaurantData} = req.body;
  try {
    const newRestaurant = await Restaurant.create(restaurantData);
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error('Error creating restaurant:', err);
    res.status(400).json({ message: 'Failed to create restaurant' });
  }
}

async function getRestaurants(req, res) {
  try {
    const restaurants = await Restaurant.find().populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
  });
    res.json(restaurants);
  } catch (err) {
    console.error('Error getting restaurants:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateRestaurant(req, res) {
  const { id } = req.params;
  let {data,floorplanId} = req.body;
  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const floorplan = await Floorplan.findById(floorplanId);
    if (!floorplan) {
      return res.status(404).json({ message: 'Floorplan not found' });
    }
    
    const updatedfloorplan = await Floorplan.findByIdAndUpdate(floorplanId, data, { new: true });
    const updatedrestaurant = await Restaurant.findById(id).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
  });
    res.json(updatedrestaurant);
  } catch (err) {
    console.error('Error updating restaurant:', err);
    res.status(400).json({ message: 'Failed to update restaurant' });
  }
}


async function deleteRestaurant(req, res) {
  const { id } = req.params;
  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const deletedRestaurant = await Restaurant.findByIdAndDelete(id);
    res.json(deletedRestaurant);
  } catch (err) {
    console.error('Error deleting restaurant:', err);
    res.status(400).json({ message: 'Failed to delete restaurant' });
  }
}

async function getRestaurantById(req, res) {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
  });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (err) {
    console.error('Error getting restaurant by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}



async function addSunbed(req, res) {
  const { id } = req.params;
  const {data,floorplanId} = req.body;

  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    const floorplan = await Floorplan.findById(floorplanId);
    if (!floorplan) {
      return res.status(404).json({ message: 'Floorplan not found' });
    }
    const newSunbed = new Sunbed(data);
    await newSunbed.save();

    // If a worker is assigned to this sunbed, update the worker's sunbedId array
    if (data.workerId) {
      await Worker.findByIdAndUpdate(
        data.workerId,
        { $addToSet: { sunbedId: newSunbed._id } }
      );
    }

    floorplan.sunbeds.push(newSunbed._id);
    await floorplan.save();
    let updatedrestaurant= await Restaurant.findById(id).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
  });
    res.status(201).json(updatedrestaurant);
  } catch (err) {
    console.error('Error adding sunbed:', err);
    res.status(400).json({ message: 'Failed to add sunbed' });
  }
}
async function addFloorplan(req, res) {
  const { id } = req.params;
  const { data } = req.body;
  try {
    const userId = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const newFloorplan = new Floorplan(data);
    await newFloorplan.save();

    restaurant.floorplans.push(newFloorplan._id);
    await restaurant.save();

    const updatedRestaurant = await Restaurant.findById(id).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
    });
    res.status(201).json(updatedRestaurant);
  } catch (err) {
    console.error('Error adding floorplan:', err);
    res.status(400).json({ message: 'Failed to add floorplan' });
  }
}
async function deleteFloorplan(req, res) {
  const { id } = req.params;
  const { restaurantId } = req.body;
  try {
    const userId = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Find the floorplan and delete it
    const deletedFloorplan = await Floorplan.findByIdAndDelete(id);
    if (!deletedFloorplan) {
      return res.status(404).json({ message: 'Floorplan not found' });
    }

    // Remove the floorplan ID from the restaurant
    restaurant.floorplans.pull(id);

    // Delete associated sunbeds
    for (const sunbedId of deletedFloorplan.sunbeds) {
      await Sunbed.findByIdAndDelete(sunbedId);
    }

    // Save the changes to the restaurant
    await restaurant.save();

    // Fetch the updated restaurant with populated floorplans and sunbeds
    const updatedRestaurant = await Restaurant.findById(restaurantId).populate({
      path: 'floorplans',
      populate: {
        path: 'sunbeds'
      }
    });

    res.status(201).json(updatedRestaurant);
  } catch (err) {
    console.error('Error deleting floorplan:', err);
    res.status(400).json({ message: 'Failed to delete floorplan' });
  }
}



async function getSunbedById(req, res) {
  const { restaurantId, sunbedId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
  });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    const sunbed = restaurant.floorplan.sunbeds.find(sunbed => sunbed._id.toString() === sunbedId);
    if (!sunbed) {
      return res.status(404).json({ message: 'Sunbed not found' });
    }
    
    res.json(sunbed);
  } catch (err) {
    console.error('Error getting sunbed by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function updateSunbed(req, res) {
  const { restaurantId, sunbedId } = req.params;
  const {newData} = req.body;

  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    const sunbed = await Sunbed.findById(sunbedId);
    if (!sunbed) {
      return res.status(404).json({ message: 'Sunbed not found' });
    }
    
    // Check if worker assignment is changing
    const oldWorkerId = sunbed.workerId;
    const newWorkerId = newData.workerId;
    
    // Update the sunbed with new data
    const updatedSunbed = await Sunbed.findByIdAndUpdate(
      sunbedId,
      newData,
      { new: true }
    );
    
    if (!updatedSunbed) {
      return res.status(404).json({ message: 'Sunbed not found' });
    }
    
    // Handle worker assignments
    if (oldWorkerId && (!newWorkerId || oldWorkerId.toString() !== newWorkerId.toString())) {
      // Remove sunbed from old worker's sunbedId array
      await Worker.findByIdAndUpdate(
        oldWorkerId,
        { $pull: { sunbedId: sunbedId } }
      );
    }
    
    if (newWorkerId && (!oldWorkerId || oldWorkerId.toString() !== newWorkerId.toString())) {
      // Add sunbed to new worker's sunbedId array if not already there
      await Worker.findByIdAndUpdate(
        newWorkerId,
        { $addToSet: { sunbedId: sunbedId } }
      );
    }
    
    const updatedRestaurant = await Restaurant.findById(restaurantId).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
    });
    
    res.status(200).json(updatedRestaurant);
  } catch (err) {
    console.error('Error updating sunbed:', err);
    res.status(400).json({ message: 'Failed to update sunbed' });
  }
}

async function deleteSunbed(req, res) {
  const { restaurantId, sunbedId } = req.params;
  const { floorplanId } = req.body;
  try {
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const floorplan = await Floorplan.findById(floorplanId);
    if (!floorplan) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    
    // Get the sunbed to check if it has a worker assigned
    const sunbed = await Sunbed.findById(sunbedId);
    if (sunbed && sunbed.workerId) {
      // Remove sunbed reference from the worker
      await Worker.findByIdAndUpdate(
        sunbed.workerId,
        { $pull: { sunbedId: sunbedId } }
      );
    }
    
    floorplan.sunbeds.pull(sunbedId); 
    await floorplan.save();
    await Sunbed.findByIdAndDelete(sunbedId);
    
    const updatedRestaurant = await Restaurant.findById(restaurantId).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
    });
    res.status(200).json(updatedRestaurant);
  } catch (err) {
    console.error('Error deleting sunbed:', err);
    res.status(400).json({ message: 'Failed to delete sunbed' });
  }
}

async function getSunbedsByDate(req, res) {
  const { restaurantId, date } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate({
      path: 'floorplans',
      populate: {
        path: 'sunbeds'
      }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const filteredFloorplans = restaurant.floorplans.map(floorplan => {
      const filteredSunbeds = floorplan.sunbeds.map(sunbed => ({
        ...sunbed.toObject(),
        reserved: sunbed.dates.some(d => d.date === date && !d.isClosed)
      }));
      return { ...floorplan.toObject(), sunbeds: filteredSunbeds };
    });

    res.json(filteredFloorplans);
  } catch (err) {
    console.error('Error getting sunbeds by date:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}



async function getSunbedsByRestaurantId(req, res) {
  const { id } = req.params;

  try {
    const restaurant = await Restaurant.findById(id).populate({
      path: 'floorplans',
      populate: {
        path: 'sunbeds'
      }
    });
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const floorplan = restaurant.floorplans;
    res.json(floorplan);
  } catch (err) {
    console.error('Error getting sunbeds by restaurant ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getSunbedTypeById(req, res) {
  const { restaurantId, sunbedId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate('sunbeds');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const sunbed = restaurant.sunbeds.find(sunbed => sunbed._id.toString() === sunbedId);
    if (!sunbed) {
      return res.status(404).json({ message: 'Sunbed not found' });
    }

    const sunbedType = sunbed.type;
    res.json({ type: sunbedType });
  } catch (err) {
    console.error('Error getting sunbed type by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getSunbedPriceById(req, res) {
  const { restaurantId, sunbedId } = req.params;

  try {
    const restaurant = await Restaurant.findById(restaurantId).populate('sunbeds');
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const sunbed = restaurant.sunbeds.find(sunbed => sunbed._id.toString() === sunbedId);
    if (!sunbed) {
      return res.status(404).json({ message: 'Sunbed not found' });
    }

    const sunbedPrice = sunbed.price;
    res.json({ price: sunbedPrice });
  } catch (err) {
    console.error('Error getting sunbed price by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}




module.exports = { createRestaurant,getRestaurants,deleteFloorplan ,updateRestaurant, deleteRestaurant, getSunbedById, addSunbed, updateSunbed, deleteSunbed, getSunbedsByDate, getSunbedsByRestaurantId, getSunbedTypeById, getSunbedPriceById,getRestaurantById ,addFloorplan};
