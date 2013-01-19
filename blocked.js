var blockInformation = document.getElementById("block-information"),
    url = document.getElementById("url"),
    domain = document.getElementById("domain"),
    fieldValues = queryStringToObject(location.search);

// Initialise:

url.innerHTML = "<a href=" + fieldValues.url + ">" + fieldValues.url + "</a>";
domain.innerHTML = fieldValues.domain;

blockInformation.classList.remove("hidden");
