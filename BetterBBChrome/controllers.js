
/* Holds variables common to all controllers */
bbAppControllers.controller('MasterController',
     ['$scope',  function($scope) {
    //View modes:    
    //pre_login   - asks user if they attend U of R
    //login       - login form 
    //wallet       - shows euros and declining
    $scope.mode = "login";

    $scope.proceed = function() {
        $scope.mode = "login";
    }

    $scope.uninstall = function() {
        chrome.management.uninstallSelf();
    }

}]);

/* Handles the logging in logic */
bbAppControllers.controller('LoginController', 
    ['$scope', '$timeout', '$http', '$location', 'bbLoginService', function($scope, $timeout, $http, $location, bbLoginService) {

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
            tryBBLogin()

            //$scope.$parent.mode = "wallet";
        }
    };

 
    var tryBBLogin = function() {
        $scope.loginRequestPending = true;
        bbLoginService.async($scope.user).then(function(d) {
           if(d.indexOf('topframe.logout.label') !== -1) {
                $scope.$parent.mode = "wallet"
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


/* Handles the wallet*/
bbAppControllers.controller('WalletController', 
    ['$scope', '$timeout', '$http', '$location', function($scope, $timeout, $http, $location) {

   $scope.funds = {
        uros: 999,
        declining: 789
   }
   
}]);