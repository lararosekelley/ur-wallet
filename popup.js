//JQuery Function
jQuery.fn.exists = function(){return this.length>0;}

//Chrome stores data on local storage
var storage = chrome.storage.sync;

//Constants
var constants = {
    FIRST_NAME : "",
    LAST_NAME : "",
    SEQUOIA_AUTH_TOKEN : "",
    SEQUOIA_TOKEN_URL : "https://my.rochester.edu/webapps/bb-ecard-sso-bb_bb60/token.jsp",
    SEQUOIA_AUTH_URL : "https://ecard.sequoiars.com/eCardServices/AuthenticationHandler.ashx",
    SEQUOIA_BALANCE_URL : "https://ecard.sequoiars.com/eCardServices/eCardServices.svc/WebHttp/GetAccountHolderInformationForCurrentUser"
}

//Check if User is already logged into BB
function checkLoggedIn(data) {
    console.log("Checking if user logged in")
    if ($("#loginErrorMessage", data).exists()) {
        console.log("wrong uname/pwd")
       
        return false;
    }
    else {
        console.log("logged in!")
       return true;
    }

}


//If not, log in with saved username and password
function loginWithSavedCredentials(callback) {
    console.log("Trying to login with saved credentials")
  
    storage.get(["username", "password"], function(result) {
        if(result.username != null && result.password != null) {
            var request = $.ajax({
                type: "post",
                dataType: "html",
                url: "https://my.rochester.edu/webapps/login/index",
                data: {
                    user_id: result.username,
                    encoded_pw: window.btoa(result.password),
                    encoded_pw_unicode: "."
                },
                success: function(data) {
                    console.log("Saved credentials ajax request sucess")
                    var $data = $(data);
                    setupUserData($data);
                    authenticateSequoia();
                    callback(checkLoggedIn($data));
                },
                error: function() {
                    console.log("Saved credentials ajax request failed")
                    $("#status").text("Failed to contact server. Try again later.");
                }
            });


        } else {
            console.log("No credentials found")
            callback(false)
        }
    });
}

//What to do after user fills out form
$(document).ready(function() {
    chrome.browserAction.setBadgeText({'text':"$999"});
    $("#loader").show();
    loginWithSavedCredentials(function(result) {
        console.log("Waiting on results of loginWithSavedCredentials")
        if (result){
            //We are in
            console.log("logged in")
            $("#loader").hide();
            setupBBUI();
           
        } 
        else {
            $("#status").text("Wrong username or password.");
            $("input").css({"border":"1px solid red"});
            $("#loader").hide();
            $("#login").show();
            $("#loginform").show()
            console.log("not logged in")
            $("#login").click(function(event) {
                event.preventDefault();
                attemptToLoginUser();
            });
        }
    })

});

//Log in the user to BB for the first time
function attemptToLoginUser() {
    if ($("#username").val() != "" && $("#password").val() != "") {
                //Hide the button so we can display loader
                $("#login").hide();
                $("#loader").show();
                
                var username = $("#username").val();
                var password = $("#password").val();

                var request = $.ajax({
                    type: "post",
                    dataType: "html",
                    url: "https://my.rochester.edu/webapps/login/index",
                    data: {
                        user_id: username,
                        encoded_pw: window.btoa(password),
                        encoded_pw_unicode: "."
                    },
                    success: function(data) {
                        var $data = $(data);
                        //Login failed
                        if ($("#loginErrorMessage", $data).exists()) {
                            console.log("Ajax login request failed [wrong uname/pwd]")
                            $("#status").text("Oops! Wrong username or password.");
                            $("input").css({"border":"1px solid red"});
                            $("#loader").hide();
                            $("#login").show();
                        }
                        //Login success! 
                        else {
                            console.log("Ajax login request success")
                            $("#loader").hide();
                            $("body").html("<h1>Logged In</h1>");
                            storage.set({'username':username, "password":password});

                        }
                    },
                    error: function() {
                        $("#loader").hide();
                        $("#status").text("Failed to contact server. Try again later.");
                    }
                });
            }
            else {
                $("#status").text("Please enter a username or password")
            }
}

function fetchRealName(data) {
    var str = $("#global-nav-link", data).text().trim();
    console.log(str)
    var name = str.substr(0, str.indexOf("Activity")).trim();
    return name;
}

function setupUserData(data) {
    var name = fetchRealName(data).toLowerCase();
    var firstName = name.split(" ")[0];
    var lastName = name.split(" ")[1];
    constants.FIRST_NAME = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    constants.LAST_NAME = lastName.charAt(0).toUpperCase() + lastName.slice(1);
}

function setupBBUI() {
    $("#header h1").text("Welcome, " + constants.FIRST_NAME + ".")
    $("#ui").show();
}

function authenticateSequoia() {
 
    $.ajax({
        type: "get",
        dataType: "html",
        url: constants.SEQUOIA_TOKEN_URL,
        success: function(data) {
            $data = $(data);
            constants.SEQUOIA_AUTH_TOKEN = $("input[name='AUTHENTICATIONTOKEN']", $data).attr('value');
        
            $.ajax({
                type: "post",
                dataType: "html",
                url: constants.SEQUOIA_AUTH_URL,
                data: {
                    AUTHENTICATIONTOKEN: constants.SEQUOIA_AUTH_TOKEN
                },
                success: function(data) {
                    $.ajax({
                        type: "post",
                        dataType: "html",
                        url: constants.SEQUOIA_BALANCE_URL,
                        success: function(data) {
                            $data = jQuery.parseJSON(data);
                                var cash = $data.d._ItemList[1].BalanceInDollarsStr;
                                var rawCash =$data.d._ItemList[1].BalanceInDollars;
                         chrome.browserAction.setBadgeText({'text':cash});
                         $("#declining").text(cash);
                         if (rawCash < 10) {
                            $("#declining").addClass("critical");
                         } else if (rawCash > 10 && rawCash < 50 ) {
                            $("#declining").addClass("semicritical");
                         }else if (rawCash > 50 ) {
                            $("#declining").addClass("healthy");
                         }


                        }
                    });
                }
            });
        }
    });
}