const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
  const user = new User({}).save();
  return user;
}
