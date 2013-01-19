var queryStringToObject = function (queryString) {
	var variables = {},
	    fieldValuePairs,
	    fieldValuePair;

	if (queryString) {
		// cut off initial "?"
		queryString = queryString.substr(1);

		fieldValuePairs = queryString.split("&");

		fieldValuePairs.forEach(function (fieldValuePair) {
			fieldValues = fieldValuePair.split("=");

			variables[fieldValues[0]] = decodeURIComponent(fieldValues[1]);
		});
	}

	return variables;
};

var objectToQueryString = function (object) {
	var fieldValuePairs = [],
	    keys = Object.keys(object);

	keys.forEach(function (key) {
		fieldValuePairs.push(key + "=" + encodeURIComponent(object[key]));
	});

	return "?" + fieldValuePairs.join("&");
};
