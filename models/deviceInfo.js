var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');



var UserSchema = new mongoose.Schema( {
    deviceID: { type: String, unique: true },
    deviceName: String,
    assigned: String
});

UserSchema.plugin(uniqueValidator);

mongoose.model('deviceInfo', UserSchema);