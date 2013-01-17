// Defaults:

var DEFAULT_BLOCKED_DOMAINS = [
	"facebook.com",
	"twitter.com",
	"youtube.com"
];

// Loading and saving data:

var blockedDomains = JSON.parse(localStorage.getItem("blockedDomains")) || DEFAULT_BLOCKED_DOMAINS;

var saveBlockedDomains = function () {
	localStorage.setItem("blockedDomains", JSON.stringify(blockedDomains));
};

// Utilities:

var sendToAllTabs = function (message) {
	chrome.tabs.query({}, function(tabs) {
		tabs.forEach(function (tab) {
			chrome.tabs.sendMessage(tab.id, message);
		});
	});
};

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

		sendToAllTabs({
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

	sendToAllTabs({
		message: "domainUnblocked",
		domain: domain
	});
};
