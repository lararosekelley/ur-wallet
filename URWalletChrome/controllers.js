var storage = localStorage;
var log = function(msg) {
    console.log("URWallet: " + msg);
}
var err = function(msg) {
    console.log("URWallet (error): " + msg);
}

/* Holds variables common to all controllers. Trying to make this do as little as possible. */
bbAppControllers.controller('MasterController',
     ['$scope', '$http', 'ModeService',  function($scope, $http, ModeService) {
    //Very easy to debug views, just set the mode to one of:    
    //pre_login   - asks user if they attend U of R
    //login       - login form 
    //main_ui     - the ui containing wallet/etc.
    log("URWallet initiated.");






    $scope.remember = storage["remember"] == undefined? false : true;

    var mode = $scope.remember? 'login' : 'pre_login';
    ModeService.set(mode);

    $scope.proceed = function() {
       ModeService.set("login")
    }

    $scope.uninstall = function() {
        chrome.management.uninstallSelf();
    }

    $scope.logout = function() {
        $http.get("https://my.rochester.edu/webapps/login/?action=logout");
    }

    $scope.logoutAndDestroy = function() {
        $scope.logout();
        storage.clear();
        localStorage.clear();
        window.close();
    }

    $scope.getMode = function() {
        return ModeService.get();
    }

    $scope.writeUserCredentials = function() {
        log("Writing user credentials.:"+ window.btoa($scope.user.netid));
        storage["netid"]    = window.btoa($scope.user.netid);
        storage["password"] = window.btoa($scope.user.password);
    };

    $scope.readUserCredentials = function() {
        log("Reading user credentials.");
        return {
            netid:    window.atob(storage["netid"]),
            password: window.atob(storage["password"])
        }
    };

    $scope.writeUserInfo = function(info) {
        log("Writing user info.");
        storage["email"]     = info.email;
        storage["studentID"] = info.studentID;
        storage["fullName"]  = info.fullName;
        storage["firstName"] = info.firstName;
        storage["lastName"] = info.lastName;
        
    }

    $scope.readUserInfo = function() {
        log("Reading user info.");
        if (storage["email"] && storage["fullName"] && storage["studentID"]) {
            return {
                email: storage["email"],
                studentID: storage["studentID"],
                fullName: storage["fullName"],
                firstName: storage["firstName"],
                lastName: storage["lastName"]
            }
        }

        return false;
    }

     $scope.user = {
        netid: "",
        password: ""
    }
 
}]);

/* Handles the logging in to BB logic */
bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', 'bbLoginService', 'bbRawData', 'ModeService', 
    function($scope, $timeout, $http, bbLoginService, bbRawData, ModeService) {

    log("Control passed to LoginController.");

   

    $scope.loginError = {
        msg: "",
        visibile: false
    }

    $scope.loginRequestPending = false;
    

    $scope.doLogin = function(form) {
        if (form.$valid) {
            log("Login form valid. Attempting BB login.");
            tryBBLogin();
        }
    };

 
    var tryBBLogin = function() {
        $scope.loginRequestPending = true;
        bbLoginService.async($scope.user).then(function(d) {
            if(d.success) {
                log("BB login success.");  
                bbRawData.set(d.data);
                ModeService.set("main_ui");
                if (!$scope.remember){$scope.writeUserCredentials();}
            } else {
                err("BB login failed. (wrong netid/pass?)");
                setError("wrong netid/pass");
            }
         
        }, 
        function(errorMsg) {
            err(errorMsg);
            setError(errorMsg);
        })


    }

    var setError = function(msg) {
        $scope.loginError.msg = msg;
        $scope.loginError.visible = true;
        $scope.loginRequestPending = false;
        $timeout(function() {
            $scope.loginError.visible = false;
        }, 2000);
    };

    

    if (storage["remember"] == "true") {
        log("'Remember me' active. Attempting BB login.");
        $scope.user = $scope.readUserCredentials();
        tryBBLogin();
    }
   
}]);

