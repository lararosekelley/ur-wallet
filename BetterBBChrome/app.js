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


bbApp.factory('bbLoginService', function($http) {
  console.log("wtf?")
  var bbLoginService = {
    async: function(user) {
      var postData = {
            user_id: user.netid,
            encoded_pw: window.btoa(user.password),
            encoded_pw_unicode: ".",
            login: "Login",
            action: "login"
      }
      var promise = $http({
            withCredentials:true,
            url: "https://my.rochester.edu/webapps/login/index",
            method: "POST",
            data: postData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(function(response) {
            console.log(response)
            return response.data;
        });

        return promise;

    }
  };
  return bbLoginService;
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