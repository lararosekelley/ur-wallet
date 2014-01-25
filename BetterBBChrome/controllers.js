

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

    $scope.sequoia = {
        token_url   : "https://my.rochester.edu/webapps/bb-ecard-sso-bb_bb60/token.jsp",
        auth_url    : "https://ecard.sequoiars.com/eCardServices/AuthenticationHandler.ashx",
        balance_url : "https://ecard.sequoiars.com/eCardServices/eCardServices.svc/WebHttp/GetAccountHolderInformationForCurrentUser",
        token: ""
    }

    $scope.bb = {
        login_url : "https://my.rochester.edu/webapps/login/index"
    }

    $scope.user = {
        netid: "",
        password: "",
    };

    $scope.doLogin = function(form) {
        if (form.$valid) {
            tryBBLogin()

            //$scope.$parent.mode = "wallet";
        }
    };

    var tryBBLogin = function() {

        var postData = {
            user_id: $scope.user.netid,
            encoded_pw: window.btoa($scope.user.password),
            encoded_pw_unicode: ".",
            login: "Login",
            action: "login"
        }
console.log(postData)
        $http({
            withCredentials:true,
            url: $scope.bb.login_url,
            method: "POST",
            data: postData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function (data, status, headers, config) {
            console.log(data)
        }).error(function (data, status, headers, config) {
            console.log("failed")
        });
    }



   
}]);


/* Handles the wallet*/
bbAppControllers.controller('WalletController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

   $scope.funds = {
        euros: 0,
        declining: 0
   }
   
}]);