var mongoose = require('mongoose');





var UserSchema = new mongoose.Schema({
    adID: String,
    url: String,
    location : String,
    file: String,
    show: String,
    viewed : Number
});


mongoose.model('Ad_Info', UserSchema);