//js/only-tabs.js

(() => {

only.tabs = {};

/**
 * Function invoked when a tab is selected.
 */
only.tabs.onselect = null;

/**
 * Function invoked when a tab is deselected.
 */
only.tabs.ondeselect = null;

/**
 * Internal list of tab objects.
 */
var onlyjs_tabList = [];

/**
 * Creates the tabs on the navigator using only.tabs.
 */
only.tabs.init = (sitemap, tabBuilder) =>
{
	/* Get all top-level pages in the sitemap. */
	onlyjs_tabList = Object.keys(sitemap).filter((e) => {
		return (e.charAt(0) != '.') && (".." in sitemap[e]);
	});
	
	/* Create tab objects from tab names. Invoke the tab builder function
	 * to make tabs. */
	for(var i = 0; i < onlyjs_tabList.length; i++) {
		var tabName = onlyjs_tabList[i];
		var onclick = ((tabName) => {
			return (e) => only.load(tabName);
		})(tabName);
		onlyjs_tabList[i] = {
			"name": tabName,
			"onclick": onclick,
			"selected": false
		};
		tabBuilder(onlyjs_tabList[i]);
	}
};

/**
 * Sets the given tab as selected. This deselects all other tabs.
 */
only.tabs.select = (path) =>
{
	var toSelect = path[0];
	for(var i = 0; i < onlyjs_tabList.length; i++) {
		var tab = onlyjs_tabList[i];
		if(tab.name === toSelect) {
			only.tabs.onselect(tab);
			tab.selected = true;
		}else if(tab.selected) {
			only.tabs.ondeselect(tab);
			tab.selected = false;
		}
	}
};


})();