var mongoose = require('mongoose');





var UserSchema = new mongoose.Schema({
    objID : String,
    DevID: String,
    usr : String,
    strBuff1: [{ data: Buffer, contentType: String }],
    strBuff2: [{ data: Buffer, contentType: String }], 
    strBuff3: [{ data: Buffer, contentType: String }],
    strBuff4: [{ data: Buffer, contentType: String }]
});


mongoose.model('new_DevInfo', UserSchema);