var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var Device = mongoose.model('deviceInfo');
var MapInfo = mongoose.model('mapInfo');
var CustObj = mongoose.model('custObj');
var Custmap_info = mongoose.model('custmap_info');
var ad_Info = mongoose.model('Ad_Info'); 
var jwt = require('express-jwt');
var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });
var Vehicle_info = mongoose.model('vehicle_info');
var nodemailer = require("nodemailer");
var srs = require('secure-random-string');
var multer = require('multer');
var filename; 





var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/pics');
       // console.log("test",ad);
    },
    filename: function (req, file, cb) {
       // console.dir(file);
        //filename = file.originalname;
      //  console.log("test", ad);
         filename = file.fieldname + '_' + Date.now() + '.jpg';
        cb(null, filename);
    }
});
//var storage = multer.memoryStorage();
var upload = multer({ storage: storage }).single('file');

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'vtest098@gmail.com',
        pass: 'varahi123'
    }
});




router.post('/AddCustomer', auth, function (req, res, next) {
    srs({ length: 6 }, function (err, sr) {
        console.log(sr);
        var user = new User();
        
        user.username = req.body.customername;
        // user.setPassword(req.body.password);
        user.setPassword(sr);
        user.role = "customer";
        user.chpass = "no";
        user.save(function (err) {
            if (err) {
                console.log("erroradaqdwd", err);
                return res.json({ msg: 'customer already exists.' });
            //return next(err);
            }
            //else 
            var mailtext = "hello " + req.body.customername + ", your password is " + sr;
            var mailOptions = {
                from: '"vtest098@gmail.com', // sender address 
                to: req.body.customername, // list of receivers 
                subject: 'GPS Tracker', // Subject line 
                text: mailtext, // plaintext body 
                html: mailtext // html body 
            };
            
            
            
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);
            });
            
            return res.json({ msg: 'customer added.' });
        });
    });
});





router.post('/AddDevice', auth, function (req, res, next) {
    console.log("hiasdasd", req.body);
    var device = new Device();
    console.log("device", device);
    device.deviceID = req.body.deviceID;
    device.assigned = "no";
    
    device.deviceName = req.body.deviceName;
    device.save(function (err) {
        if (err) {
            
            return res.json({ msg: 'device already exists.' });
        }
        
        return res.json({ msg: 'device added' });
    });
});





router.get('/mapDevtoCust', function (req, res, next) {
    User.find({ "role" : "customer" }).select('username').populate('customer', 'username').exec(function (err, customers) {
        Device.find({ assigned: "no" }).select('deviceID').populate('device', 'deviceID').exec(function (err, device) {
            var info = device.concat(customers);
            res.jsonp(info);
        });
    });
});



router.post('/uploadAd', auth, function (req, res, next) {
    console.log("ad", req.body);
    upload(req, res, function (err) {
        if (err) {
            
            console.log("error uploading a file.");


        }
        console.log(req.file);
        console.log(filename);
        // ad = req.body;
        console.log(req.body);
        var ad = new ad_Info();
        ad_In = JSON.parse(req.body.ad);
        ad.adID = ad_In.adID;
        ad.url = ad_In.url;
        ad.file = "/pics/" + filename;
        ad.location = ad_In.location;
        ad.show = "no";
        ad.viewed = 0;
        ad.save(function (err) {
            if (err) {
                
                return res.json({ msg: 'error.' });
            }
            
            return res.json({ msg: 'new ad added' });
        });
        console.dir(storage);
    });
  
   
});




router.get('/getAds', function (req, res, next) {
    ad_Info.find().exec(function (err, ads) {
      
            res.jsonp(ads);
       
    });
});
module.exports = router;