var background = chrome.extension.getBackgroundPage(),
    domainTemplate = document.getElementById("domain-template").innerHTML,
    settingsForm = document.getElementById("settings-form"),
    blockedDomainsList = document.getElementById("blocked-domains-list"),
    blockDomainForm = document.getElementById("block-domain-form"),
    blockDomainFormError = document.getElementById("block-domain-form-error"),
    domainToElementMap = {};

// DOM event listeners:

blockedDomainsList.addEventListener("click", function (event) {
	if (event.target.dataset.unblockDomain) {
		background.unblockDomain(event.target.dataset.unblockDomain);
	}
});

blockDomainForm.addEventListener("submit", function (event) {
	event.preventDefault();

	blockDomainFormError.innerHTML = "";

	background.blockDomain(blockDomainForm.domain.value, function (domain, reason) {
		if (reason === "blank") {
			blockDomainFormError.innerHTML = "Domain is blank.";
		} else if (reason === "found") {
			blockDomainFormError.innerHTML = domain + " is already blocked.";
		}
	});

	blockDomainForm.domain.value = "";
});

settingsForm.refreshBlockedTabs.addEventListener("click", function (event) {
	background.set("refreshBlockedTabs", event.target.checked);
});

// DOM modifiers:

var setDomainButtonsEnabled = function (element) {
	var removeDomainButtons = element.getElementsByClassName("remove-domain-button"),
	    isBlocked = !!background.settings.blockedUntilTime;

	for (var i = 0; i < removeDomainButtons.length; i++) {
		removeDomainButtons[i].disabled = isBlocked;
	}
};

var addBlockedDomainElement = function (domain) {
	var li = document.createElement("li");

	li.innerHTML = domainTemplate.replace(/\{\{ domain \}\}/g, domain);

	setDomainButtonsEnabled(li);

	blockedDomainsList.appendChild(li);

	domainToElementMap[domain] = li;
};

var removeBlockedDomainElement = function (domain) {
	domainToElementMap[domain].remove();

	delete domainToElementMap[domain];
};

// Message listener:

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.message === "domainBlocked") {
		addBlockedDomainElement(request.domain);
	} else if (request.message === "domainUnblocked") {
		removeBlockedDomainElement(request.domain);
	} else if (request.message === "blockingStarted") {
		setDomainButtonsEnabled(blockedDomainsList);
	} else if (request.message === "blockingFinished") {
		setDomainButtonsEnabled(blockedDomainsList);
	}
});

// Initialise:

background.blockedDomains.forEach(addBlockedDomainElement);

settingsForm.refreshBlockedTabs.checked = background.settings.refreshBlockedTabs;
