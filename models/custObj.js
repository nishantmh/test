var mongoose = require('mongoose');





var UserSchema = new mongoose.Schema({
    objID : String,
    username: String,
    mapped : String,
    usr : String,
    type : String,
    presence : String
});


mongoose.model('custObj', UserSchema);