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

//this no longer checks the login 
function checkValidLogin() {
    $.ajax({
        type: "get",
        dataType: "html",
        url: "https://my.rochester.edu/webapps/portal/frameset.jsp",
        success: function(data) {
            var $data = $(data);

            var name = $("#global-nav-link", $data).text().trim();
            name = name.substr(0,name.indexOf("Activity")).trim();
            name = name.toLowerCase();
            name = name.replace(/\b./g, function(m){ 
                return m.toUpperCase(); 
            });
            alert("Welcome, " + name + "!");
        }
    });

    $.ajax({
        type: "get",
        dataType: "html",
        url: "https://ecard.sequoiars.com/rochester/eCardCardholder/StudentOverviewPage.aspx",
        success: function(data) {
          var $data = $(data);
          var dataString = $(".balanceColumn").text().trim();
          //To-Do: split string at $ to only get xx.xx. Right now looks like "Balance$ xx.xx$ xx.xx"
        }
    });
}