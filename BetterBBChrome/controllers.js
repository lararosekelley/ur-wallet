
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
 
}]);

/* Handles the logging in to BB logic */
bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', 'bbLoginService', 'bbRawData', 'ModeService', 
    function($scope, $timeout, $http, bbLoginService, bbRawData, ModeService) {

    $scope.user = {
        netid: "cwaldren",
        password: "",
    };

    
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
        bbLoginService.async($scope.user).then(function(d) {
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


   
}]);

bbAppControllers.controller('MainUIController', 
     ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

        $scope.menuItems = ['Wallet', 'Settings', 'Personal'];
        $scope.selectedItem = 'Wallet';

        $scope.select = function(item) {
            $scope.selectedItem = item;
        }
}])

/* Handles the wallet*/
bbAppControllers.controller('WalletController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

   $scope.funds = {
        uros: 999,
        declining: 789
   }
   
}]);

/* Handles the settings page */
bbAppControllers.controller('SettingsController',
    ['$scope', function($scope) {

    $scope.settings = [
        {name: "Remember password", value: false}
    ];

}]);

/* Handles the personal data page */
bbAppControllers.controller('PersonalController',
    ['$scope', 'bbParseService', 'bbRawData', function($scope, bbParseService, bbRawData) {

    $scope.person = {
        real_name: "",
        student_id: "",
        po_box: ""
    }


    var parser = new bbParseService(bbRawData.get());
    $scope.person.real_name = parser.parseName();    

}]);