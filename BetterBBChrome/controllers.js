var storage = localStorage;


/* Holds variables common to all controllers. Trying to make this do as little as possible. */
bbAppControllers.controller('MasterController',
     ['$scope', 'ModeService',  function($scope, ModeService) {
    //Very easy to debug views, just set the mode to one of:    
    //pre_login   - asks user if they attend U of R
    //login       - login form 
    //main_ui     - the ui containing wallet/etc.

    ModeService.set("login");

    $scope.proceed = function() {
       ModeService.set("login")
    }

    $scope.uninstall = function() {
        chrome.management.uninstallSelf();
    }

    $scope.getMode = function() {
        return ModeService.get();
    }

    $scope.user = {
        netid: "",
        password: "",
    };

    if (storage["netid"])
        $scope.user.netid = storage["netid"];
    if (storage["password"])
        $scope.user.password= storage["password"];
 
}]);

/* Handles the logging in to BB logic */
bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', 'bbLoginService', 'bbRawData', 'ModeService', 
    function($scope, $timeout, $http, bbLoginService, bbRawData, ModeService) {


    $scope.loginError = {
        msg: "",
        visibile: false
    }

    $scope.loginRequestPending = false;
    

    $scope.doLogin = function(form) {
        if (form.$valid) {
            tryBBLogin();
        }
    };

  
    

 
    var tryBBLogin = function() {
        $scope.loginRequestPending = true;
        bbLoginService.async($scope.$parent.user).then(function(d) {
            if(d.success) {
               

                bbRawData.set(d.data);
                ModeService.set("main_ui");
            } else {
                setError("wrong netid/pass");
            }
         
        }, 
        function(errorMsg) {
            setError(errorMsg);
        })


    }

    var setError = function(msg) {
        $scope.loginError.msg = msg;
        $scope.loginError.visible = true;
        $scope.loginRequestPending = false;
        console.log("Error: " + msg);
        $timeout(function() {
            $scope.loginError.visible = false;
        }, 2000);
    }

      if (storage["remember"] == "true") {
        tryBBLogin();
    }
   
}]);

bbAppControllers.controller('MainUIController', 
     ['$scope', '$timeout', '$http', '$location', 'SequoiaService', function($scope, $timeout, $http, $location, SequoiaService) {

        $scope.menuItems = ['Wallet', 'Settings', 'Personal'];
        $scope.selectedItem = 'Wallet';

        $scope.select = function(item) {
            $scope.selectedItem = item;
        }


        $scope.authenticated = false;


}])

/* Handles the wallet*/
bbAppControllers.controller('WalletController', 
    ['$scope', '$timeout', '$http', '$location', 'SequoiaService', function($scope, $timeout, $http, $location, SequoiaService) {

   $scope.funds = null;

   $scope.sequoiaError = {
        msg: "",
        visible: false
   }

   SequoiaService.authenticate().then(function(d){
        if (d) {
            SequoiaService.fetchFunds().then(function(funds) {
                $scope.funds = funds;
            });
        } 
   });
   
}]);

/* Handles the settings page */
bbAppControllers.controller('SettingsController',
    ['$scope', function($scope) {

    $scope.settings = [
        {name: "Remember me", key:"remember", value: false}
    ];

   
    for (var i = 0; i < $scope.settings.length; i++) {
        if (storage[$scope.settings[i].key]) {
            $scope.settings[i].value = JSON.parse(storage[$scope.settings[i].key]);
        }
    }

    $scope.updateSetting = function(setting) {
        setting.value = !setting.value;
        storage[setting.key] = setting.value

        //this logic is temporary
        if (setting.key = "remember") {
            if (setting.value) {
                storage["netid"] = $scope.$parent.user.netid;
                storage["password"] = $scope.$parent.user.password;
            } else {
                storage.removeItem("netid");
                storage.removeItem("password");
                storage.removeItem("email");
                storage.removeItem("studentID");
                storage.removeItem("name");
            }      
        }
    }

   
}]);

/* Handles the personal data page */
bbAppControllers.controller('PersonalController',
    ['$scope', 'bbParseService', 'bbRawData', 'SequoiaService', function($scope, bbParseService, bbRawData, SequoiaService) {

    $scope.person = {
        real_name: "",
        student_id: "",
        po_box: "",
        email: ""
    }

    if (!(storage["studentID"] && storage["email"] && storage["name"])) {
        SequoiaService.authenticate().then(function(d){
            if (d) {
                SequoiaService.fetchUserInfo().then(function(info) {
                   $scope.person.student_id = info.student_id;
                   $scope.person.email = info.email;
                   storage["studentID"] = info.student_id;
                   storage["email"] = info.email;
                });
            } 
       });
    } else {
        $scope.person.real_name     = storage["name"];
        $scope.person.student_id    = storage["studentID"];
        $scope.person.email         = storage["email"];
    }

    var parser = new bbParseService(bbRawData.get());
    $scope.person.real_name = parser.parseName();  
    storage["name"] = $scope.person.real_name;  

}]);