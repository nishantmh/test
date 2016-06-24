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
var nodemailer = require("nodemailer");
var srs = require('secure-random-string');







var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'vtest098@gmail.com',
        pass: 'varahi123'
    }
});





router.get('/changedpass', auth, function (req, res) {
    
    User.findOne({ username: req.payload.username }).select("chpass").exec(function (err, user) {
       
            return res.json(user);
      
        
    });
});

    
router.post('/changePass', auth, function (req, res) {
  
    User.findOne({ username: req.payload.username }).exec(function (err, user) {
        user.setPassword(req.body.password);
        user.chpass = "yes";
        user.save(function (err) {
            return res.json({ msg: 'password reset succefully' });
        });
        
    });
});

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'Express' });
});

router.post('/login', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }
    
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        
        if (user) {
           
            
                return res.json({ token: user.generateJWT() });
            
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});






router.post('/register', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: 'Please fill out all fields' });
    }
    
    var user = new User();
        
    user.username = req.body.username;
    
    user.setPassword(req.body.password)
    
    user.save(function (err) {
        if (err) { return next(err); }
        
        return res.json({ token: user.generateJWT() })
    });
});

router.get('/mapDevtoCust',  function (req, res, next) {
    User.find({"role" : "customer"}).select('username').populate('customer', 'username').exec(function (err, customers) {
        Device.find({ assigned: "no" }).select('deviceID').populate('device', 'deviceID').exec(function (err, device) {
            var info = device.concat(customers);
            res.jsonp(info);
        });
    });
});

router.post('/map', function (req, res, next) {
    mapInfo = new MapInfo();
    console.dir(req.body);
    mapInfo.deviceID = req.body.deviceID.deviceID;
    mapInfo.username = req.body.username.username;
    mapInfo.assigned = "no";
   
    mapInfo.save(function (err) {
        if (err) { return next(err); }
        Device.findOneAndUpdate({ deviceID: req.body.deviceID.deviceID }, { assigned: "yes" }, function (err, map) {
            srs({ length: 6 }, function (err, sr) {
                console.log(sr);
                var user = new User();
                
                user.username = req.body.deviceID.deviceID;
                // user.setPassword(req.body.password);
                user.setPassword(sr);
                user.role = "device";
                user.chpass = "yes";
                user.save(function (err) {
                    if (err) {
                        console.log("erroradaqdwd", err);
                        return res.json({ msg: 'device already exists.' });
            //return next(err);
                    }
                    //else 
                    var mailtext = "hello " + req.body.username.username + ", the password for device "+ req.body.deviceID.deviceID +" is "+sr;
                    var mailOptions = {
                        from: '"vtest098@gmail.com', // sender address 
                        to: req.body.username.username, // list of receivers 
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
                    
                    return res.json({ msg: 'mapped device to customer.' });
                });
            });
            
        });
    });
});

router.get('/GetDevicemappedInfo',auth, function (req, res, next) {
    console.log("test", req.payload.username);
    MapInfo.find({ username: req.payload.username, "assigned" : "no" }).select('deviceID').exec(function (err, devices) { 
        res.json(devices);
    }) 
   
});







router.get('/GetInfo', auth, function (req, res, next) {
    console.log("testasasda", req.payload.username);
 
   

    
    CustObj.find({ username: req.payload.username, mapped: 'no' }).select('objID').populate('objectID', 'objID').exec(function (err, objects) {
        Vehicle_info.find({ username: req.payload.username }).select('deviceID').populate('deviceIDs', 'deviceID').exec(function (err, devices) {
            User.find({ customer: req.payload.username }).select('username').populate('usernames', 'username').exec(function (err, users) {
                var info = devices.concat(objects);
                console.log("deviceID", devices);
                res.json(info.concat(users));
            });
        });
    });
});





module.exports = router;