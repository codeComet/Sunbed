const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const {token} = req.body; 
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, "JWT_SECRET");
        // Fetch the full user object instead of just the ID
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({ message: 'Invalid user.' });
        }
        
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticateToken;
