const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Sunbed = require('../models/Sunbed');
const setTokenCookie = require("../middleware/jwtToken")



async function register(req, res) {
  try {
    const { username, email, password,role } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword ,role});
    await user.save();
    setTokenCookie(res, user.id)
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const accessToken = jwt.sign({ id: user.id },"JWT_SECRET", { expiresIn: '1h' });
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    res.json({ user: userWithoutPassword ,token:accessToken});
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getUser(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(200).json({ message: 'No token available.', user: null });
    }
    jwt.verify(token, "JWT_SECRET", async (err, decoded) => {
      if (err) {
        return res.status(200).json({ message: 'Invalid token.', user: null });
      }
      const userId = decoded.id;
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found.', user: null });
      }

      return res.status(200).json({ message: 'User found.', user: user });
    });
  } catch (err) {
    console.error('Error getting user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function logOut(req, res) {
  try {
    // Clear the cookie by setting its value to empty and expiration to a past date
    res.clearCookie('token');
    // Assuming you want to return a message to the frontend
    return res.status(200).json({ message: 'User logged out successfully.' });
  } catch (err) {
    console.error('Error logging out user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}


async function registerWorker(req, res) {
  try {
    // Check if the requester is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can create worker accounts.",
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    let worker = await Worker.findOne({ email });
    if (worker) {
      return res.status(400).json({
        success: false,
        message: "worker already exists",
      });
    }

    // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
    // Create new worker
    worker = new Worker({
      username,
      email,
      password: hashedPassword,
      role: "worker",
    });

    await worker.save();

    res.json({
      success: true,
      message: "Worker created successfully",
      worker: {
        id: worker._id,
        username: worker.username,
        email: worker.email,
        role: worker.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// Add endpoint to get all workers (admin only)
// Change from exports.getWorkers to async function getWorkers
async function getWorkers(req, res) {
  try {
    // Check if the requester is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can view workers.",
      });
    }

    const workers = await Worker.find({ role: "worker" }).select("-password");

    res.json({
      success: true,
      workers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function getWorker(req, res) {
  try {
    const {token} = req.body;
    if (!token) {
      return res.status(200).json({ message: 'No token available.', user: null });
    }
    jwt.verify(token, "JWT_SECRET", async (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid token.', user: null });
      }
      const userId = decoded.id;
      const worker = await Worker.findById(userId).select('-password');
      if (!worker) {
        return res.status(404).json({ message: 'User not found.', user: null });
      }
      return res.status(200).json({ message: 'User found.', user: worker });
    })
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


async function updateWorker(req, res) {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    // Check if the requester is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can update worker accounts.",
      });
    }

    // Check if worker exists
    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Update worker fields
    if (username) worker.username = username;
    if (email) worker.email = email;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      worker.password = await bcrypt.hash(password, salt);
    }

    await worker.save();

    // Return updated worker without password
    const workerWithoutPassword = { ...worker.toObject() };
    delete workerWithoutPassword.password;

    res.json({
      success: true,
      message: "Worker updated successfully",
      worker: workerWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating worker:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function deleteWorker(req, res) {
  try {
    const { id } = req.params;

    // Check if the requester is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only admins can delete worker accounts.",
      });
    }

    // Check if worker exists
    const worker = await Worker.findById(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    await Worker.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting worker:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function workerLogin(req, res) {
  try {
    const { email, password } = req.body;
    // Check if worker exists
    const worker = await Worker.findOne({ email });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }
    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, worker.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }
    // Generate JWT token
    const token = jwt.sign({ id: worker._id }, "JWT_SECRET", {
      expiresIn: "1h", 
    });
    // Return worker and token
    res.json({
      success: true,
      message: "Worker logged in successfully",
      worker: {
        id: worker._id,
        username: worker.username,
        email: worker.email,
        role: worker.role,
      },
      token,
    });
  }
  catch (error) {
    console.error("Error logging in worker:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

async function workerLogout(req, res) {
  try {
    // Clear the cookie by setting its value to empty and expiration to a past date
    res.clearCookie('token');
    // Assuming you want to return a message to the frontend
    return res.status(200).json({ message: 'Worker logged out successfully.' });
  } catch (err) {
    console.error('Error logging out worker:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function workerSunbeds(req, res) {
  try {
    // The authenticateToken middleware has already verified the token
    // and attached the user object to req.user
    
    // Check if the user is a worker
    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only workers can access this resource."
      });
    }
    
    const workerId = req.user._id;
    
    // Find all sunbeds assigned to this worker
    const sunbeds = await Sunbed.find({ workerId: workerId });
    
    return res.status(200).json({
      success: true,
      sunbeds
    });
  } catch (error) {
    console.error("Error fetching worker sunbeds:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

module.exports = { register, login, getUser ,logOut, registerWorker, getWorkers, getWorker, updateWorker, deleteWorker, workerLogin, workerLogout, workerSunbeds};

