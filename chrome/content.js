var ctx = {
	videoURL: null
}

var bodyObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		mutation.addedNodes.forEach(function(node) {
			if (node.nodeType != Node.ELEMENT_NODE || node.tagName != 'VIDEO')
				return

			processAddedVideo(node)
		})
		mutation.removedNodes.forEach(function(node) {
			if (node.nodeType != Node.ELEMENT_NODE || node.tagName != 'VIDEO')
				return

			if (ctx.videoURL != null && node.src == ctx.videoURL) {
				ctx.videoURL = null
				chrome.runtime.sendMessage({ show: false })				
			}
		})
	})
})

var videoAddObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		processAddedVideo(mutation.target)
	})
});

var videoRemoveObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		processDeletedVideo(mutation.target)
	})
});

// Assuming 2 things here:
// 1) each page has only 1 video
// 2) after video src is set, it will not be modified
function processAddedVideo(video) {
	if (video.src.length == 0) {
		videoAddObserver.observe(video, { attributes: true, attributeFilter: ['src'] })
		return
	}

	videoAddObserver.disconnect()
	videoRemoveObserver.observe(video, { attributes: true, attributeFilter: ['src'] })

	ctx.videoURL = video.src
	chrome.runtime.sendMessage({ show: true })
}

function processDeletedVideo(video) {
	if (video.src.length > 0)
		return

	videoRemoveObserver.disconnect()
	videoAddObserver.observe(video, { attributes: true, attributeFilter: ['src'] })

	ctx.videoURL = null
	chrome.runtime.sendMessage({ show: false })
}

function processDocument() {
	bodyObserver.observe(document.body, { childList: true, subtree: true })

	// process current video nodes
	var videos = document.getElementsByTagName("video")
	if (videos.length < 1) {
		return
	}

	for (var i = 0; i < videos.length; i++) {
		processAddedVideo(videos[i])
	}	
}

// main
chrome.runtime.onMessage.addListener(function (msg, sender, cb) {
	if (ctx.videoURL == null)
		return

	console.log('send video: ' + ctx.videoURL)
    cb(ctx.videoURL)
});

processDocument()