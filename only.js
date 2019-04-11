//js/only.js

var only = {};

(() => {

window.history.scrollRestoration = "manual";
window.onpopstate = (e) => only.load(e.state.path, false);

only.init = (sitemap) => {
	if(sitemap)
		onlyjs_sitemap = sitemap;
};

only.maketitle = (path) =>
{
	return "only.js | " + path.join("/");
};

only.load = (initPath, shouldPush=true) => {
	/* Break stringified path into array representation. */
	if(typeof initPath === "string")
		initPath = initPath.split("/").filter(Boolean);

	var result = onlyjs_getFunctionQueue(initPath);
	var queue = result.queue;
	var func404 = result.func404;
	var finalPath = result.path;

	/* Select the correct tab, if any. */
	if(only.tabs)
		only.tabs.select(finalPath);

	/* Set the document title. */
	document.title = only.maketitle(finalPath);

	/* Push the page to the browser history, if necessary. */
	if(shouldPush) {
		var finalPathStr = finalPath.join("/");
		window.history.pushState({
			"path": finalPath
		}, document.title, "/"+finalPathStr);
	}

	/* Transform queue into array of functions returning promises. */
	var funcs = queue.map((e) => {
		return () => {
			var promise;
			if("error" in e) {
				promise = Promise.reject(e.error);
			}else{
				promise = Promise.resolve(e.func(e.path))
			}
			return promise;
		}
	});

	/* Evaluate all promises in order. */
	funcs.reduce((promise, func) => {
		return promise.then(func);
	}, Promise.resolve())
	.catch((err) => {
		return Promise.resolve(func404(finalPath, err));
	});
};

var onlyjs_sitemap = {
	"..": () => {
		document.write("Welcome to only.js!");
	}
};

var onlyjs_titleFunc = (path) => {
	return "only.js | " + path.join("/");
};

/**
 * Determines the default order of directive resolution.
 */
var onlyjs_defaultDirectiveResolutionOrder = [
	".*", "..", ".!", "./"
];

/**
 * The default 404 exception to raise when the function queue fails to build.
 */
var onlyjs_default404Error = 
	Error("404 page not found.");

/**
 * The default 404 directive if none is given.
 */
var onlyjs_default404 = (path, err) => {
	document.body.innerHTML = err.message;
};

/**
 * Returns an array of functions queued up while threading the given path.
 */
var onlyjs_getFunctionQueue = (path) =>
{
	path = path.slice();  //copy of the path to manipulate locally

	/* Return values. */
	var queue = [];
	var finalPath = path.slice();

	var done = false;  // used to terminate threading prematurely
	var did404 = false;

	/* Useful local vars. */
	var last404 = onlyjs_default404;
	var currentPage = "~";
	var sitemap = onlyjs_sitemap;

	/* Thread, thread, thread! */
	while(currentPage && !done) {
		var isTarget = (path.length == 0);

		/* A 404 occurs only if the current page could not be threaded through 
		 * the sitemap or if the current page is a target but does not have 
		 * target directives. */
		did404 = !sitemap || 
			(isTarget && !(".*" in sitemap) && !(".." in sitemap));

		/* Grab the latest, coolest, hottest 404 function. */
		if(sitemap && ".404" in sitemap)
			last404 = sitemap[".404"];

		/* If we've 404'd, push the 404 error and finish. */
		if(did404) {
			queue.push({ "error": onlyjs_default404Error });
			done = true;
		}else{
			/* Use the page directive ordering, if one exists. */
			var order = onlyjs_defaultDirectiveResolutionOrder;
			if("." in sitemap)
				order = sitemap["."];

			/* Evaluate directives as necessary. */
			for(var i = 0; i < order.length; i++) {
				if((order[i] === "..") && isTarget && (".." in sitemap)) {
					var value = sitemap[".."];
					/* Redirect if necessary. */
					if(typeof value === "string")
						return onlyjs_getFunctionQueue(
							value.split("/").filter(Boolean));
					/* Otherwise, push as normal. */
					queue.push({ "path": path.slice(), "func": value });
				}else if((order[i] === ".*") && (".*" in sitemap)) {
					queue.push({ "path": path.slice(), "func": sitemap[".*"] });
				}else if((order[i] === "./") && !isTarget && ("./" in sitemap)) {
					queue.push({ "path": path.slice(), "func": sitemap["./"] });
				}else if((order[i] === ".!") && !isTarget && (".!" in sitemap)) {
					queue.push({ "path": path.slice(), "func": sitemap[".!"] });
					done = true; // .! terminates threading
				}
			}

			/* Thread further into the sitemap, if not already at the target. */
			currentPage = path.shift();
			if(!isTarget)
				sitemap = sitemap[currentPage];
		}
	}
	return {
		"queue": queue,
		"func404": last404,
		"path": finalPath
	};
};

})();

