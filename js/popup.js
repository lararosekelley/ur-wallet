//JQuery Function
jQuery.fn.exists = function() {
	return this.length > 0;
};

//Chrome Storage and Info
var storage = chrome.storage.sync;
var localStorage = chrome.storage.local;

//Constants
var constants = {
    FIRST_NAME : "",
    LAST_NAME : "",
    SEQUOIA_AUTH_TOKEN : "",
    BB_LOGIN_URL : "https://my.rochester.edu/webapps/login/index",
    SEQUOIA_TOKEN_URL : "https://my.rochester.edu/webapps/bb-ecard-sso-bb_bb60/token.jsp",
    SEQUOIA_AUTH_URL : "https://ecard.sequoiars.com/eCardServices/AuthenticationHandler.ashx",
    SEQUOIA_BALANCE_URL : "https://ecard.sequoiars.com/eCardServices/eCardServices.svc/WebHttp/GetAccountHolderInformationForCurrentUser",
    SEQUOIA_ADDFUNDS_URL : "https://ecard.sequoiars.com/rochester/eCardCardholder/StudentDepositPage.aspx"
};

//First function to execute: Handles all button clicks as well
$(document).ready(function() {
	console.log("UR Wallet");
	checkStorage();
	//Login Button
	$("#login").click(function(event) {
		event.preventDefault();
		console.log("Form filled out! Login started...");
		if ($("#netid").val() !== "" && $("#password").val() !== "") {
			console.log("Moving to BB login...");
			bbLogin($("#netid").val(), $("#password").val());
		} else {
			console.log("Login Failed (No username/password)");
			//CHANGE COLOR OF TITLE
			$("#title").multiline("\"ur\" wallet\noops!");
			$("#title").css("color", "red");
			$("#title").css("text-shadow", "0 0 4px tomato");
			setTimeout(function (){
				$("#title").multiline("\"ur\" wallet\nuniversity of rochester");
				$("#title").css("color", "#666");
				$("#title").css("text-shadow", "none");
			}, 1500);
		}
	});
	//Logout Button
	$("#logout").click(function(event) {
		event.preventDefault();
		console.log("Logging out...");
		logout();
	});
});

//Check to see if NetID and Password stored
function checkStorage() {
	console.log("Checking Chrome storage...");
	$("#load-page").show();
	storage.get(["username", "password"], function(result) {
		if ((result.username !== undefined && result.username !== null) && (result.password !== undefined && result.password !== null)) {
			console.log("Data found! Moving to BB login...");
			//Move to bbLogin
			bbLogin(result.username, result.password);
		} else {
			console.log("No data stored. User filling out form...");
			//Move to login-page
			$("#load-page").hide();
			$("#login-page").show();
		}
	});
}

//Log the user into BlackBoard
function bbLogin(username, password) {
	$("#login-page").hide();
	$("#load-page").show();
	console.log("Attempting BlackBoard login...");
	var id = username;
	var pw = password;

	var request = $.ajax ({
		type: "POST",
		dataType: "html",
		url: constants.BB_LOGIN_URL,
		data: {
			user_id: id,
			encoded_pw: window.btoa(pw),
			encoded_pw_unicode: "password"
		},
		success: function(data) {
			var $data = $(data);

			//Login failed
			if ($("#loginErrorMessage", $data).exists()) {
				console.log("Login to BB failed!");
				$("#load-page").hide();
				$("#login-page").show();

				//CHANGE COLOR OF TITLE
				$("#title").multiline("\"ur\" wallet\noops!");
				$("#title").css("color", "red");
				$("#title").css("text-shadow", "0 0 4px tomato");
				setTimeout(function (){
					$("#title").multiline("\"ur\" wallet\nuniversity of rochester");
					$("#title").css("color", "#666");
					$("#title").css("text-shadow", "none");
				}, 1500);
			} else {
				//Login Success!
				console.log("Logged into BB! Moving to Sequoia Login...");
				$("#load-page").hide();
				storage.set({"username": id, "password": pw});
				sequoiaLogin();
			}
		}
	});
}

