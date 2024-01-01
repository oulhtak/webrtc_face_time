This project is an extension of my WebRTC library [peeras](https://github.com/oulhtak/peerass), where I added support to facilitate media streaming between peers.

### Usage

Take a look at how to connect to a peer in the documentation [here](https://github.com/oulhtak/peeras/blob/master/readMe.md).

#### Exchanging Media Streams

Add streams to the peers, on this example we will be sending more than one stream

```js
// Firsly, get the user streams, for example camera and mic stream
// You need for sure to handle async call errors if their occured
let microphoneAudioStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true,
});

const screenRecordingStream = navigator.mediaDevices.getDisplayMedia({
  video: true,
  audio: true,
});
```

```js
//peer_1 on browser_1
const offer = await peer.initialize({
  localStreams: [microphoneAudioStream, screenRecordingStream],
});
```

```js
//peer_2 on browser_2
const answer = await peer.answer({
  offer: offer,
  localStreams: [microphoneAudioStream, screenRecordingStream],
});
```

To get the other peer steams, you have to update the `onConnected` listener to accept remote streams.

```js
onConnected: (remoteStreams) => {
   // Eeach stream has an streamIndex key to identify it by its index in the `remoteStreams` array.
   // on this example microphoneAudioStream will have streamIndex 0 and screenRecordingStream 1

   // To bind one of the streams to an HTML5 video element:
    const video = document.getElementByTagName("video")[0];
    video.srcObject = remoteStreams[0];
 },
```

Control your stream by enabling and disabling video and audio tracks.

```js
//audio example
peer.localStreams[0].audio.stop();
peer.localStreams[0].audio.resume();

//video example
peer.localStreams[0].video.stop();
peer.localStreams[0].video.resume();
```

then the other peer can catch these changes by adding some extra listener to the `eventListner`

```js
  // The `type` can be either the audio or the video track of a stream.
  onRemoteMediaStreamStoped: ({ type, streamIndex }) => ...
  onRemoteMediaStreamResumed: ({ type, streamIndex }) => ...
```
