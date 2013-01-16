var background = chrome.extension.getBackgroundPage(),
    domainTemplate = document.getElementById("domain-template").innerHTML,
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

// DOM modifiers:

var addBlockedDomainElement = function (domain) {
	var li = document.createElement("li");

	li.innerHTML = domainTemplate.replace(/\{\{ domain \}\}/g, domain);

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
	}
});

// Initialise:

background.blockedDomains.forEach(addBlockedDomainElement);
