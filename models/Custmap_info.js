var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    deviceID: String,
    username: String,
    objectID : [String],
    Location: [{ longitude: String, latitude: String, date: String }],
    date : String
});





mongoose.model('custmap_info', UserSchema);
