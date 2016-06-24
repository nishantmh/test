var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');
var User = mongoose.model('User');
var Device = mongoose.model('deviceInfo');
var MapInfo = mongoose.model('mapInfo');
var CustObj = mongoose.model('custObj');
var Custmap_info = mongoose.model('custmap_info');
var New_DevInfo = mongoose.model('new_DevInfo');
var User_info = mongoose.model('user_info');
var ad_Info = mongoose.model('Ad_Info'); 
var jwt = require('express-jwt');
var auth = jwt({ secret: 'SECRET', userProperty: 'payload' });
var Vehicle_info = mongoose.model('vehicle_info');
var nodemailer = require("nodemailer");
var srs = require('secure-random-string');
var crypto = require('crypto');
var _ = require('lodash');
var CronJob = require('cron').CronJob;



var job = new CronJob({
    cronTime: '*/30 * * * * *',
    onTick: function () {
        //ad_Info.find({show:no}).select("_id").limit(4).exec(function(err, questions) {

       // ad_Info.update({show: no})
    },
    start: false,
    timeZone: 'Asia/Kolkata'
});
job.start();



var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'vtest098@gmail.com',
        pass: 'varahi123'
    }
});

router.post('/addVehicleInfo', auth, function (req, res, next) {
    var vehicle_info = new Vehicle_info();
    
    vehicle_info.vehicleID = req.body.vID;
    vehicle_info.username = req.payload.username;
    vehicle_info.rtoNo = req.body.rtoNo;
    vehicle_info.deviceID = req.body.deviceID.deviceID;
    
    
    vehicle_info.save(function (err) {
        if (err) { return res.json({ msg: "vehicle already exists." }) }
        MapInfo.findOneAndUpdate({ deviceID: req.body.deviceID.deviceID }, { assigned: "yes" }, function (err, map) {
            return res.json({ msg: "vehicle info added." })
        });
       
    });



});

router.post('/mapInfo', auth, function (req, res, next) {
    console.log(req.body);
    var custmap = {};
    custmap.username = req.payload.username;
    custmap.deviceID = req.body.deviceID.deviceID;
    custmap.objectID = req.body.objID.objID;
   // custmap_info.Location.longitude = "0.0";
   // custmap_info.Location.latitude = "0.0";
    // custmap_info.save(function (err) {
    Custmap_info.findOne({ deviceID: req.body.deviceID.deviceID },function (err, doc) {
        if (err) { return next(err); }
        if (doc) {
            Custmap_info.update({ deviceID: req.body.deviceID.deviceID }, { $push: { objectID: req.body.objID.objID } }, function (err, doc) {
                if (err) { return next(err); }
                CustObj.findOneAndUpdate({ objID: req.body.objID.objID }, { usr: req.body.userID.username, mapped: "yes" }, function (err, map) {
                    return res.json({ msg: "mapping info added." })
                });
            });

        }
        else {
            var custmap = new Custmap_info();
            custmap.username = req.payload.username;
            custmap.deviceID = req.body.deviceID.deviceID;
            custmap.objectID = req.body.objID.objID;
            custmap.save(function (err) {
                CustObj.findOneAndUpdate({ objID: req.body.objID.objID }, { usr: req.body.userID.username, mapped: "yes" }, function (err, map) {
                    return res.json({ msg: "mapping info added." });
                });
        
            }); 
        }
    });
});


