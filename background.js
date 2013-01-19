(function () {
	// Defaults:

	var DEFAULT_BLOCKED_DOMAINS = [
		"facebook.com",
		"twitter.com",
		"youtube.com"
	];

	var addDefaultSettings = function (settings) {
		if (settings.lastHoursValue === undefined)
			settings.lastHoursValue = 1;
	};

	// Loading and saving data:

	var blockedDomains = JSON.parse(localStorage.getItem("blockedDomains")) || DEFAULT_BLOCKED_DOMAINS,
	    settings = JSON.parse(localStorage.getItem("settings")) || {};

	var saveBlockedDomains = function () {
		localStorage.setItem("blockedDomains", JSON.stringify(blockedDomains));
	};

	var saveSettings = function () {
		localStorage.setItem("settings", JSON.stringify(settings));
	};

	addDefaultSettings(settings);

	// Blocking and unblocking domains:

	var cleanDomain = function (domain) {
		return domain.trim();
	};

	var blockDomain = function (domain, failure) {
		var index;

		domain = cleanDomain(domain);

		if (!domain) {
			if (failure) failure(domain, "blank");

			return;
		}

		index = blockedDomains.indexOf(domain);

		if (index === -1) {
			blockedDomains.push(domain);

			saveBlockedDomains();

			chrome.extension.sendMessage(null, {
				message: "domainBlocked",
				domain: domain
			});
		} else {
			if (failure) failure(domain, "found");
		}
	};

	var unblockDomain = function (domain) {
		var index;

		index = blockedDomains.indexOf(domain);

		blockedDomains.splice(index, 1);

		saveBlockedDomains();

		chrome.extension.sendMessage(null, {
			message: "domainUnblocked",
			domain: domain
		});
	};

	// Time:

	var getTime = function () {
		return new Date().getTime();
	};

	var hoursToMilliseconds = function (hours) {
		return Math.floor(3600000 * hours);
	};

	var startTimer = function () {
		chrome.alarms.create("blockAlarm", {
			when: settings.blockedUntilTime
		});
	};

	var stopTimer = function () {
		chrome.alarms.clearAll();
	};

	var getRemainingTime = function () {
		if (settings.blockedUntilTime) {
			return settings.blockedUntilTime - getTime();
		} else {
			return 0;
		}
	};

	// Blocking:

	var startBlocking = function (hours, failure) {
		hours = parseFloat(hours);

		if (isNaN(hours)) {
			if (failure) failure("nan");
		} else if (hours <= 0) {
			if (failure) failure("invalid");
		} else {
			settings.blockedUntilTime = getTime() + hoursToMilliseconds(hours);
			settings.lastHoursValue = hours;

			saveSettings();

			startTimer();

			chrome.extension.sendMessage(null, {
				message: "blockingStarted"
			});
		}
	};

	var stopBlocking = function () {
		stopTimer();

		settings.blockedUntilTime = undefined;

		saveSettings();

		chrome.extension.sendMessage(null, {
			message: "blockingFinished"
		});
	};

	chrome.alarms.onAlarm.addListener(stopBlocking);

	// Externally accessible properties:

	window.blockedDomains = blockedDomains;
	window.settings = settings;
	window.blockDomain = blockDomain;
	window.unblockDomain = unblockDomain;
	window.getRemainingTime = getRemainingTime;
	window.startBlocking = startBlocking;
	window.stopBlocking = stopBlocking;

	// Initialise:

	if (settings.blockedUntilTime) {
		startTimer();
	}
}) ();
