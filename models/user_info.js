var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: String,
    deviceId : String,
    city : String,
    location : {longitude: String , latitude: String}
});





mongoose.model('user_info', UserSchema);
