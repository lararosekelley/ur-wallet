var bbApp = angular.module('bbApp', ['bbAppControllers']);

var bbAppControllers = angular.module('bbAppControllers', []);

bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

    $scope.mode = "login";

}]);
