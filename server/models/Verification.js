const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false }
});

const Verification = mongoose.model('Verification', verificationSchema);
module.exports = Verification;