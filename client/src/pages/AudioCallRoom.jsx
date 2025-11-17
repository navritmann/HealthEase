// client/src/pages/AudioCallRoom.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

export default function AudioCallRoom() {
  const { roomId } = useParams();
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Waiting to join...");
  const [isMicOn, setIsMicOn] = useState(true);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      pcRef.current?.close();
      localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  const joinRoom = async () => {
    if (!pin) return alert("Enter PIN first");

    setStatus("Connecting…");
    socketRef.current = io(`${process.env.REACT_APP_SOCKET_URL}/video`, {
      transports: ["websocket"],
      auth: { roomId, pin },
    });

    socketRef.current.on("connect_error", (err) => {
      alert(err.message || "Auth failed");
      setStatus("Auth failed");
    });

    socketRef.current.on("connect", () => {
      setStatus("Connected");
      setConnected(true);
    });

    // --- WebRTC ---
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Local audio
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));

    // Remote audio
    pcRef.current.ontrack = (e) => {
      if (remoteAudioRef.current)
        remoteAudioRef.current.srcObject = e.streams[0];
    };

    pcRef.current.onicecandidate = (e) => {
      if (e.candidate)
        socketRef.current.emit("signal:ice", { candidate: e.candidate });
    };

    socketRef.current.on("signal:offer", async ({ sdp }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socketRef.current.emit("signal:answer", { sdp: answer });
    });

    socketRef.current.on("signal:answer", async ({ sdp }) => {
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socketRef.current.on("signal:ice", async ({ candidate }) => {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socketRef.current.on("peer:joined", async () => {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socketRef.current.emit("signal:offer", { sdp: offer });
    });
  };

  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    }
  };

  const leaveRoom = () => {
    socketRef.current?.disconnect();
    pcRef.current?.close();
    localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    setConnected(false);
    setStatus("Left the call");
  };

  return (
    <div style={styles.root}>
      <h2>Audio Call – Room {roomId}</h2>

      {!connected ? (
        <div style={styles.joinBox}>
          <input
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />
          <button onClick={joinRoom} style={styles.btn}>
            Join
          </button>
        </div>
      ) : (
        <div style={styles.controls}>
          <button onClick={toggleMic} style={styles.btn}>
            {isMicOn ? "Mute" : "Unmute"}
          </button>
          <button
            onClick={leaveRoom}
            style={{ ...styles.btn, background: "#d9534f" }}
          >
            Leave
          </button>
        </div>
      )}

      <p>{status}</p>
      <audio ref={remoteAudioRef} autoPlay playsInline />
    </div>
  );
}

const styles = {
  root: {
    padding: 20,
    textAlign: "center",
    color: "#fff",
    background: "#0b1020",
    minHeight: "100vh",
  },
  joinBox: { display: "flex", justifyContent: "center", gap: 8 },
  controls: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 12,
  },
  btn: {
    padding: "8px 16px",
    borderRadius: 8,
    background: "#5b8cff",
    border: "none",
    color: "#fff",
  },
  input: { padding: 8, borderRadius: 6, width: 120, border: "1px solid #ccc" },
};
