// vars

var targetURL = 'https://odesli.co/';
var tabOdesliId = null;
var searchValue = null;

// functions
	
function searchOnClick(info, tab){

	const { menuItemId } = info;

	if (menuItemId != 'a_odsl_srch') {
		return;
	}

	this.searchValue = info.selectionText
		.replace("\t", " ")
		.replace(/[^\p{L}\p{N} .]+/gu, "")
		.replace("  ", " ");

	chrome.tabs.create({ url: targetURL, active: true}, this.createCallback);
}

function createCallback(tabOdesli){

	this.tabOdesliId = tabOdesli.id;
    chrome.tabs.onUpdated.addListener(this.completeListener);

}

function completeListener(tabId, changeInfo, tab) {

    if (tabId == this.tabOdesliId && changeInfo.status === 'complete') {

        chrome.tabs.onUpdated.removeListener(this.completeListener);

		chrome.scripting.executeScript({
			target : {tabId : tabId},
			func : doSearch,
			args : [ this.searchValue ],
		});

    }
}

function doSearch(value){
	
	const setReactInputValue = (input, value) => {
	  const previousValue = input.value;
	  input.value = value;
	  const tracker = input._valueTracker;
	  if (tracker) {
	    tracker.setValue(previousValue);
	  }  

	  input.dispatchEvent(new Event("change", { bubbles: true }));
	  input.dispatchEvent(new Event("focusin", { bubbles: true }));
	};

	let searchInput = document.getElementById("search-page-downshift-input");
	setReactInputValue(searchInput, value);
}

// init

chrome.runtime.onInstalled.addListener(() => {
	var menuItem = chrome.contextMenus.create({
		"id": "a_odsl_srch",
		"title": "Search on Odesli: '%s'",
		"contexts":["selection"]
	});
});

chrome.contextMenus.onClicked.addListener(searchOnClick);
