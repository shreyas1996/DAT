const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ethereumAddress: {
    type: String,
    required: true,
  },
  privateKey: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('user', UserSchema);
