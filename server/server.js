const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const restaurantRoutes = require('./routes/restaurantRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cors = require('cors');
const paypal = require('./controllers/paymentController')
const geoip = require('geoip-lite');
// const paypalRoutes = require('./routes/paypalRoutes');
const app = express();

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.set('trust proxy', 1);
// process.env.mongoURI
//mongodb+srv://ernedoselami:LleER9ZXqLHVXTMf@cluster0.de0yfwx.mongodb.net/Sunbed
mongoose
  .connect(
    "mongodb+srv://online1452:hzfFkqZlWGU7rN2s@cluster0.svlklqk.mongodb.net/"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB", err));

app.use('/auth', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/bookings', bookingRoutes);
const sunbedRoutes = require("./routes/sunbedRoutes");
app.use("/api/sunbeds", sunbedRoutes);
// app.use('/paypal', paypalRoutes);
app.post('/pay', async (req, res) => {
  try {
    const { amount, returnUrl } = req.query;
    const url = await paypal.createOrder(amount, returnUrl);
    res.json({ url });
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});

app.get('/complete-order', async (req, res) => {
  try {
    const { token, PayerID, returnUrl } = req.query;
    await paypal.capturePayment(token);

    // Parse and construct the return URL to avoid duplications
    const url = new URL(decodeURIComponent(returnUrl));
    url.searchParams.set('status', 'success');

    res.redirect(url.toString());
  } catch (error) {
    res.status(500).send('Error: ' + error);
  }
});
app.get('/cancel-order', (req, res) => {
  const { returnUrl } = req.query;

  // Parse and construct the return URL to avoid duplications
  const url = new URL(decodeURIComponent(returnUrl));
  url.searchParams.set('status', 'cancelled');

  res.redirect(url.toString());
});
app.get("/", (req, res) => {
  res.send("Working")
})
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
