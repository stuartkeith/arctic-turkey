var background = chrome.extension.getBackgroundPage(),
    startBlockingForm = document.getElementById("start-blocking-form"),
    startBlockingFormError = document.getElementById("start-blocking-form-error"),
    optionsButton = document.getElementById("options-button");

optionsButton.addEventListener("click", function () {
	chrome.tabs.create({
		url: "options.html"
	});
});
