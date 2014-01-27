
/* Holds variables common to all controllers. Trying to make this do as little as possible. */
bbAppControllers.controller('MasterController',
     ['$scope',  function($scope) {
    //Very easy to debug views, just set the mode to one of:    
    //pre_login   - asks user if they attend U of R
    //login       - login form 
    //main_ui     - the ui containing wallet/etc.

    $scope.mode = "login";

    $scope.proceed = function() {
        $scope.mode = "login";
    }

    $scope.uninstall = function() {
        chrome.management.uninstallSelf();
    }

    $scope.bb_raw_data = "";
}]);

/* Handles the logging in logic */
bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', '$location', 'bbLoginService', function($scope, $timeout, $http, $location, bbLoginService) {

    $scope.user = {
        netid: "cwaldren",
        password: "",
    };

    $scope.loginRequestPending = false;
    
    $scope.loginError = {
        msg: "",
        visibile: false
    }
    
    $scope.doLogin = function(form) {
        if (form.$valid) {
            tryBBLogin();
        }
    };

 
    var tryBBLogin = function() {
        $scope.loginRequestPending = true;
        bbLoginService.async($scope.user).then(function(d) {
           if(d.indexOf('topframe.logout.label') !== -1) {
                $scope.$parent.mode = "main_ui"
                $scope.$parent.bb_raw_data = d;
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

bbAppControllers.controller('SettingsController',
    ['$scope', function($scope) {

    $scope.settings = [
        {name: "Remember password", value: false}
    ];

}]);

bbAppControllers.controller('PersonalController',
    ['$scope', 'bbParseService',  function($scope, bbParseService) {

    $scope.person = {
        real_name: "",
        student_id: "",
        po_box: ""
    }

    var parser = new bbParseService($scope.$parent.bb_raw_data)
    $scope.person.real_name = parser.parseName();




    

}]);