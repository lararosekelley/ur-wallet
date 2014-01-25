var bbApp = angular.module('bbApp', ['bbAppControllers']);

var bbAppControllers = angular.module('bbAppControllers', []);

/* Holds variables common to all controllers */
bbAppControllers.controller('MasterController',
     ['$scope',  function($scope) {
    //View modes:    
    //pre_login   - asks user if they attend U of R
    //login       - login form 
    //wallet       - shows euros and declining
    $scope.mode = "pre_login";

    $scope.proceed = function() {
        $scope.mode = "login";
    }

    $scope.uninstall = function() {
        chrome.management.uninstallSelf();
    }

}]);

/* Handles the logging in logic */
bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

   
    $scope.user = {
        netid: "",
        password: "",
    };

    $scope.doLogin = function(form) {
        if (form.$valid) {
            $scope.$parent.mode = "wallet";
        }
    };

   
}]);


/* Handles the wallet*/
bbAppControllers.controller('WalletController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

   $scope.funds = {
        euros: 0,
        declining: 0
   }
   
}]);