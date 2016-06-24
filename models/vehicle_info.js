var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var UserSchema = new mongoose.Schema({
    vehicleID: { type: String, unique: true },
    username: String,
    rtoNo : String,
    deviceID: String
});


UserSchema.plugin(uniqueValidator);



mongoose.model('vehicle_info', UserSchema);
