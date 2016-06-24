var mongoose = require('mongoose');





var UserSchema = new mongoose.Schema({
    deviceID: String,
    username: String,
    assigned: String
});


mongoose.model('mapInfo', UserSchema);