var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var GCM = require('gcm').GCM;
var geolib = require('geolib');
var distance = require('google-distance-matrix');
distance.key('AIzaSyAJdsCPhYOyUy1QvSapD-8IXuAZwEziPPY');
distance.units('metric');

var apiKey = 'AIzaSyAJdsCPhYOyUy1QvSapD-8IXuAZwEziPPY';
var gcm = new GCM(apiKey);




require('./models/User');
require('./models/deviceInfo');
require('./models/mapInfo');
require('./models/vehicle_info.js');
require('./models/custObj.js');
require('./models/Custmap_info.js');
require('./models/user_info.js');
require('./models/Ad_info.js');
require('./models/new_DevInfo.js');



require('./config/passport');
var ConnectRoles = require('connect-roles');


var passport = require('passport');
var routes = require('./routes/index');
var admin = require('./routes/admin');
var customer = require('./routes/customer');
var device = require('./routes/device');
var users = require('./routes/users');
mongoose.connect('mongodb://localhost/gpstest123');

var Custobj = mongoose.model('custObj');
var Custmap_info = mongoose.model('custmap_info');
var User_info = mongoose.model('user_info');

if (process.env.OPENSHIFT_MONGODB_DB_URL) {
    mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + "mongodb://localhost/gpstest123";
}

var app = express();
//var server = require('http').createServer(app);
//var io = require('socket.io')(server);
var socket_io = require("socket.io");
var io = socket_io();
app.io = io;
var msg = null;
var clients = [];
io.on('connection', function (socket) {

    console.log("connected", socket.id);
    
    var datetime = new Date();
    console.log(datetime);

    socket.on('message', function (msg) {
        
        var test = { usr : msg.usr, ids: socket.id };
        var devId = msg.token;
        console.log(msg);
        clients.push(test);
        
        console.dir(clients);         //msg = {usr : "", qty: ""}
        User_info.findOne({ username: msg.usr }).exec(function (err, devUsr) {
           
            if (devUsr && devId && devUsr.deviceId !== devId) {
                
                User_info.findOneAndUpdate({ username: msg.usr }, { "deviceId": devId},
                             { safe: true, upsert: true },
                                function (err, model) {
                    if (model) {
                        console.log("record updated successfully.")
                    }
                });
            }
            else if (!devUsr){
                var user_info = new User_info();
                user_info.username = msg.usr;
                user_info.deviceId = devId;
                console.log("deviceID", devId);
                user_info.save(function (err) {
                    if (err) {
                        console.log("error occured.");
                    }
                });

            }
        
        });
        Custobj.find({ usr: msg.usr }).select("objID").exec(function (err, users) {
           
            var objID = [];
            for (u in users) {
                dv = users[u];
                if (dv.objID) { 
                    objID.push(dv.objID); 
                }
                
            }
           
            Custmap_info.find({ objectID: { $in : objID }}).select("objectID Location").exec(function (err, devices) {
               // console.log(devices);
                var dev = [];
                var test1 = [];
                for (o in objID) {
                    for (d in devices) {
                        div = devices[d];
                       //  test = {Location : devices[d].Location}
                       
                        
                        for (obj in div.objectID) {
                          
                            test1 = { Location : devices[d].Location, objectID: objID[o] };
                         
                            if (div.objectID[obj] === objID[o]) {
                                dev.push(test1);
                            }
                           
                        }
                    }
                    
                   
                }
               // dev.username = test.usr;
                
                var msg = { data: dev , username: test.usr };
               
                console.log(msg);
                io.to(test.ids).emit("message", msg);
            });

        });
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
        for (i in clients) {
            if (clients[i].ids === socket.id) { 
                clients.splice(i, 1);
            }
        }
    });
 
   
    
});
    
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static((__dirname + '/public')));
app.use(passport.initialize());
app.set('socketio', io);

