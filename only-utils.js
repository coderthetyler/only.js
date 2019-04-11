//js/only-utils.js

(() => {

only.utils = {};

only.utils.fetch = (url) => {
	return fetch(url)
	.then(resp => {
		if(resp.status == 404)
			throw Error("404 no response");
		return resp;
	});
};

only.utils.fetchAndFill = (url, node) => {
	return only.utils.fetch(url)
		.then((resp) => resp.text())
		.then((html) => {
			node.innerHTML = html;
		});
};

only.utils.emptyNode = (node) => {
	while(node.hasChildNodes())
		node.removeChild(node.lastChild);
};

only.utils.injectHTML = (node, html) => {
	node.innerHTML += html;
};

})();