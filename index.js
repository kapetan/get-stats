var speedometer = require('speedometer');
var getStats = require('./get-stats');

var MediaStream = window.MediaStream ||
	window.webkitMediaStream ||
	window.mozMediaStream;

var merge = function(left, right) {
	Object.keys(right).forEach(function(key) {
		left[key] = (left[key] || 0) + right[key];
	});
};

var getTrackStats = function(pc, track, callback) {
	getStats(pc, track, function(err, reports) {
		if(err) return callback(err);

		var result = {
			bytesSent: 0,
			packetsSent: 0,
			bytesReceived: 0,
			packetsReceived: 0,
			packetsLost: 0,
			timestamp: null,
			rtt: 0
		};

		for(var i = 0; i < reports.length; i++) {
			var report = reports[i];

			if(report.type === 'ssrc') {
				if(report.bytesSent) result.bytesSent = parseInt(report.bytesSent, 10);
				if(report.packetsSent) result.packetsSent = parseInt(report.packetsSent, 10);
				if(report.googRtt) result.rtt = parseFloat(report.googRtt);

				if(report.bytesReceived) result.bytesReceived = parseInt(report.bytesReceived, 10);
				if(report.packetsReceived) result.packetsReceived = parseInt(report.packetsReceived, 10);

				result.timestamp = new Date(report.timestamp);
				result.packetsLost = parseInt(report.packetsLost, 10);
			}
			if(report.type === 'inboundrtp') {
				result.rtt = report.mozRtt || 0;
				result.timestamp = new Date(report.timestamp);
				result.packetsLost = report.packetsLost;
				result.bytesReceived = report.bytesReceived;
				result.packetsReceived = report.packetsReceived;
			}
			if(report.type === 'outboundrtp') {
				result.bytesSent = report.bytesSent;
				result.packetsSent = report.packetsSent;
			}
		}

		callback(null, result);
	});
};

module.exports = function(pc, input) {
	if(!input) input = pc.getLocalStreams().concat(pc.getRemoteStreams());
	else input = Array.isArray(input) ? input : [input];

	var tracks = [];
	var latest = null;
	var upload = speedometer();
	var download = speedometer();

	input.forEach(function(i) {
		if(i instanceof MediaStream) tracks = tracks.concat(i.getVideoTracks(), i.getAudioTracks());
		else tracks.push(i);
	});

	return function(callback) {
		var count = tracks.length;
		var errored = false;
		var acc = {};
		var rttCount = 0;
		var ts = null;

		tracks.forEach(function(track) {
			getTrackStats(pc, track, function(err, stats) {
				if(errored) return;
				if(err) {
					errored = true;
					return callback(err);
				}

				if(stats.rtt) rttCount++;
				ts = stats.timestamp;

				delete stats.timestamp;

				merge(acc, stats);

				if(!--count) {
					if(rttCount) acc.rtt = acc.rtt / rttCount;
					acc.timestamp = ts;
					acc.upload = upload(acc.bytesSent - (latest ? latest.bytesSent : 0));
					acc.download = download(acc.bytesReceived - (latest ? latest.bytesReceived : 0));

					latest = acc;

					callback(null, acc);
				}
			});
		});
	};
};
