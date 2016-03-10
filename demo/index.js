var Peer = require('simple-peer');
var getStats = require('../');

var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);
var webkit = !!navigator.webkitGetUserMedia;
var adapter = (/[\?&]adapter[=&]?/).test(location.search);

if(adapter) {
	require('webrtc-adapter-test');
}

var sender = null;
var receiver = null;
var video = document.getElementById('video');

var render = function(prefix, stats) {
	Object.keys(stats).forEach(function(key) {
		var id = prefix + '-' + key.split(/(?=[A-Z])/).join('-').toLowerCase();
		var el = document.getElementById(id);

		if(el) el.textContent = stats[key];
	});
};

var capture = function() {
	getUserMedia({
		audio: true,
		video: true
	}, function(stream) {
		sender = new Peer({ initiator: true, stream: stream });
		receiver = new Peer();

		sender.on('signal', function(data) {
			receiver.signal(data);
		});

		receiver.on('signal', function(data) {
			sender.signal(data);
		});

		receiver.on('stream', function(stream) {
			video.src = URL.createObjectURL(stream);

			var getReceiverStats = getStats(receiver._pc);
			var getSenderStats = getStats(sender._pc);

			setInterval(function() {
				getReceiverStats(function(err, stats) {
					if(err) throw err;
					render('receiver', stats);
				});

				getSenderStats(function(err, stats) {
					if(err) throw err;
					render('sender', stats);
				});
			}, 1000);
		});
	}, function(e) {
		console.error(e);
	});
};

video.addEventListener('click', function onclick(e) {
	video.removeEventListener('click', onclick, false);
	capture();
}, false);
