class Endpoint {
	constructor(hostname, port) {
		this.url = 'http://' + hostname + ':' + port + '/jsonrpc'
	}

	post(method, params) {
		var request = {
			'jsonrpc': '2.0',
			'id': 1,
			'method': method
		}
		if (params != null) {
			request['params'] = params
		}

		var result = null

		var xhttp = new XMLHttpRequest()
		xhttp.onreadystatechange = function() {
			if (this.readyState != 4)
				return
			
			if (this.status != 200) {
	    		console.error(this)
	    		return
	    	}

			result = JSON.parse(this.responseText)
		}
		xhttp.open('POST', this.url, false)
		xhttp.setRequestHeader('Content-Type', 'application/json')
		xhttp.send(JSON.stringify(request))

		return result
	}
}

class JSONRPC {
	static version(endpt) {
		var response = endpt.post('JSONRPC.Version')
		if (response == null || response.result.length == 0)
			return null

		return response.result.version.major + '.' + response.result.version.minor + '.' + response.result.version.patch
	}
}

class Player {
	static GetPlayer(endpt, type) {
		var response = endpt.post('Player.GetActivePlayers')
		if (response == null || response.result.length == 0)
			return null

		for (var i in response.result) {
			var player = response.result[i]
			if (player.type != type)
				continue
			
			return new Player(endpt, player.playerid)
		}

		console.error(type + ' player not found')
		return null
	}

	static OpenPlayer(endpt, playlist) {
		var params = {
			item: { playlistid: playlist.id }
		}
		var response = endpt.post('Player.Open', params)
		if (response == null || response.length == 0)
			return null

		return response.result == 'OK'
	}

	constructor(endpt, id) {
		this.endpt = endpt
		this.id = id
	}
}

class Playlist {
	static GetPlaylist(endpt, type) {
		var response = endpt.post('Playlist.GetPlaylists')
		if (response == null || response.result.length == 0)
			return null

		for (var i in response.result) {
			var playlist = response.result[i]
			if (playlist.type != type)
				continue
			
			return new Playlist(endpt, playlist.playlistid)
		}

		console.error(type + ' playlist not found')
		return null
	}

	constructor(endpt, id) {
		this.endpt = endpt
		this.id = id
	}

	add(file) {
		var params = {
			playlistid: this.id,
			item: { file: file }
		}

		var response = this.endpt.post('Playlist.Add', params)
		if (response == null || response.length == 0)
			return false

		return response.result == 'OK'
	}

	clear() {
		var params = { playlistid: this.id }
		var response = this.endpt.post('Playlist.Clear', params)
		if (response == null || response.length == 0)
			return false

		return response.result == 'OK'
	}
}

class Kodi {
	constructor(hostname, port) {
		this.endpt = new Endpoint(hostname, port)
	}

	sendVideo(videoURL) {
		var playlist = Playlist.GetPlaylist(this.endpt, 'video')
		if (playlist == null) {
			console.log('playlist not found')
			return
		}

		if (!playlist.clear()) {
			console.log('failed to clear playlist')
			return
		}

		if (!playlist.add(videoURL)) {
			console.log('failed to add video to playlist')
			return
		}

		var player = Player.GetPlayer(this.endpt, 'video')
		if (player != null) {
			console.log('player already exists')
			return
		}

		player = Player.OpenPlayer(this.endpt, playlist)
	}
}

self.onmessage = function(msg) {
	var kodi = new Kodi(msg.data.hostname, msg.data.port)
	kodi.sendVideo(msg.data.videoURL)
}