app.post('/GpsData', function (req, res, next) {
    console.log(req.body);
   
    Custmap_info.findOneAndUpdate({ "deviceID": req.body.deviceID }, { $push: { "Location": { "longitude": req.body.ln, "latitude": req.body.lt, date: req.body.date } } },
    { safe: true, upsert: true },
    function (err, model) {
        console.log(err);
        if (model) {
            
            Custmap_info.find({ "deviceID": req.body.deviceID }).select("objectID").exec(function (err, objs) {
                
                var objID1 = objs[0].objectID;
                
                
                Custobj.find({ objID: { $in : objID1 } }).select("usr objID").exec(function (err, users) {
                    
                    for (j in users) {
                        console.log(users[j].objID);
                        for (u in clients) {
                            console.log(users[j].usr);
                            if (clients[u].usr === users[j].usr) {
                                console.log("Emitting Update...");
                                                                                                                // "22-04-2016 9:00:00am"
                                msg = { Location : { latitude : req.body.lt, longitude: req.body.ln , date: req.body.date }, objectID: users[j].objID };
                                console.log(msg);
                                io.to(clients[u].ids).emit('updateMsg', msg);
                                User_info.find({ username: users[j].usr }).exec(function (err, userInfo) {
                                    var loc = userInfo[0].location;
                                   /* geolib.getDistance(
                                        { latitude: loc.latitude, longitude: loc.longitude },
                                        { latitude: req.body.lt, longitude: req.body.ln }, function (err, doc) {
                                            console.log(doc);
                                        });*/
                                   var origins = [loc.longitude+","+loc.latitude];
                                    var destinations = [req.body.lt+ "," +req.body.ln];
                                  /*  var message = {
                                        registration_id: userInfo[0].deviceId, // required
                                        collapse_key: 'Collapse_key', 
                                        'data.Title': 'Location updated',
                                        'data.msg': 'value2'
                                    };
                                    gcm.send(message, function (err, messageId) {
                                        if (err) {
                                            console.log("Something has gone wrong!");
                                        } else {
                                            console.log("Sent with message ID: ", messageId);
                                        }
                                    });*/
                                   /* distance.matrix(origins, destinations, function (err, distances) {
                                        if (!err)
                                            console.log(distances.rows[0].elements);
                                        var num = parseInt(distances.rows[0].elements[0].distance.value);
                                        if (num <= 2000) { 
                                            var message1 = {
                                                registration_id: userInfo[0].deviceId, // required
                                                collapse_key: 'Collapse_key', 
                                                'data.Title': 'the object is near your home location',
                                                'data.msg': num
                                            };
                                            gcm.send(message1, function (err, messageId) {
                                                if (err) {
                                                    console.log("Something has gone wrong!");
                                                } else {
                                                    console.log("Sent with message ID: ", messageId);
                                                }
                                            });
                                        }
                                    });*/
                                   /* var message = {
                                        registration_id: userInfo[0].deviceId, // required
                                        collapse_key: 'Collapse_key', 
                                        'data.Title': 'Location updated',
                                        'data.msg': 'value2'
                                    };
                                    gcm.send(message, function (err, messageId) {
                                        if (err) {
                                            console.log("Something has gone wrong!");
                                        } else {
                                            console.log("Sent with message ID: ", messageId);
                                        }
                                    });*/
                                });
                               
                                
                                console.log("Update Emmited");
                                
                               
                            }
                            /*else {
                                User_info.find({ username: users[j].usr }).exec(function (err, userInfo) { 
                                    var message = {
                                        registration_id: userInfo.deviceId, // required
                                        collapse_key: 'Collapse key', 
                                        'data.key1': 'Location updated',
                                        'data.key2': 'value2'
                                    };
                                })
                               
                            }*/
                        }
                        
                        User_info.find({ username: users[j].usr }).exec(function (err, userInfo) {
                            console.log(userInfo);
                            var message = {
                                registration_id: userInfo[0].deviceId, // required
                                collapse_key: 'Collapse key', 
                                'data.Title': 'Location updated',
                                'data.msg': 'value2'
                            };
                            gcm.send(message, function (err, messageId) {
                                if (err) {
                                    console.log("Something has gone wrong!");
                                } else {
                                    console.log("Sent with message ID: ", messageId);
                                }
                            });
                        });
                               
                       
                   
                    }
                    return res.json("success");  
                });
           
                
            });
            
                
        }
    });

 
  
});

app.use('/', routes);
app.use('/admin', admin);
app.use('/customer', customer);
app.use('/users', users);
app.use('/device', device);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});




// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
