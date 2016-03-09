# get-stats

Get basic statistics for a RTCPeerConnection. See the [live demo](https://kapetan.github.io/get-stats/demo/index.html).

	npm install get-stats

# Usage

The exposed function takes a `RTCPeerConnection` instance as first argument and an optional array of media tracks as second argument. If a track array is not provided, statistics for all available tracks, from both local and remote media streams, are accumulated into a single report.

```javascript
var getStats = require('get-stats');

var pc = new RTCPeerConnection();

getStats(pc, function(err, report) {
	if(err) throw err;
	console.log(report);
});
```

The generated report will look something like the following.

```javascript
{
	bytesSent: 358741,
	packetsSent: 440,
	bytesReceived: 421513,
	packetsReceived: 852,
	packetsLost: 0,
	timestamp: Date(),
	rtt: 4,                  // round trip time
	upload: 45386,           // upload speed in bytes/second
	download: 53166.6        // download speed in bytes/second
}
```

For example to get only the upload statistics for a connection, the local media streams can be passed to the `getStats` function.

```javascript
getStats(pc, pc.getLocalStreams(), function(err, report) {
	if(err) throw err;
	console.log('upload speed', report.upload);
});

// Get report for only the video track
var videoTrack = pc.getLocalStreams()[0].getVideoTracks()[0];

getStats(pc, videoTrack, function(err, report) {
	if(err) throw err;
	console.log('upload speed', report.upload);
});
```

Same way download statistics can be calculated using `RTCPeerConnection.getRemoteStreams`.
