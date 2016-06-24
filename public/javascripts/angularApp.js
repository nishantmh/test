var app = angular.module('flapperNews', ['ui.router', 'ngMessages']);
var ch;
app.factory('auth', ['$http', '$window', '$state', function ($http, $window, $state) {
        var auth = {};
        auth.saveToken = function (token) {
            $window.localStorage['gpstoken'] = token;
        };
        
        auth.getToken = function () {
            return $window.localStorage['gpstoken'];
        }
        
        auth.isLoggedIn = function () {
            var token = auth.getToken();
            
            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                
                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };
        
        auth.currentUser = function () {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.username;
            }
        };
        
        
        
        auth.changedpass = function () {
            return $http.get('/changedpass', {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.log("within getInfo3.")
                console.dir(data.chpass);
                //angular.copy(data, auth);
                return data.chpass;
              
            });
        }
        
        auth.userRole = function () {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));
                return payload.role;
            }
        };
        auth.register = function (user) {
            return $http.post('/register', user).success(function (data) {
                auth.saveToken(data.token);
            });
        };
        
        auth.logIn = function (user) {
            return $http.post('/login', user).success(function (data) {
                auth.saveToken(data.token);
            });
        };
        
        auth.logOut = function () {
            console.log("logout");
            $window.localStorage.removeItem('gpstoken');
            $window.localStorage.removeItem('lastTab');
            $state.go('login');
        };
        return auth;
    }])
    
   .factory('admin', ['$http', '$window', '$rootScope', 'auth', function ($http, $window,$rootScope, auth) {
        
        
        var o = {};
        var info = [];
        if (info.length != 0) {
            console.log("info", info);
        }
        o.create = function (customer) {
            console.dir(customer);
            return $http.post('/admin/AddCustomer', customer, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                o.msg = data.msg
                
            });
        };
        
        
        o.addDevice = function (device) {
            console.dir(device);
            return $http.post('/admin/AddDevice', device, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                o.msg = data.msg
            });
        };
        
        o.GetInfo = function () {
            console.log("within getInfo2.")
            return $http.get('/admin/mapDevtoCust').success(function (data) {
                console.log("within getInfo3.")
                console.dir(data);
                angular.copy(data, info);
               
                console.log("info1", info);
            });
        };
        
        o.map = function (mapInfo) {
            console.log("mapInfo", mapInfo);
            return $http.post('/map', mapInfo, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                o.msg = data.msg;
                $rootScope.$broadcast('map', {
                    data: 'something'
                });
            
            });
        }
        
        o.upfile = function (file,ad) {
            console.log(file);
            //file.adID = ad;
            var fd = new FormData();
            console.dir(fd.get("file"));
            fd.append('file', file);
           // console.log("ad", file);
          fd.append('ad', JSON.stringify(ad));
           // console.log(fd.get("ad"));
            return $http.post('/admin/uploadAd', fd, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined, Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                o.msg = data.msg;
            });
        }
        if (info.length != 0) {
            return info;
        }
        return o;
    }])
    .factory('customer', ['$http', '$window', '$state','$rootScope', 'auth', function ($http, $window, $state,$rootScope, auth) {
        var info = [];
        
        info.GetMapDevInfo = function () {
            return $http.get('/GetDevicemappedInfo', {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.log("within getInfo3.")
                console.dir(data);
                angular.copy(data, info);
              
            });

            
        };
        
        
        info.addVehicleInfo = function (vehicleInfo) {
            
            return $http.post('/customer/addVehicleInfo', vehicleInfo, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir("inside ad vehicle info");
                info.msg = data.msg;
                $rootScope.$broadcast('map', {
                    data: 'something'
                });
            
            });

           
        };
        
        info.getInfo = function () { 
            return $http.get('/GetInfo', {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.log("within getInfo3.")
                console.dir("testasascaaa",data);
                angular.copy(data, info);
              
            });



        }
        
        info.passChange = function (passinfo) {
            console.dir(passinfo); 
            return $http.post('/changePass', passinfo, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                info.msg = data.msg;
                $state.go('customerHome');
            });
        }
        
        
        info.addUsr = function (usrInfo) {
            return $http.post('/customer/AddUser', usrInfo, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) { 
                info.msg = data.msg;
            });
        }
        
        
        info.mapInfo = function (ObjMap) {
            

            return $http.post('/customer/mapInfo', ObjMap, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                info.msg = data.msg;
                $rootScope.$broadcast('eventFired', {
                    data: 'something'
                });
            });
        }
        
        
        info.objInfo = function (objInfo) { 
            console.log(objInfo);
            return $http.post('/customer/addObj',objInfo, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                info.msg = data.msg;
            });
        }
        
        
        info.remDev = function (dev) { 
            return $http.post('/customer/revDev', dev, {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.dir(data);
                info.msg = data.msg;
                $rootScope.$broadcast('getDevInfo', {
                    data: 'something'
                });
            });
        }
        
        info.getDevInfo = function () { 
            return $http.get('/customer/GetDevInfo', {
                headers: { Authorization: 'Bearer ' + auth.getToken() }
            }).success(function (data) {
                console.log("within getInfo3.")
                console.dir("testDev", data);
                angular.copy(data, info);
               
              
            });
 
        }
        return info;
    }])
     .controller('AdminCtrl', [
    '$scope',
    '$state',
    '$window',
    'admin',
    'auth',
    function ($scope, $state, $window, admin, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.logOut = auth.logOut;

        $scope.customer = {};
        $scope.device = {};
        $scope.ad = {};
       // $scope.myFile = {};
        
        
        
        
        $scope.addCustomer = function () {
            
            admin.create(
                $scope.customer).then(function (data) {
                console.dir(data.data.msg);
                $scope.msg = data.data.msg;

                noty({
                    layout: 'center',
                    text:  $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
                $scope.customer.customername = "";
                $scope.customer.password = "";
            })
               
        };
        
        
        $scope.addDevice = function () {
            console.log("within add device");
            admin.addDevice($scope.device).then(function (data) {
                $scope.msg = data.data.msg;
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
                
                $scope.device.deviceID = "";
                $scope.device.deviceName = "";

            })
        }
        
        $scope.getInfo = function () {
            console.log("within getInfo.")
            admin.GetInfo().then(function (data) {
                console.dir("test d",data.data);
                $scope.info = data.data;
                
                $scope.deviceInfo = [];
                $scope.customerInfo = [];
                
                for (var i = 0; i < $scope.info.length; i++) {
                    
                    if ($scope.info[i].hasOwnProperty("deviceID")) {
                     
                        $scope.deviceInfo.push($scope.info[i]);
                    }
                    else {
                        $scope.customerInfo.push($scope.info[i]);
                    }
                }
                
                
                console.log("deviceinfo", $scope.deviceInfo);
                console.log("customerinfo", $scope.customerInfo);
                console.log($scope.info);
            });
        }
        $scope.$on('map', function (event, data) {
            console.log("inside on");
            $scope.getInfo();
        });

        $scope.mapDevice = function () {
            admin.map(
                $scope.map).then(function (data) {
                console.dir(data.data.msg);
                $scope.msg = data.data.msg;
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
                $scope.map.username = "";
                $scope.map.deviceID = "";
               
            })
               
        };




        $scope.upload = function () {
          
            admin.upfile($scope.myFile,$scope.ad).then(function (data) {
                console.dir(data.data.msg);
                $scope.msg = data.data.msg;
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
               
            });
        };
    
    }])
    .controller('AuthCtrl', [
    '$scope',
    '$state',
    'auth',
    function ($scope, $state, auth) {
        $scope.user = {};
        
        $scope.register = function () {
            auth.register($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                var role = auth.userRole();
                console.log("role", role);
                if (role === 'admin') {
                    $state.go('AdminHome');
                }
                else {
                   // var pass = auth.changedpass();
                    console.log("ch3");
                    if (ch === "no") {
                        $state.go('changePass');
                    }
                    else {
                        $state.go('customerHome');
                    }
                }
            });
        };
        
        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
                console.log($scope.error.message);
                noty({
                    layout: 'center',
                    text: $scope.error.message,
                    theme: 'relax',
                    type: 'success',
                    timeout: 1000,
                });

            }).then(function () {
                var role = auth.userRole();
                
                console.log("role", role);
                if (role === 'admin') {
                    $state.go('AdminHome');
                }
                else {
                    auth.changedpass().then(function (data) { 
                        console.log("ch1");
                        console.log("ch1test", data);
                        ch = data.data.chpass;
                        if (ch === "no") {

                            $state.go('changePass');

                        }
                        else
                            $state.go('customerHome');
                                        
                    
                    });
                   /* console.log("ch1");
                    console.log("ch1test", ch);
                    if (ch === "no") {
                        $state.go('changePass');
                    }
                    else
                        $state.go('customerHome');*/
                }
            });
        };


    }])
    .controller('CustCtrl', [
    '$scope',
    '$state',
    '$window',
    'auth',
    'customer',
    function ($scope, $state,$window, auth, customer) {
        $scope.device = {};
        $scope.ObjMap = {};
        $scope.user = {};
        $scope.obj = {};
        $scope.dev = {};
        
        $scope.logOut = auth.logOut;
        $scope.mappedDevices = function () {
            $scope.devices = [];
            customer.GetMapDevInfo().then(function (data) {
                console.log(data.data);
                $scope.devices = data.data;
                console.log("test", $scope.devices);




            });

        };

        $scope.AddUsrInfo = function () {
            
            customer.addUsr($scope.usr).then(function (data) {
                $scope.msg = data.data.msg;
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
                $scope.username = "";
                $scope.password = "";


            });

        };
        
        $scope.changePass = function () {
            console.log("within add device");
            customer.passChange($scope.user).then(function (data) {
                $scope.msg = data.data.msg;
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
                
                $scope.user.password = "";
                $scope.device.deviceName = "";

            });
        };
        
        $scope.AddVehicleInfo = function () {
            console.log($scope.device);
            customer.addVehicleInfo(
                $scope.device).then(function (data) {
                console.dir(data.data.msg);
                $scope.msg = data.data.msg;
                
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });


                $scope.device.vID = "";
                $scope.device.rtoNo = "";
                $scope.device.deviceID = "";

            });

        };
        
        $scope.getInfo = function (){
            customer.getInfo().then(function (data) {
                console.log("test123", data.data);
                
                
                
                $scope.data = data.data;
                $scope.deviceInfo = [];
                $scope.objectInfo = [];
                $scope.userInfo = [];
                console.log("data test",data.data);
                
                for (var i = 0; i < data.data.length; i++) {
                    
                    if ($scope.data[i].hasOwnProperty("deviceID")) {
                        //console.log($scope.info[i]);
                        $scope.deviceInfo.push($scope.data[i]);
                    }
                    else if ($scope.data[i].hasOwnProperty("objID")) {
                        $scope.objectInfo.push($scope.data[i]);
                    }
                    else if($scope.data[i].hasOwnProperty("username")){ 
                        $scope.userInfo.push($scope.data[i]);
                    }
                }
                console.log($scope.deviceInfo);
                console.log($scope.objectInfo);
                console.log("userIDs:",$scope.userID);
            });
        };

            $scope.AddmapInfo = function () {
               
                customer.mapInfo(
                    $scope.ObjMap).then(function (data) {
                    console.dir(data.data.msg);
                    $scope.msg = data.data.msg;
                    noty({
                        layout: 'center',
                        text: $scope.msg,
                        theme: 'relax',
                        type: 'success',
                        timeout: 3000,
                    });


                    $scope.ObjMap.deviceID = "";
                    $scope.ObjMap.objID = "";
                });

            };
            
            $scope.$on('eventFired', function (event, data) {
                $scope.getInfo();
            });
            
            
            $scope.$on('map', function (event, data) {
                console.log("inside on");
                $scope.mappedDevices();
            });

            $scope.AddObjInfo = function () {
               
                console.log("object", $scope.obj);
                customer.objInfo($scope.obj).then(function (data) {
                    $scope.msg = data.data.msg;
                    noty({
                        layout: 'center',
                        text: $scope.msg,
                        theme: 'relax',
                        type: 'success',
                        timeout: 3000,
                    });
                    
                    
                    $scope.obj.objId = "";
                    $scope.obj.type = "";
                });
            };

           
        
        
        $scope.removeDev = function () { 
            customer.remDev($scope.dev).then(function (data) {
                $scope.msg = data.data.msg;
                noty({
                    layout: 'center',
                    text: $scope.msg,
                    theme: 'relax',
                    type: 'success',
                    timeout: 3000,
                });
                
                
                $scope.dev.deviceID= "";
               // $scope.obj.type = "";
                //$window.location.reload();
            });
        }
        $scope.getDevInfo = function () {
            console.log("nishant");
            customer.getDevInfo().then(function (data) {
                console.log("test123", data.data);
                
                
                
                $scope.devInfo = data.data;
                
                
               
                    console.log($scope.devInfo);
                    
            });
        };
        
        $scope.$on('getDevInfo', function (event, data) {
            $scope.getDevInfo();
        });
    }])
    .controller('NavCtrl', [
    '$scope',
    'auth',
    function ($scope, auth) {
        console.log("nishant");
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }])

    .config([
	'$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
	function ($stateProvider, $urlRouterProvider, $locationProvider) {
		
        $stateProvider
    .state('customerHome', {
            url: '/customerHome',
            templateUrl: '/customerHome.html',
            controller: 'CustCtrl',
            onEnter: ['$state', '$window','auth', function ($state,$window, auth) {
                    console.log(auth.isLoggedIn());
                    
                    if (!auth.isLoggedIn()) {
                        $state.go('login');
                        
                    }
                    else {
                        var role = auth.userRole();
                        
                        if (role === "customer") {
                            auth.changedpass().then(function (data) {
                                ch = data.data.chpass;
                           
                            console.log("testkkkk");
                            console.log("chkkkk", ch);
                                if (ch === "no") {
                                   Debug
                                    $state.go('changePass');
                                    $window.location.reload();
                                   
                            } 
                            });
                        }
                    }
                }]

          
        })
    .state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', 'admin', function ($state, auth, admin) {
                    console.log("hi", auth.isLoggedIn());
                    if (auth.isLoggedIn()) {
                        console.log(admin);
                        var role = auth.userRole();
                        // var ch = auth.changedpass();
                        auth.changedpass().then(function (data) { 
                            ch = data.data.chpass;
                        }); 
                        if (role === 'admin') {
                            console.log("hi123", auth.isLoggedIn());
                            $state.go('AdminHome');
                        }
                        else {
                            
                         
                                $state.go('customerHome');

                        }
                    }
                }]
        })
         .state('AdminHome', {
            url: '/AdminHome',
            templateUrl: '/AdminHome.html',
            controller: 'AdminCtrl',
            onEnter: ['$state', 'auth', function ($state, auth) {
                    if (!auth.isLoggedIn()) {
                        $state.go('login');
                    }
                    var role = auth.userRole();
                    if (role === "customer") {
                        if (ch === "no") { 
                            $state.go('changePass');
                        }
                        else
                        $state.go('customerHome');
                    }
                }]
        })
         .state('changePass',{
            url: '/changePass',
            templateUrl: '/changePass.html',
            controller: 'CustCtrl',
            OnExit: ['$state', 'auth', function ($state, auth) {
                    auth.changedpass().then(function (data) { 
                        ch = data.data.chpass;
                    });
                }]
           
               
        })
.state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth', function ($state, auth) {
                    if (auth.isLoggedIn()) {
                        $state.go('home');
                    }   
                }]
        });
      
      
        //$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('login');
    }])

    .directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                
                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);
