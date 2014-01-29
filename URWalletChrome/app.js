//Make ajax requests behave
var bbApp = angular.module('bbApp', ['bbAppControllers', 'ngAnimate'], function($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.withCredentials = true;

  // Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data)
  {
    /**
     * The workhorse; converts an object to x-www-form-urlencoded serialization.
     * @param {Object} obj
     * @return {String}
     */ 
    var param = function(obj)
    {
      var query = '';
      var name, value, fullSubName, subName, subValue, innerObj, i;
      
      for(name in obj)
      {
        value = obj[name];
        
        if(value instanceof Array)
        {
          for(i=0; i<value.length; ++i)
          {
            subValue = value[i];
            fullSubName = name + '[' + i + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        }
        else if(value instanceof Object)
        {
          for(subName in value)
          {
            subValue = value[subName];
            fullSubName = name + '[' + subName + ']';
            innerObj = {};
            innerObj[fullSubName] = subValue;
            query += param(innerObj) + '&';
          }
        }
        else if(value !== undefined && value !== null)
        {
          query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
      }
      
      return query.length ? query.substr(0, query.length - 1) : query;
    };
    
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
});


/* Constants */
bbApp.constant('bbUrls', {
  login: "https://my.rochester.edu/webapps/login/index"
});

bbApp.constant('sequoiaUrls', {
  token: "https://my.rochester.edu/webapps/bb-ecard-sso-bb_bb60/token.jsp",
  auth: "https://ecard.sequoiars.com/eCardServices/AuthenticationHandler.ashx",
  balance: "https://ecard.sequoiars.com/eCardServices/eCardServices.svc/WebHttp/GetAccountHolderInformationForCurrentUser",
  user: "https://ecard.sequoiars.com/eCardServices/eCardServices.svc/WebHttp/GetStudentForCurrentUser"
});


/* Service to log into blackboard */
bbApp.factory('bbLoginService', function($http, $q, bbUrls) {
  return {
    async: function(user) {
      var deferred = $q.defer();
      var postData = {
            user_id: user.netid,
            encoded_pw: window.btoa(user.password),
            encoded_pw_unicode: ".",
            login: "Login",
            action: "login"
      }
      $http({
            withCredentials:true,
            url: bbUrls.login,
            method: "POST",
            data: postData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).success(function(resp) {
            deferred.resolve({success:resp.indexOf('topframe.logout.label') !== -1, data: resp});
        }).error(function(resp) {
            deferred.reject("bb connection fail")
        });
        return deferred.promise;
    }
  };
});

/* Service to authenticate and retrieve data from Sequoia */
bbApp.factory('SequoiaService', function($http, $q, $parse, sequoiaUrls) {
    return {
        authenticate: function() {
            var deferred = $q.defer();
            $http.get(sequoiaUrls.token).success(function(data) {

                /* grab the auth token */
                var query = 'AUTHENTICATIONTOKEN" value="';
                var beginIndex = data.indexOf(query) + query.length;
                data           = data.slice(beginIndex);
                var endIndex   = data.indexOf('"');
                var token      = data.substring(0, endIndex);
            
                /* post it to finish up the auth */
                $http.post(sequoiaUrls.auth, {AUTHENTICATIONTOKEN: token}).success(function(data) {
                    deferred.resolve("auth success!");
                }).error(function() {
                    deferred.reject("couldn't post auth token");
                });
            }).error(function() {
                deferred.reject("couldn't contact sequoia");
            })
            return deferred.promise;
        },

        fetchFunds: function() {
            var deferred = $q.defer();
            $http.post(sequoiaUrls.balance, {}).success(function(data) {
                var json = angular.fromJson(data);
                var uros = json.d._ItemList[0].BalanceInDollarsStr.replace(/\s+/g, '');
                var dec  = json.d._ItemList[1].BalanceInDollarsStr.replace(/\s+/g, '');
                deferred.resolve({uros: uros, declining: dec});
            }).error(function(){
                deferred.reject("couldn't fetch dining info")
            });

            return deferred.promise;
        },

        fetchUserInfo: function() {
            var deferred = $q.defer();
            $http.post(sequoiaUrls.user).success(function(data) {
                var json      = angular.fromJson(data);
                var studentID = json.d.CampusID.slice(1, 9);
                var email     = json.d.AppUser.Email;
                var firstName = json.d.AppUser.FirstName.toLowerCase();
                firstName = firstName.charAt(0).toUpperCase() + firstName.substring(1);
                var lastName  = json.d.AppUser.LastName.toLowerCase();
                lastName = lastName.charAt(0).toUpperCase() + lastName.substring(1);
                var fullName = firstName + ' ' + lastName;
                deferred.resolve({studentID: studentID, email: email, fullName: fullName, firstName: firstName, lastName: lastName});
            }).error(function() {
                deferred.reject("couldn't fetch user info");
            })

            return deferred.promise;
        }
    }
});

/* Something to hold and pass around the raw bb data, if we want to scrape it */
bbApp.factory('bbRawData', function($rootScope) {
    var shared = {};
    shared.set = function(data) {
        shared.data = data;
    }
    shared.get = function() {
        return shared.data;
    }
    return shared;
});

/* Service to switch 'modes' e.g. login, pre_login etc. */
bbApp.factory('ModeService', function($rootScope) {
    var mode = {};
    mode.set = function(what) {
        mode.which = what;
    }
    mode.get = function() {
        return mode.which;
    }
    return mode;
});

/* Service to parse the raw bb data */
bbApp.factory('bbParseService', function() {
   
  var bbParseClass = function(rawBBData) {
    this.data = rawBBData;


    //Define functions that manipulate the raw data
    this.parseName = function() {
      var dom = this.data;
      var beginIndex = dom.indexOf('"User Avatar Image" alt="">') + 27;
      dom            = dom.slice(beginIndex);
      var endIndex   = dom.indexOf("<");
      var name       = dom.substring(0, endIndex);
      return name;
    }

    this.parseClasses = function() {
      var dom = this.data;

    }


  }
  return bbParseClass;
});

/* The loader animation */
bbApp.directive('loader', function () {
    return {
      restrict: 'AC',
      template: '<div class="windows8">'+
                '<div class="wBall" id="wBall_1">'+
                '<div class="wInnerBall">'+
                '</div>'+
                '</div>'+
                '<div class="wBall" id="wBall_2">'+
                '<div class="wInnerBall">'+
                '</div>'+
                '</div>'+
                '<div class="wBall" id="wBall_3">'+
                '<div class="wInnerBall">'+
                '</div>'+
                '</div>'+
                '<div class="wBall" id="wBall_4">'+
                '<div class="wInnerBall">'+
                '</div>'+
                '</div>'+
                '<div class="wBall" id="wBall_5">'+
                '<div class="wInnerBall">'+
                '</div>'+
                '</div>'+
                '</div>'
  }
});


var bbAppControllers = angular.module('bbAppControllers', []);