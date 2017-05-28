var ctx = {
	enabled: false,
	videoURL: null
}

function onVideoFound(videoURL) {
	ctx.videoURL = videoURL
	if (ctx.enabled)
		return

	ctx.enabled = true
	chrome.runtime.sendMessage({ show: true })
}

chrome.runtime.onMessage.addListener(function (msg, sender, cb) {	
    cb(ctx.videoURL)
});

// Monitor changes on document
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		mutation.addedNodes.forEach(function(node) {
			if (node.nodeType != Node.ELEMENT_NODE || node.tagName != 'VIDEO')
				return
			
			onVideoFound(node.src)
		})
	})
});
observer.observe(document.body, { childList: true, subtree: true });

// Process document
var videos = document.getElementsByTagName("video")
if (videos.length > 0) {
	videos.forEach(function(video) {
		onVideoFound(video.src)
	})
} else {
	console.log('KP: no videos found')
}