bbAppControllers.controller('MainUIController', 
     ['$scope', '$timeout', '$http', '$location', 'SequoiaService', function($scope, $timeout, $http, $location, SequoiaService) {
        log("Control passed to MainUIController");

        $scope.menuItems = ['Wallet', 'Personal', 'Settings'];
        $scope.selectedItem = 'Wallet';

        $scope.select = function(item) {
            $scope.selectedItem = item;
        }


}])

/* Handles the wallet*/
bbAppControllers.controller('WalletController', 
    ['$scope', '$timeout', '$http', '$location', 'SequoiaService', function($scope, $timeout, $http, $location, SequoiaService) {
    log("Control passed to WalletController");

   $scope.Math = window.Math;
   $scope.updating = true;

  
    var updateLocalStorage = function() {
       SequoiaService.authenticate().then(function(){        
                log("Sequoia auth success.");
                SequoiaService.fetchFunds().then(function(f) {
                    log("Sequoia fetch funds success.");
                    storage["uros"]      = f.uros;
                    storage["declining"] = f.declining; 
                    storage["raw_uros"]  = f.uros.substring(1);
                    storage["raw_declining"] = f.declining.substring(1);
                    storage["timestamp"] = new Date().getTime();
                    log("Updated funds with fresh data")

                    $scope.funds = {
                        uros: storage["uros"],
                        declining: storage["declining"],
                        raw_uros: storage["raw_uros"],
                        raw_declining: storage["raw_declining"]
                    }

                    $scope.updating = false;
                }, function(fundsError) {
                    err("Sequoia fetch funds error:" + fundsError);
                });
          
       }, function(authError) {
            err("Sequoia auth error:" + authError);
       });
    }

   $scope.sequoiaError = {
        msg: "",
        visible: false
   }

    /* we have local storage of the funds */
   if (storage["timestamp"]) {
         /* check if stale */
        if (new Date().getTime() - storage["timestamp"] > 60000) {
            updateLocalStorage();
        } else {
             $scope.funds = {
                uros: storage["uros"],
                declining: storage["declining"],
                raw_uros: storage["raw_uros"],
                raw_declining: storage["raw_declining"]
            }
            $scope.updating = false;
        }   
   } 
   /* fresh install */
   else {
        updateLocalStorage()
   }



   

   
   
}]);

/* Handles the settings page */
bbAppControllers.controller('SettingsController',
    ['$scope', '$http',function($scope,$http) {
    log("Control passed to SettingsController.");

    $scope.settings = [
        {name: "Remember me", key:"remember", value: true}
    ];

   
    storage["remember"] = storage["remember"] == undefined? "true" : storage["remember"];
    for (var i = 0; i < $scope.settings.length; i++) {
        if (storage[$scope.settings[i].key]) {
            $scope.settings[i].value = JSON.parse(storage[$scope.settings[i].key]);
        }
    }

    $scope.updateSetting = function(setting) {

        //Flip values
        setting.value = !setting.value;
        storage[setting.key] = setting.value

        switch(setting.key) {
            case "remember":
                log("Updating setting 'remember'");
                if (setting.value === "true") {
                    $scope.writeUserCredentials();
                } else {
                    log("   Deleting all.");
                   storage.clear();
                   localStorage.clear()
                    $scope.logout();
                }      
        }
    }



   
}]);

/* Handles the personal data page */
bbAppControllers.controller('PersonalController',
    ['$scope', 'bbParseService', 'bbRawData', 'SequoiaService', function($scope, bbParseService, bbRawData, SequoiaService) {

    log("Control passed to PersonalController");

    $scope.person = $scope.readUserInfo();
    console.log()
    if (!$scope.person) {
        SequoiaService.authenticate().then(function(d){
                log("Sequoia auth success.");
                SequoiaService.fetchUserInfo().then(function(info) {
                   log("Sequoia fetch user info success.");
                   $scope.writeUserInfo(info);
                   $scope.person = $scope.readUserInfo();
                }, function(fetchInfoErr) {
                    err("Sequoia fetch user info error: " + fetchInfoErr);
                });
        }, function(authErr) {
            err("Sequoia auth error: " + authErr);
        });
    }



    // var parser = new bbParseService(bbRawData.get());
    // $scope.person.real_name = parser.parseName();  
    // storage["name"] = $scope.person.real_name;  

}]);