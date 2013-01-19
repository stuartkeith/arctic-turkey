(function () {
	var blockInformation = document.getElementById("block-information"),
	    url = document.getElementById("url"),
	    domain = document.getElementById("domain"),
	    fieldValues = queryStringToObject(location.search);

	// Message listener:

	chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.message === "blockingFinished" && request.shouldRefresh) {
			window.location = fieldValues.url;
		}
	});

	// Initialise:

	url.innerHTML = "<a href=" + fieldValues.url + ">" + fieldValues.url + "</a>";
	domain.innerHTML = fieldValues.domain;

	blockInformation.classList.remove("hidden");
) ();
