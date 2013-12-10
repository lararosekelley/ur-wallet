jQuery.fn.exists = function(){return this.length>0;}

$(document).ready(function() {
    $("#login").click(function(event) {
        event.preventDefault();
        if ($("#username").val() != "" && $("#password").val() != "") {
            //Hide the button so we can display loader
            $(this).hide();
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
                    console.log(data);

                    //Login failed
                    if ($("#loginErrorMessage", $data).exists()) {
                        $("#status").text("Wrong username or password.");
                        $("input").css({"border":"1px solid red"});
                        $("#loader").hide();
                        $("#login").show();
                    }
                    //Login success! 
                    else {
                        $("#loader").hide();
                        $("body").remove();

                        //store credentials
                        chrome.storage.sync.set({'username': username, 'password': password});

                    }
                },
                error: function() {
                    $("#loader").hide();
                    $("#status").text("Failed to contact server. Try again later.");
                }
            });
        }
        else {
            alert("Please enter a username and password.");
        }
    });
});

function bb_login() {
    //log into blackboard
}

function seq_token() {
    //return the sequioa token
}

function seq_login() {
    //log into sequoia
}

function seq_info() {
    //get this information
    
}

