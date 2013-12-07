$(document).ready(function() {
    $("#login").click(function() {
        if ($("#username").val() != "" && $("#password").val() != "") {
            var username = $("#username").val();
            var password = $("#password").val();
            submitForm();
        }
        else {
            alert("Please enter a username and password.");
        }
    });
});

function submitForm() {
    $.ajax({
        type: "post",
        url: "https://my.rochester.edu/webapps/login/",
        data: {
            user_id: username,
            login: "Login",
            action: "login",
            encoded_pw: window.btoa(password),
            encoded_pw_unicode: "."
        },
        success: function() {
          alert("success");
        },
        error: function() {
          alert("error");
        }
    });
}