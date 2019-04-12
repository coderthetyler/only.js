//js/only-utils.js

(() => {

only.utils = {};

var cache = {};

/**
 * Fetches from a URL optionally caching the response received.
 * @param url       URL to fetch from.
 * @param useCache  Default true. Provide false to force a fetch.
 */
only.utils.fetch = (url, useCache=true) => {
	if(url in cache && useCache) {
		return Promise.resolve(cache[url].clone());
	}
	return fetch(url)
	.then(resp => {
		cache[url] = resp.clone();
		if(resp.status == 404)
			throw Error("404 no response");
		return resp;
	});
};

/**
 * Fetches from a URL, gets the text from the body of the response, then sets
 * the inner HTML of the node. Optionally caches the response received.
 * @param url       URL to fetch from.
 * @param node      Node to fill.
 * @param useCache  Default true. Provide false to force a fetch.
 */
only.utils.fetchAndFill = (url, node, useCache=true) => {
	return only.utils.fetch(url, useCache)
		.then((resp) => resp.text())
		.then((html) => {
			node.innerHTML = html;
		});
};

/**
 * Removes all children from a node.
 * @param node  Node to empty.
 */
only.utils.emptyNode = (node) => {
	while(node.hasChildNodes())
		node.removeChild(node.lastChild);
};

})();