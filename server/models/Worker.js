const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  sunbedId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sunbed" }],
  role: { type: String, required: true },
});

const Worker = mongoose.model("Worker", workerSchema);

module.exports = Worker;