router.post('/AddUser', auth, function (req, res, next) {
    //console.log("asdasdadsad: ",)
    var user  = new User();
    
   
        srs({ length: 6 }, function (err, sr) {
            console.log(sr);
        var user = new User();
            
        user.username = req.body.username;
        
        
        user.setPassword(sr);
        user.role = "user";
        user.customer = req.payload.username;
        user.save(function (err) {
            if (err) {
                
                return res.json({ msg: 'user already exists.' });
            //return next(err);
            }
            
                //else 
                var mailtext = "hello " + req.body.username + ", the password is " + sr;
                var mailOptions = {
                    from: '"vtest098@gmail.com', // sender address 
                    to: req.body.username, // list of receivers 
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
                
            return res.json({ msg: 'user added.' });
            });
        
    });
});

router.post('/addObj', auth, function (req, res, next) {
    //console.log("asdasdadsad: ",)
    var custObj = new CustObj();
    custObj.username = req.payload.username;
    custObj.mapped = "no";
    custObj.type = req.body.type;
    custObj.objID = req.body.objId;
    console.log(req);
    //user.username = req.body.username;
    
    
    custObj.save(function (err) {
        if (err) {
            
            return res.json({ msg: 'error' });
            //return next(err);
        }
        
        return res.json({ msg: 'object added.' });
    });
});




router.post('/revDev', auth, function (req, res, next) {
    console.log(req.body.deviceID.deviceID);
    MapInfo.findOneAndUpdate({ deviceID: req.body.deviceID.deviceID }, { assigned: "no" }, function (err, map) {
        Vehicle_info.remove({ deviceID: req.body.deviceID.deviceID }, function (err) {
            if (err) {
                return res.json({ msg: 'error' });
            }
            else {
                return res.json({ msg: 'device de-allocated.' });
            }
        });
    });
});
router.get('/GetDevInfo', auth, function (req, res, next) {
    console.log("testasasda", req.payload.username);
    
    
    
    
    MapInfo.find({ username: req.payload.username, assigned: 'yes' }).select('deviceID').populate('devIds', 'deviceID').exec(function (err, devices) {
        console.log(devices);
        res.json(devices);
        /*Vehicle_info.find({ username: req.payload.username }).select('deviceID').populate('deviceIDs', 'deviceID').exec(function (err, devices) {
            User.find({ customer: req.payload.username }).select('username').populate('usernames', 'username').exec(function (err, users) {
                var info = devices.concat(objects);
                console.log("deviceID", users);
                res.json(info.concat(users));
            });
        });*/
    });
});




router.post('/addInfo', function (req, res, next) {
    testobj = [{
            objID : 'o123',
            DevID: 'test',
            usr : 'test',
            strBuff1: crypto.createHash('sha256'),
            strBuff2: crypto.createHash('sha256'), 
            strBuff3: crypto.createHash('sha256'),
            strBuff4: crypto.createHash('sha256')
        }, 
        {
            objID : 'o123',
            DevID: 'test',
            usr : 'test',
            strBuff1: crypto.createHash('sha256'),
            strBuff2: crypto.createHash('sha256'), 
            strBuff3: crypto.createHash('sha256'),
            strBuff4: crypto.createHash('sha256')
        }];
    New_DevInfo.create(testobj, function (err, docs) {
        if (err) { 
            return res.json({ msg: err});
        }
        return res.json({ msg: 'device de-allocated.' });
    });
   
});

router.get('/getDevObjects',  function (req, res, next) {
    var dev = [];
    New_DevInfo.find().select("objID").exec(function (err, obj) {
        for (var i = 0; i < obj.length; i++) {
           
                dev.push(obj[i].objID);
            
        }
        console.log(dev);
       /* Custmap_info.find({ "objectID": {  $nin : dev  } }).select("deviceID objectID").exec(function (err, obj) {
            var lstJson = {};
            var lstObjDev = [];
            var lstObj = [];
            console.log(obj);
            for (var i = 0; i < obj.length; i++) {
                
              
            var intersect = obj[i].objectID;
                    _.pullAll(intersect, dev);
                console.log(intersect);
                 //   }
                    lstJson = { deviceID: obj[i].deviceID, objectID: intersect };
                    lstObjDev.push(lstJson);
                    lstobj = [];
                }
                
                
           
            return res.json(lstObjDev);
        });*/
       Custmap_info.aggregate([
            { $project: { "deviceID": 1, objectID: { $setDifference: ["$objectID", dev] } } }, {
                $match:
 { "objectID": { $ne: [] } }
            }, {
                $group: {
                    _id: '$_id',
                    deviceID: { $first: '$deviceID' } ,
                    objectID: {  $first:'$objectID' }
                }
            }
        ]).exec(function (err, d) {
            if (err) {
                return res.json(err);
            }
            else
                return res.json(d);
           
        });
    });




});

router.post('/postHomeLoc', auth,function (req, res, next) {
    
    console.log("testasasda", req.body);
    // return res.json({ msg: "Home location added." });
    var info = JSON.parse(req.body);
    console.log(info);

   User_info.findOneAndUpdate({ username: req.payload.username }, { city: req.body[0].city, location: { longitude: req.body.longitude, latitude: req.body.latitude } }, function (err, map) {
        return res.json({ msg: "Home location added." });
    });  
});


router.post('/postObjPresence', function (req, res, next) {
    
    
    CustObj.findOneAndUpdate({ objID: req.body.objectID }, {presence: req.body.presence }, function (err, obj) {
        return res.json({ msg: "object presence updated" });
    });
});

module.exports = router;