
const sendVerificationEmail = require('../middleware/sendVerficationCode');
const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const Sunbed = require('../models/Sunbed');
const User = require('../models/User');
const crypto = require('crypto');
const Verification = require("../models/Verification.js")
const nodemailer = require('nodemailer');

const verificationCode = async (req, res) => {
  const { email } = req.body;
  const code = crypto.randomBytes(3).toString('hex'); // Generate a random code

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // Code expires in 15 minutes

  try {
    await Verification.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    await sendVerificationEmail(email, code);
    res.status(200).json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('Error sending verification email:', err);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
}
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    const verification = await Verification.findOne({ email });

    if (!verification) {
      return res.status(400).json({ message: 'Verification code not requested' });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    if (verification.code !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Set the verified flag to true
    verification.verified = true;
    await verification.save();

    res.status(200).json({ message: 'Verification successful' });
  } catch (err) {
    console.error('Error verifying code:', err);
    res.status(500).json({ message: 'Failed to verify code' });
  }
}

const generateRandomId = () => {
  const length = 8;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomId = '';
  for (let i = 0; i < length; i++) {
    randomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomId;
};


const createBooking = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('Request received from IP:', ip);

    const form = req.body;
    const email = form.email; 
    const user = await User.findOne({ email });
    if (!user) {
      const verification = await Verification.findOne({ email });
      if (!verification || !verification.verified) {
        return res.status(403).json({ message: 'Email not verified' });
      }

      // Delete the verification document after use
      await Verification.deleteOne({ email });
    }
    const existingBooking = await Booking.findOne({
      sunbedId: form.sunbedId,
      date: form.date,
      isClosed:false
    });
    if (existingBooking) {
      return res.status(400).json({ message: "Sunbed already booked on that date" });
    }
      const randomId = generateRandomId();
      const booking = new Booking({
        ...form,
        isClosed: false,
        sunbedRandomId: randomId,
      });
      await booking.save();
    const sunbed = await Sunbed.findById(form.sunbedId);
    sunbed.dates.push({date:form.date,isClosed:false,sunbedRandomId:randomId});
    await sunbed.save();
    // Delete the verification document
    await Verification.deleteOne({ email });

    let restaurant = await Restaurant.findById(form.restaurantId).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
    });
    const transporter = nodemailer.createTransport({
      service: 'Gmail', 
      auth: {
        user: 'info.sunbed.al@gmail.com',
        pass: 'uvau lfyc pikk fzjb'
      }
    });

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${form.name},</p>
        <p>Thank you for your booking. Here are the details:</p>
        <ul>
          <li><strong>Name:</strong> ${form.name}</li>
          <li><strong>Email:</strong> ${form.email}</li>
          <li><strong>Phone:</strong> ${form.phone}</li>
          <li><strong>Date:</strong> ${form.date}</li>
          <li><strong>Time:</strong> ${form.time}</li>
          <li><strong>Price:</strong> ${form.price} ALL</li>
          <li><strong>Payment:</strong> ${form.payment === 'true' ? 'Completed' : 'Pending'}</li>
          <li><strong>Booking ID:</strong> ${form.randomId}</li>
        </ul>
        <p>We look forward to serving you.</p>
        <p>Best regards,</p>
        <p>The Restaurant Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json(restaurant);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(400).json({ message: 'Failed to create booking' });
  }
};



async function getBookings(req, res) {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error('Error getting bookings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getBookingById(req, res) {
  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error('Error getting booking by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}


async function updateBooking(req, res) {
  const { id } = req.params;
  const { newPaymentStatus, sunbedRandomId,restaurantId } = req.body;
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, { payment: newPaymentStatus }, { new: true });
    const sunbedUpdateResult = await Sunbed.findOneAndUpdate(
      {
        _id: updatedBooking.sunbedId,
        'dates': { $elemMatch: { date: updatedBooking.date, sunbedRandomId: sunbedRandomId } }
      },
      { $set: { 'dates.$.payment': true } },
      { new: true }
    );
    const restauant= await Restaurant.findById(restaurantId).populate({
      path: 'floorplans',
      populate: {
          path: 'sunbeds'
      }
    });
    res.json(restauant);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(400).json({ message: 'Failed to update booking' });
  }
}

async function closeSunbed(req, res) {
  const { bookingId } = req.params;
  try {
    // Find and update the booking status to closed
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { isClosed: true },
      { new: true }
    );

    // If booking not found, return 400
    if (!updatedBooking) {
      return res.status(400).json({ message: 'Booking not found' });
    }

    // Find the sunbed associated with the booking
    const sunbedUpdateResult = await Sunbed.findOneAndUpdate(
      { 
        _id: updatedBooking.sunbedId, 
        'dates': { $elemMatch: { date: updatedBooking.date, isClosed: false } }
      },
      { $set: { 'dates.$.isClosed': true } },
      { new: true }
    );

    // If sunbed not found, return 400
    if (!sunbedUpdateResult) {
      return res.status(400).json({ message: 'Sunbed not found' });
    }

    // Return the updated booking
    return res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    return res.status(400).json({ message: 'Failed to update booking' });
  }
}


