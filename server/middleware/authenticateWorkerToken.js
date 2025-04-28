const jwt = require('jsonwebtoken');
const Worker = require('../models/Worker');

const authenticateWorkerToken = async (req, res, next) => {
    const {token} = req.body; 
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    try {
        const decoded = jwt.verify(token, "JWT_SECRET");
        // Fetch the full worker object instead of just the ID
        const worker = await Worker.findById(decoded.id);
        if (!worker) {
            return res.status(403).json({ message: 'Invalid worker.' });
        }
        
        req.user = worker;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
};

module.exports = authenticateWorkerToken;