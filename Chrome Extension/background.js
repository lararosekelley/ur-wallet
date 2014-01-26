//Opens the Add Funds tab
function addFunds() {
	var url = "https://ecard.sequoiars.com/rochester/eCardCardholder/StudentDepositPage.aspx";
	console.log("Adding funds...");
    chrome.tabs.create ({
    	url: url
    });
}

document.getElementById('addfunds').addEventListener("click", addFunds);