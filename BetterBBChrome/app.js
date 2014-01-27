//This is used to make ajax requests behave. You don't have to read it.
var bbApp = angular.module('bbApp', ['bbAppControllers', 'ngAnimate'], function($httpProvider) {
    // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
 
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


/* CONSTANTS */
bbApp.constant('bbUrls', {
  login: "https://my.rochester.edu/webapps/login/index"
});

bbApp.constant('sequoiaUrls', {
  token: "https://my.rochester.edu/webapps/bb-ecard-sso-bb_bb60/token.jsp",
  auth: "https://ecard.sequoiars.com/eCardServices/AuthenticationHandler.ashx",
  balance: "https://ecard.sequoiars.com/eCardServices/eCardServices.svc/WebHttp/GetAccountHolderInformationForCurrentUser"
});


/* SERVICE TO LOG INTO BLACKBOARD */
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
/* Something to hold and pass around the raw bb data */
bbApp.factory('bbRawData', function($rootScope) {
    var shared = {};
    shared.set = function(data) {
        shared.data = data;
    }

    shared.get = function() {
        return shared.data;
    }

    return shared;
})

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

/* SERVICE TO PARSE BLACKBOARD */
bbApp.factory('bbParseService', function() {
   
  var bbParseClass = function(rawBBData) {
    this.data = rawBBData;


    //Define functions that manipulate the raw data
    this.parseName = function() {
      var beginIndex = this.data.indexOf('"User Avatar Image" alt="">') + 27;
      this.data = this.data.slice(beginIndex);
      var endIndex = this.data.indexOf("<");
      var name = this.data.substring(0, endIndex);
      return name;
    }
  }
  return bbParseClass;
});


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