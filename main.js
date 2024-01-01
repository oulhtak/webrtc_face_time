import Peeras from "https://peeras.netlify.app/lib/peeras_bundle.js";
import { createRoom, joinRoom, getRoom } from "./lib/db.js";

const peer = new Peeras({
  onConnecting: () => {
    console.log("connecting");
  },
  onFailed: () => console.log("failed"),
  onConnected: (streams) => {
    $form.remove();
    $remoteStream.srcObject = streams[0];
    $remoteStream.className = "";
    $info.classList.add("d-none");
    $controlBtns.classList.remove("d-none");
    startTimer();
    window.localStreams = peer.localStreams;
    window.remoteStreams = streams;
  },
  onDisconnected: () => {
    console.log("disconnected");
  },
  onClosed: () => {
    $remoteStream.className = "d-none";
    $info.classList.remove("d-none");
    $infoText.textContent =
      "call closed, if the user join the room again it will inizlize";
    TIMER_POOSED = true;
  },
  onRemoteMediaStreamStoped: (data) => console.log("stream stopped", data),
  onRemoteMediaStreamResumed: (data) => console.log("stream resumed", data),
});

export async function startApp(localStream) {
  $getUserMediaStatus.classList.add("d-none");
  $form.classList.remove("d-none");
  $form.onsubmit = async function (e) {
    e.preventDefault();
    const id = $roomId.value.trim();
    const options = document.getElementsByName("flexRadioDefault");
    if (options[0].checked) {
      const room = await getRoom(id);
      if (room) {
        alert("the room is already exist, please choose another id");
        return;
      }
      const offer = await peer.initialize({ localStreams: [localStream] });
      await createRoom(id, offer, async (answer) => {
        console.log("call type = ", peer.checkCallOrAnswerType(answer));
        peer.verify(answer);
      });
      e.target.innerHTML = `
      <div class="alert alert-primary" role="alert">
        waiting for someone to join the room <strong>${id}</strong>
      </div>
    `;
      return;
    }
    joinRoom(id, async (offer) => {
      console.log("call type = ", peer.checkCallOrAnswerType(offer));
      const answer = await peer.answer({
        offer: offer,
        localStreams: [localStream],
      });
      return answer;
    });
  };

  //SHOW LOCAL STREAM ON THE DOM
  $myStream.srcObject = localStream;
  $hideLocalStreamBtn.classList.remove("d-none");

  $changeWeightBtn.onclick = function () {
    if ($main.className.includes("mobile")) {
      $main.classList.remove("a-mobile-camera");
      $changeWeightBtn.getElementsByTagName("i")[0].className =
        "fa fa-mobile-alt";
    } else {
      $main.classList.add("a-mobile-camera");
      $changeWeightBtn.getElementsByTagName("i")[0].className = "fa fa-laptop";
    }
  };

  $muteMic.onclick = function () {
    const element = $muteMic.getElementsByTagName("i")[0];
    if (element.className.includes("slash")) {
      element.className = "fa fa-microphone";
      peer.localStreams[0].audio.resume();
    } else {
      element.className = "fa fa-microphone-slash";
      peer.localStreams[0].audio.stop();
    }
  };

  $muteCam.onclick = function () {
    const element = $muteCam.getElementsByTagName("i")[0];
    if (element.className.includes("slash")) {
      element.className = "fa fa-video";
      peer.localStreams[0].video.resume();
    } else {
      element.className = "fa fa-video-slash";
      peer.localStreams[0].video.stop();
    }
  };

  $close.onclick = () => {
    peer.close();
  };

  $hideLocalStreamBtn.onclick = function () {
    const element = $hideLocalStreamBtn.getElementsByTagName("i")[0];
    if (element.className.includes("slash")) {
      element.className = "fa fa-eye";
      $myStream.className = "";
    } else {
      element.className = "fa fa-eye-slash";
      $myStream.className = "d-none";
    }
  };
}

var TIMER_POOSED = false;
function startTimer() {
  var seconds = 0;
  var munites = 0;
  var hours = 0;
  if (TIMER_POOSED) return (TIMER_POOSED = false);
  setInterval(function () {
    let s = seconds < 10 ? ":0" + seconds : ":" + seconds;
    let m = munites < 10 ? ":0" + munites : ":" + munites;
    let h = hours < 10 ? "0" + hours : "" + hours;
    $timer.textContent = h + m + s;

    if (!TIMER_POOSED) seconds++;
    if (seconds == 60) {
      seconds = 0;
      munites++;
      if (munites == 60) {
        munites = 0;
        hours++;
      }
    }
  }, 1000);
}
