function sendToKodi(videoURL) {
	if (videoURL == null)
		return

	chrome.storage.sync.get({
		hostname: '',
		port: ''
	}, function(items) {
		var worker = new Worker('kodi.js')
		worker.postMessage({
			hostname: items.hostname,
			port: items.port,
			videoURL: videoURL
		})
	});
}

chrome.pageAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendMessage(tab.id, {}, sendToKodi)
})

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	if (msg.show)
		chrome.pageAction.show(sender.tab.id)
	else
		chrome.pageAction.hide(sender.tab.id)
})


// debugging purposes
// chrome.tabs.onSelectionChanged.addListener(function(tabId) {
// 	sendToKodi('http://dummy.mp4')
// });
