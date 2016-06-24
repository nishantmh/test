var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var Device = mongoose.model('deviceInfo');
var MapInfo = mongoose.model('mapInfo');
var CustObj = mongoose.model('custObj');
var Custmap_info = mongoose.model('custmap_info');
var jwt = require('express-jwt');
var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });
var Vehicle_info = mongoose.model('vehicle_info');

router.get('/getObjInfo', function (req, res, next) {
    Custmap_info.find({ "deviceID" : "D189" }).select('objectID').exec(function (err, objects) {
        
            res.jsonp(objects);
    });
});

module.exports = router;