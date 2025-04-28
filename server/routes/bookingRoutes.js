const express = require('express');
const {
  createBooking,
  getBookings,
  updateBooking,
  deleteBooking,
  getBookingById,
  getBookingsByRestaurantId, getBookingsBySunbedId, getAllSunbedBookingsByDate, reservationReport, getBookingDetailsByRandomId,
  verificationCode,
  verifyCode,
  closeSunbed
} = require('../controllers/bookingController');
const authenticateToken = require('../middleware/authenticatetoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const geoip = require('geoip-lite');
const allowedCountries = ['PK', 'AL', 'XK', 'ME', 'MK'];
const normalizeIp = (ip) => {
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (ip === '::1' || ip === '127.0.0.1') {
    return null; // Local address, skip geolocation
  }
  return ip;
};
const countryBlocker = (req, res, next) => {
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  ip = normalizeIp(ip);

  // Log the normalized IP address
  console.log('Normalized Client IP:', ip);

  if (!ip) {
    // If the IP is a local address, allow the request
    return next();
  }

  const geo = geoip.lookup(ip);

  // Log the geo information for debugging
  console.log('Geo Information:', geo);

  if (geo && allowedCountries.includes(geo.country)) {
    next();
  } else {
    res.status(403).json({
      message: 'Access denied. This service is not available in your country.'
    });
  }
};


const createBookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // limit each IP to 2 requests per windowMs
  message: {
    message: 'Too many booking requests from this IP, please try again after 15 minutes'
  }, keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  }
});
let lastRequestTime = 0;
const requestInterval = 2 * 60 * 1000; //2 minutes in milliseconds

const globalRateLimiter = (req, res, next) => {
  const currentTime = Date.now();

  if (currentTime - lastRequestTime < requestInterval) {
    return res.status(429).json({
      message: 'Too many requests, please try again after 5 minutes'
    });
  }

  lastRequestTime = currentTime;
  next();
};
router.post('/send-verification-code', countryBlocker, verificationCode)
router.post('/verify-code', verifyCode)
router.post('/', countryBlocker, createBooking);

router.get('/', authenticateToken, getBookings);
router.get('/search/:randomId', getBookingDetailsByRandomId);
router.get('/:id', authenticateToken, getBookingById);
router.get('/restaurant/:restaurantId', authenticateToken, getBookingsByRestaurantId);
router.post('/sunbed/:sunbedId', authenticateToken, getBookingsBySunbedId);
router.post('/closesunbed/:bookingId', authenticateToken, closeSunbed);
router.post('/:restaurantId/:date',authenticateToken, getAllSunbedBookingsByDate);

router.put('/:id', authenticateToken, updateBooking);

router.post('/reservationreport', authenticateToken, reservationReport);
router.post('/:id', deleteBooking);


module.exports = router;
