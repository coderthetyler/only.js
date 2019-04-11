//js/only-journals.js

(() => {

only.journals = {};

/**
 * Initializes the only.journals module.
 */
only.journals.init = () => {
	// Nothing to do. (For now.)
};

/**
 * Creates a new journal.
 * @param name  Journal name.
 * @param src   URL to find journal JSON.
 */
only.journals.create = (name, url) => {
	only.journals[name] = {
		"url": url,
		"json": null
	};
};

/**
 * Updates a journal by fetching fresh data from the journal URL.
 * @param name  Journal name.
 */
only.journals.update = (name) => {
	return fetch(only.journals[name].url)
	.then((resp) => resp.json())
	.then((json) => {
		only.journals[name].json = json;
	});
};

/**
 * Searches the entries and only retains those that have the search term as a
 * substring. Only those entry field specified will be searched.
 * Searches are case-insensitive. Results are provided as indices into the
 * provided entries array.
 * @param name           Journal name.
 * @param searchTerm     String to search for.
 * @param toSearch       Array of entry fields to search.
 * @param caseSensitive  Should the search be case sensitive.
 */
only.journals.search = (name, searchTerm, toSearch, caseSensitive=false) => {
	var entries = only.journals[name].json;

	var numResults = 0;
	var results = [];

	/* Force search term to lower case. */
	if(!caseSensitive)
		searchTerm = searchTerm.toLowerCase();
	
	for(var entryPath in entries) {
		var entry = entries[entryPath];
		var isAMatch = false;

		for(var i = 0; i < toSearch.length && !isAMatch; i++) {
			var field = toSearch[i];
			var value = entry[field];
			if(value)
				isAMatch = onlyjs_search(value, searchTerm, caseSensitive);
		}
		if(isAMatch)
			results.push(entryPath);
	}
	return results;
};

/**
 * This is a recursive helper function for only.journals.search. It performs
 * the detailed work of determining if a given entry field value matches a
 * search term. It currently works with strings and arrays of strings only.
 */
var onlyjs_search = (value, searchTerm, caseSensitive) =>
{
	var isAMatch = false;
	if(value instanceof Array) {
		for(var i = 0; i < value.length && !isAMatch; i++) {
			isAMatch = onlyjs_search(value[i], searchTerm);
		}
	}else if(typeof value === "string") {
		if(!caseSensitive) {
			value = value.toLowerCase();
		}
		isAMatch = value.includes(searchTerm);
	}
	return isAMatch;
};

})();