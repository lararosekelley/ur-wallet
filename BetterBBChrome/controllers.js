var bbApp = angular.module('bbApp', ['bbAppControllers']);

var bbAppControllers = angular.module('bbAppControllers', []);

bbAppControllers.controller('MasterController',
     ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {
    //The mode of the page, login or main_view or something
    $scope.mode = "pre_login";

     $scope.uninstall = function() {
        chrome.management.uninstallSelf();
    }

}]);

bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

   
    $scope.user = {
        netid: "",
        password: "",
    };

    $scope.doLogin = function(form) {
        if (form.$valid) {
            alert("yup")
        }
    };

   
}]);