async function updateBookingPayment(req, res) {
  const { restaurantId, sunbedId } = req.params;
  const { newPaymentStatus } = req.body;
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(id, newData, { new: true });
    res.json(updatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(400).json({ message: 'Failed to update booking' });
  }
}

async function deleteBooking(req, res) {
  const { id } = req.params;
  try {
    const bookingDetails = await Booking.findById(id);
    
    if (bookingDetails) {
      const randomId = bookingDetails.sunbedRandomId;
      const deletedBooking = await Booking.findByIdAndDelete(id);
      const sunbedUpdateResult = await Sunbed.findOneAndUpdate(
        { 
          _id: bookingDetails.sunbedId, 
          'dates': { $elemMatch: { date: bookingDetails.date, sunbedRandomId: randomId } }
        },
        { $pull: { dates: { date: bookingDetails.date, sunbedRandomId: randomId } } },
        { new: true }
      );
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ message: 'Booking not found', success: false });
    }
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}





async function getBookingsByRestaurantId(req, res) {
  const { restaurantId } = req.params;

  try {
    const bookings = await Booking.find({ restaurantId: restaurantId });
    res.json(bookings);
  } catch (err) {
    console.error('Error getting bookings by restaurant ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getBookingsBySunbedId(req, res) {
  const { sunbedId } = req.params;
  try {
    const bookings = await Booking.find({ sunbedId: sunbedId });
    res.json(bookings);
  } catch (err) {
    console.error('Error getting bookings by sunbed ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getAllSunbedBookingsByDate(req, res) {
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

    const sunbeds = restaurant.sunbeds.map(sunbed => ({
      ...sunbed.toObject(),
      reserved: sunbed.dates.includes(date)
    }));

    const finaldata = await Promise.all(sunbeds.map(async sunbed => {
      const bookingDetail = await Booking.findOne({ sunbedId: sunbed._id, date: date });
      if (bookingDetail) {
        sunbed.payment = bookingDetail.payment;
      }
      return sunbed;
    }));

    res.json(finaldata);
  } catch (err) {
    console.error('Error getting all sunbed bookings by date:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getBookingDetailsByRandomId(req, res) {
  const { randomId } = req.params;
  try {
    const booking = await Booking.findOne({ randomId });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    console.error('Error getting sunbed bookings:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function reservationReport(req, res) {
  try {
    const { minDate, maxDate } = req.body;
    const userId = req.user;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    let restaurants ;
    await Promise.all(user?.restaurantId?.map(async (e) => {
      const restaurant = await Restaurant.find(e);
      restaurants= restaurant;
  }));
  

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    let countCircle = 0;
    let countSquare = 0;
    let countSquareV = 0;
    let totalPriceCircle = 0;
    let totalPriceSquare = 0;
    let totalPriceSquareV = 0;

    let countCircleAdmin = 0;
    let countSquareAdmin = 0;
    let countSquareVAdmin = 0;
    let totalPriceCircleAdmin = 0;
    let totalPriceSquareAdmin = 0;
    let totalPriceSquareVAdmin = 0;
    for (const restaurant of restaurants) {
      let bookings = await Booking.find({ restaurantId: restaurant?._id });
      bookings = bookings.filter(booking => booking.date >= minDate && booking.date <= maxDate);
      for (const booking of bookings) {
        let sunbed = await Sunbed.findById(booking.sunbedId);
        if (booking.isAdmin) {
          if (sunbed.type === 'circle') {
            countCircleAdmin++;
            totalPriceCircleAdmin += parseFloat(sunbed.price);
          } else if (sunbed.type === 'square') {
            countSquareAdmin++;
            totalPriceSquareAdmin += parseFloat(sunbed.price);
          } else if (sunbed.type === 'squarev') {
            countSquareVAdmin++;
            totalPriceSquareVAdmin += parseFloat(sunbed.price);
          }
        } else {
          if (sunbed.type === 'circle') {
            countCircle++;
            totalPriceCircle += parseFloat(sunbed.price);
          } else if (sunbed.type === 'square') {
            countSquare++;
            totalPriceSquare += parseFloat(sunbed.price);
          } else if (sunbed.type === 'squarev') {
            countSquareV++;
            totalPriceSquareV += parseFloat(sunbed.price);
          }
        }
      }
    }
    res.status(200).json({
      countCircle,
      countSquare,
      countSquareV,
      totalPriceCircle,
      totalPriceSquare,
      totalPriceSquareV,
      countCircleAdmin,
      countSquareAdmin,
      countSquareVAdmin,
      totalPriceCircleAdmin,
      totalPriceSquareAdmin,
      totalPriceSquareVAdmin
    })
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { verifyCode, verificationCode, createBooking, getBookingDetailsByRandomId, reservationReport, updateBookingPayment, getBookings, getBookingById, getBookingsByRestaurantId, closeSunbed,getAllSunbedBookingsByDate, getBookingsBySunbedId, updateBooking, deleteBooking };