//Log the user into Sequoia, then get name and balances
function sequoiaLogin() {
	$("#login-page").hide();
	$("#load-page").show();
	console.log("Attempting Sequoia login...");

	$.ajax ({
		type: "GET",
		dataType: "html",
		url: constants.SEQUOIA_TOKEN_URL,
		success: function(data) {
			$data = $(data);
			constants. SEQUOIA_AUTH_TOKEN = $("input[name = 'AUTHENTICATIONTOKEN']", $data).attr('value');

			$.ajax ({
				type: "POST",
				dataType: "html",
				url: constants.SEQUOIA_AUTH_URL,
				data: {
					AUTHENTICATIONTOKEN: constants.SEQUOIA_AUTH_TOKEN
				},
				success: function(data) {
					$.ajax ({
						type: "POST",
						dataType: "html",
						url: constants.SEQUOIA_BALANCE_URL,
						success: function(data) {
							$data = jQuery.parseJSON(data);
							console.log("Login Success! Sequoia Data:");
							console.log($data);
							var uros, rawUros, declining, rawDeclining;

							try {
								uros = $data.d._ItemList[0].BalanceInDollarsStr;
								rawUros = $data.d._ItemList[0].BalanceInDollars;
							} catch(err) {
								uros = "$ 0.00";
								rawUros = 0;
							}

							try {
								declining = $data.d._ItemList[1].BalanceInDollarsStr;
								rawDeclining = $data.d._ItemList[1].BalanceInDollars;
							} catch(err) {
								declining = "$ 0.00";
								rawDeclining = 0;
							}

              $("#declining").text("declining: " + declining);
							if (rawDeclining < 50) {
								$("#declining").addClass("low");
              } else if (rawDeclining > 50 && rawDeclining < 100 ) {
                $("#declining").addClass("medium");
              } else if (rawDeclining > 100 ) {
                $("#declining").addClass("high");
              }

							$("#uros").text("uros: " + uros);
							if (rawUros < 10) {
								$("#uros").addClass("low");
              } else if (rawUros > 10 && rawDeclining < 25 ) {
              	$("#uros").addClass("medium");
              } else if (rawUros > 25 ) {
                $("#uros").addClass("high");
              }

                console.log("Fetching name from Sequoia...");
								var name = $data.d.FullName.toLowerCase();
								var firstName = name.split(", ")[1];
								var lastName = name.split(", ")[0];

								constants.FIRST_NAME = firstName;
								constants.LAST_NAME = lastName;

								console.log(constants.FIRST_NAME);
								console.log(constants.LAST_NAME);

								console.log("Name and Balances Updated!");
								showMainPage();
						}
					});
				}
			});
		}
	});
}

//Capitalizes first letter of each word, and after hyphens, etc.
function correctCase(input) {
	var words = input.split(/(\s|-)+/),
        output = [];

    for (var i = 0, len = words.length; i < len; i += 1) {
        output.push(words[i][0].toUpperCase() +
                    words[i].toLowerCase().substr(1));
    }

    return output.join('');
}

//Display the UI
function showMainPage() {
	$("#load-page").hide();
	if (constants.FIRST_NAME === undefined || constants.LAST_NAME === undefined) {
			storage.set({"username": null, "password": null});
			logout();
	} else {
			$("#welcome").text("hello, " + constants.FIRST_NAME + " " + constants.LAST_NAME);
			console.log("Finished. Main Page Displayed.");
			$("#main-page").show();
	}
}

//Log out the current user and delete all data.
function logout() {
	$("#main-page").hide();
	$("#load-page").show();
	$.ajax ({
		type: "GET",
		dataType: "html",
		url: "https://my.rochester.edu/webapps/login/?action=logout",
		success: function() {
			$("#load-page").hide();
			$("#login-page").show();
			$("#netid").val("");
			$("#password").val("");
		},
		error: function() {
			console.log("BlackBoard Error!");
			$("#main-page").show();
		}
	});

	storage.clear();
	localStorage.clear();
	console.log("Logged out.");
}

//New lines in $(element).text()
$.fn.multiline = function(text) {
    this.text(text);
    this.html(this.html().replace(/\n/g,'<br/>'));
    return this;
};
