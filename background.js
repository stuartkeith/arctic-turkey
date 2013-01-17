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
