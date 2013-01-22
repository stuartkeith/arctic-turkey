(function () {
	// Constants:

	var BLOCKED_URL = chrome.extension.getURL("blocked.html");

	// Defaults:

	var DEFAULT_BLOCKED_DOMAINS = [
		"facebook.com",
		"twitter.com",
		"youtube.com"
	];

	var addDefaultSettings = function (settings) {
		if (settings.lastTimeInfo === undefined) {
			settings.lastTimeInfo = {
				unit: "minutes",
				time: 30
			};
		}

		if (settings.refreshBlockedTabs === undefined)
			settings.refreshBlockedTabs = true;
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

	var set = function (name, value) {
		settings[name] = value;

		saveSettings();
	};

	addDefaultSettings(settings);

	// Badge text:

	var updateBadgeText = function () {
		var totalBlockedTime = settings.blockedUntilTime - settings.blockedAtTime,
		    elapsedBlockedTime = getTime() - settings.blockedAtTime,
		    text = Math.floor((elapsedBlockedTime / totalBlockedTime) * 100) + "%";

		chrome.browserAction.setBadgeText({
			text: text
		});
	};

	// Interacting with the blockedDomains array:

	var getDomainFromURL = function (url) {
		return url.split("/")[2];
	};

	var ifDomainIsBlocked = function (domain, callback) {
		blockedDomains.forEach(function (blockedDomain) {
			if (domain.indexOf(blockedDomain) >= 0) {
				callback(blockedDomain);

				return;
			}
		});
	};

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

	// Time and timers:

	var getTime = function () {
		return new Date().getTime();
	};

	var timeToMilliseconds = {
		hours: function (hours) {
			return Math.floor(3600000 * hours);
		},

		minutes: function (minutes) {
			return Math.floor(60000 * minutes);
		}
	};

	var startTimer = function () {
		chrome.alarms.create("blockAlarm", {
			when: settings.blockedUntilTime
		});

		chrome.alarms.create("badgeAlarm", {
			periodInMinutes: 1
		});
	};

	var stopTimer = function () {
		chrome.alarms.clearAll();
	};

	var getRemainingTime = function () {
		// if null/defined, will be treated as 0
		var remainingTime = settings.blockedUntilTime - getTime();

		return remainingTime > 0 ? remainingTime : 0;
	};

	// Tabs:

	var redirectTabIfBlocked = function (tab) {
		var domain = getDomainFromURL(tab.url);

		ifDomainIsBlocked(domain, function (blockedDomain) {
			var fieldValuePairs = {
				url: tab.url,
				domain: blockedDomain
			};

			chrome.tabs.update(tab.id, {
				url: BLOCKED_URL + objectToQueryString(fieldValuePairs)
			});
		});
	};

	var tabsUpdatedListener = function (tabId, changeInfo, tab) {
		redirectTabIfBlocked(tab);
	};

	// Blocking:

	var setAndStartBlocking = function (time, unit, failure) {
		var currentTime;

		time = parseFloat(time);

		if (isNaN(time)) {
			if (failure) failure("nan");
		} else if (time <= 0) {
			if (failure) failure("invalid");
		} else {
			currentTime = getTime();

			settings.blockedAtTime = currentTime;
			settings.blockedUntilTime = currentTime + timeToMilliseconds[unit](time);

			settings.lastTimeInfo = {
				unit: unit,
				time: time
			};

			saveSettings();

			startBlocking();
		}
	};

	var startBlocking = function () {
		updateBadgeText();

		chrome.tabs.query({}, function (tabs) {
			tabs.forEach(redirectTabIfBlocked);
		});

		chrome.tabs.onUpdated.addListener(tabsUpdatedListener);

		startTimer();

		chrome.extension.sendMessage(null, {
			message: "blockingStarted"
		});
	};

	var stopBlocking = function () {
		chrome.browserAction.setBadgeText({
			text: ""
		});

		var notification = webkitNotifications.createNotification(null, "No longer blocking!", "Your time is up.");
		notification.show();

		chrome.tabs.onUpdated.removeListener(tabsUpdatedListener);

		stopTimer();

		settings.blockedAtTime = undefined;
		settings.blockedUntilTime = undefined;

		saveSettings();

		chrome.extension.sendMessage(null, {
			message: "blockingFinished",
			shouldRefresh: settings.refreshBlockedTabs
		});
	};

	chrome.alarms.onAlarm.addListener(function (alarm) {
		if (alarm.name === "blockAlarm") {
			stopBlocking();
		} else if (alarm.name === "badgeAlarm") {
			updateBadgeText();
		}
	});

	// Externally accessible properties:

	window.blockedDomains = blockedDomains;
	window.settings = settings;
	window.set = set;
	window.blockDomain = blockDomain;
	window.unblockDomain = unblockDomain;
	window.getRemainingTime = getRemainingTime;
	window.setAndStartBlocking = setAndStartBlocking;
	window.stopBlocking = stopBlocking;

	// Initialise:

	if (settings.blockedUntilTime) {
		if (getRemainingTime() > 0) {
			startBlocking();
		} else {
			stopBlocking();
		}
	}
}) ();
