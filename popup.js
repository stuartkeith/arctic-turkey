(function () {
	var background = chrome.extension.getBackgroundPage(),
	    blocked = document.getElementById("blocked"),
	    unblocked = document.getElementById("unblocked"),
	    startBlockingForm = document.getElementById("start-blocking-form"),
	    startBlockingFormError = document.getElementById("start-blocking-form-error"),
	    countdown = document.getElementById("countdown"),
	    optionsButton = document.getElementById("options-button"),
	    timer,
	    countdownValue = 0;

	// DOM event listeners:

	startBlockingForm.addEventListener("submit", function (event) {
		var time = startBlockingForm.time.value,
		    unit = startBlockingForm.timeUnit.value;

		event.preventDefault();

		startBlockingFormError.innerHTML = "";

		background.setAndStartBlocking(time, unit, function (reason) {
			if (reason === "nan") {
				startBlockingFormError.innerHTML = "Not a number.";
			} else if (reason === "invalid") {
				startBlockingFormError.innerHTML = "Number must be more than zero.";
			}
		});
	});

	optionsButton.addEventListener("click", function () {
		background.showOptions();
	});

	// Timer:

	var startTimer = function () {
		timer = setInterval(timerCallback, 1000);
	};

	var stopTimer = function () {
		if (timer) {
			clearInterval(timer);

			timer = null;
		}
	};

	var timerCallback = function () {
		updateCountdown();

		countdownValue--;

		if (countdownValue === 0)
			stopTimer();
	};

	// DOM modifiers:

	var padValue = function (value) {
		if (value < 10)
			return "0" + value;
		else
			return "" + value;
	};

	var secondsToDisplay = function (seconds) {
		var remainingSeconds = seconds % 60,
		    remainingMinutes = Math.floor((seconds / 60) % 60),
		    remainingHours = Math.floor(seconds / 3600);

		return padValue(remainingHours) + ":" + padValue(remainingMinutes) + ":" + padValue(remainingSeconds);
	};

	var updateCountdown = function () {
		countdown.innerHTML = secondsToDisplay(countdownValue);
	};

	var showAndHide = function (show, hide) {
		show.classList.remove("hidden");
		hide.classList.add("hidden");
	};

	var blockingStarted = function () {
		showAndHide(blocked, unblocked);

		countdownValue = Math.floor(background.getRemainingTime() / 1000);

		updateCountdown();

		stopTimer();

		startTimer();
	};

	var blockingFinished = function () {
		stopTimer();

		showAndHide(unblocked, blocked);
	};

	// Message listener:

	chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
		if (request.message === "blockingStarted") {
			blockingStarted();
		} else if (request.message === "blockingFinished") {
			blockingFinished();
		}
	});

	// Initialise:

	startBlockingForm.time.value = background.settings.lastTimeInfo.time;
	startBlockingForm.timeUnit.value = background.settings.lastTimeInfo.unit;

	if (background.settings.blockedUntilTime) {
		blockingStarted();
	} else {
		blockingFinished();
	}
}) ();
