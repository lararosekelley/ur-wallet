$(document).ready(function() {
    $("#login").click(function(event) {
        event.preventDefault();
        if ($("#username").val() != "" && $("#password").val() != "") {
            var username = $("#username").val();
            var password = $("#password").val();

            var request = $.ajax({
                type: "post",
                dataType:"html",
                url: "https://my.rochester.edu/webapps/login/index",
                data: {
                    user_id: username,
                    encoded_pw: window.btoa(password),
                    encoded_pw_unicode: "."
                },
                success: function() {
                    getData();
                },
                error: function() {
                    alert("Error! Try Again.");
                }
            });
        }
        else {
            alert("Please enter a username and password.");
        }
    });
});

function getData() {
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