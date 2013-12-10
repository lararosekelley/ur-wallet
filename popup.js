jQuery.fn.exists = function(){return this.length>0;}
var storage = chrome.storage.sync;

function checkLoggedIn(data) {
    console.log("Checking if user logged in")
    if ($("#loginErrorMessage", data).exists()) {
        console.log("wrong uname/pwd")
        $("#status").text("Wrong username or password.");
        $("input").css({"border":"1px solid red"});
        $("#loader").hide();
        $("#login").show();
        return false;
    }
    else {
        console.log("logged in !")
       $("#loader").hide();
       $("body").html("<h1>Logged In</h1>");
       return true;
    }

}

function loginWithSavedCredentials(callback) {
    console.log("Trying to login with saved credentials")
  
    storage.get(["username", "password"], function(result) {
        console.log(result)
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
                    console.log("saved credentials ajax request sucess")
                    var $data = $(data);
                    
                    callback(checkLoggedIn($data));
                },
                error: function() {
                    console.log("saved credentials ajax request failed")
                    $("#status").text("Failed to contact server. Try again later.");
                }
            });


        } else {
            console.log("No credentials found")
            callback(false)
        }
    });
}

$(document).ready(function() {

    chrome.browserAction.setBadgeText({'text':"$999"});
    $("#loader").show();
    loginWithSavedCredentials(function(result) {
        console.log("Waiting on results of loginWithSavedCredentials")
        if (result){
            console.log("logged in")
            $("#loader").hide();
        } 
        else {
            $("#loader").hide();
            $("#loginform").show()
            console.log("not logged in")
            $("#login").click(function(event) {
                event.preventDefault();
                attemptToLoginUser();
            });
        }
    })

});

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
                            $("#status").text("Wrong username or password.");
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

