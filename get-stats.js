var webkit = !!window.webkitRTCPeerConnection && !window.RTCPeerConnection;

module.exports = function(pc, track, callback) {
	var onerror = function(e) {
		callback(new Error(e.message || e));
	};

	var onstats = function(response) {
		var result = [];

		if(typeof response.result === 'function') {
			response.result().forEach(function(report) {
				var stats = {
					id: report.id,
					timestamp: report.timestamp,
					type: report.type
				};

				report.names().forEach(function(name) {
					stats[name] = report.stat(name);
				});

				result.push(stats);
			});
		} else if(typeof response.forEach === 'function') {
			response.forEach(function(stats) {
				result.push(stats);
			});
		}

		callback(null, result);
	};

	if(webkit) pc.getStats(onstats, track);
	else pc.getStats(track, onstats, onerror);
};
