# get-stats

Basic RTCPeerConnection statistics. See the [live demo](https://kapetan.github.io/get-stats/demo/index.html).

	npm install get-stats

# Usage

The exposed constructor takes a `RTCPeerConnection` instance as first argument and an optional array of media tracks as second argument. If a track array is not provided, statistics for all available tracks, from both local and remote media streams, are accumulated into a single report.

The constructor returns a function which must be called with a callback to get the report.

```javascript
var pc = new RTCPeerConnection();

var getStats = require('get-stats')(pc);

getStats(function(err, report) {
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
	rtt: 4,                         // round trip time
	bytesSentSpeed: 45386,          // upload speed in bytes/second
	bytesReceivedSpeed: 53166.6,    // download speed in bytes/second
	packetsLostSpeed: 0             // average packet lost over the measured period
}
```

For example to get only the upload statistics for a connection, the local media streams can be passed to the `getStats` function.

```javascript
var getStats = require('get-stats')(pc, pc.getLocalStreams());

getStats(function(err, report) {
	if(err) throw err;
	console.log('upload speed', report.bytesSentSpeed);
});

// Get report for only the video track
var videoTrack = pc.getLocalStreams()[0].getVideoTracks()[0];
var getStats = require('get-stats')(pc, videoTrack);

getStats(function(err, report) {
	if(err) throw err;
	console.log('upload speed', report.bytesSentSpeed);
});
```

Same way download statistics can be calculated using `RTCPeerConnection.getRemoteStreams`.
