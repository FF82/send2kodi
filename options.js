function save_options() {
	var hostname = document.getElementById('hostname').value;
	var port = document.getElementById('port').value;
	chrome.storage.sync.set({
		hostname: hostname,
		port: port
	}, function() {
	    // Update status to let user know options were saved.
    	var status = document.getElementById('status');
    	status.textContent = 'Options saved.';
    	setTimeout(function() {
    		status.textContent = '';
    	}, 750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		hostname: '',
		port: ''
	}, function(items) {
		document.getElementById('hostname').value = items.hostname;
		document.getElementById('port').value = items.port;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
