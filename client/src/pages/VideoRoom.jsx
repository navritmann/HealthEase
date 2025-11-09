// client/src/pages/VideoRoom.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

export default function VideoRoom() {
  const { roomId } = useParams();
  const [pin, setPin] = useState("");
  const [connected, setConnected] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Waiting for join...");
  const [startTime, setStartTime] = useState(null);

  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);

  // Nice room avatar initials
  const roomMonogram = useMemo(() => {
    const chunk = (roomId || "R").slice(0, 2).toUpperCase();
    return chunk;
  }, [roomId]);

  // Ask for mic/cam early
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localRef.current) localRef.current.srcObject = stream;
        setStatusMsg("Ready to join");
      } catch (e) {
        setStatusMsg("Camera/Mic permission blocked. Enable to join.");
      }
    })();

    return () => {
      // cleanup on unmount
      if (pcRef.current) pcRef.current.close();
      if (socketRef.current) socketRef.current.disconnect();
      localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
      screenTrackRef.current?.stop?.();
    };
  }, []);

  const connect = async () => {
    if (!pin) return;

    setStatusMsg("Connecting…");
    socketRef.current = io("http://localhost:5000/video", {
      transports: ["websocket"],
      auth: { roomId, pin },
    });

    socketRef.current.on("connect_error", (err) => {
      setStatusMsg(err?.message || "Socket auth failed");
      alert(err?.message || "Socket auth failed");
    });

    socketRef.current.on("connect", () => {
      setConnected(true);
      setStatusMsg("Connected");
      setStartTime(Date.now());
    });

    // Create RTCPeerConnection
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Local tracks
    localStreamRef.current
      ?.getTracks()
      ?.forEach((t) => pcRef.current.addTrack(t, localStreamRef.current));

    // Remote track
    pcRef.current.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
    };

    // ICE candidates
    pcRef.current.onicecandidate = (e) => {
      if (e.candidate)
        socketRef.current.emit("signal:ice", { candidate: e.candidate });
    };

    // Signaling handlers
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
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        /* ignore */
      }
    });

    // When a peer joins, initiate offer
    socketRef.current.on("peer:joined", async () => {
      if (!pcRef.current.localDescription) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socketRef.current.emit("signal:offer", { sdp: offer });
      }
    });
  };

  // --- UI actions ---
  const toggleMic = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    tracks.forEach((t) => (t.enabled = !t.enabled));
    const now = !isMicOn;
    setIsMicOn(now ? false : true); // fix flip: we want new state to reflect enabled
    setIsMicOn(tracks[0]?.enabled ?? false);
  };

  const toggleCam = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    tracks.forEach((t) => (t.enabled = !t.enabled));
    setIsCamOn(tracks[0]?.enabled ?? false);
  };

  const leaveRoom = () => {
    setStatusMsg("Leaving…");
    socketRef.current?.disconnect();
    pcRef.current?.close();
    localStreamRef.current?.getTracks()?.forEach((t) => t.stop());
    screenTrackRef.current?.stop?.();
    setConnected(false);
    setIsSharing(false);
    setStatusMsg("Left the room");
  };

  const copyInvite = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setStatusMsg("Room link copied!");
      setTimeout(
        () => setStatusMsg(connected ? "Connected" : "Ready to join"),
        1200
      );
    } catch {
      setStatusMsg("Failed to copy");
    }
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const screenTrack = displayStream.getVideoTracks()[0];
      screenTrackRef.current = screenTrack;

      // Replace the sender's video track
      const sender = pcRef.current
        ?.getSenders()
        ?.find((s) => s.track && s.track.kind === "video");

      if (sender) {
        await sender.replaceTrack(screenTrack);
        setIsSharing(true);
        setStatusMsg("Sharing screen");
      }

      // When user stops sharing
      screenTrack.onended = async () => {
        await stopScreenShare();
      };
    } catch (e) {
      // cancelled
    }
  };

  const stopScreenShare = async () => {
    const camTrack = localStreamRef.current?.getVideoTracks()?.[0];
    const sender = pcRef.current
      ?.getSenders()
      ?.find((s) => s.track && s.track.kind === "video");
    if (sender && camTrack) {
      await sender.replaceTrack(camTrack);
    }
    screenTrackRef.current?.stop?.();
    setIsSharing(false);
    setStatusMsg("Camera active");
  };

  // Call duration
  const duration = useMemo(() => {
    if (!startTime || !connected) return "00:00";
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const mm = String(Math.floor(diff / 60)).padStart(2, "0");
    const ss = String(diff % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [startTime, connected, statusMsg]); // statusMsg forces refresh

  return (
    <div className="vr-root">
      {/* Top Bar */}
      <header className="vr-topbar">
        <div className="vr-left">
          <div className="vr-logo">{roomMonogram}</div>
          <div className="vr-room">
            <div className="vr-room-name">Room #{roomId}</div>
            <div className="vr-room-meta">
              <span className={`vr-dot ${connected ? "on" : "off"}`} />
              {connected ? "Connected" : "Not connected"} · {duration}
            </div>
          </div>
        </div>
        <div className="vr-right">
          <button
            className="vr-btn ghost"
            onClick={copyInvite}
            title="Copy invite link"
          >
            {/* Link icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 14a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M14 10a5 5 0 0 1 0 7l-2 2a5 5 0 1 1-7-7l1-1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span>Copy link</span>
          </button>
        </div>
      </header>

      {/* Status */}
      <div className="vr-status">{statusMsg}</div>

      {/* Main Stage */}
      <main className="vr-stage">
        {!connected && (
          <div className="vr-join-card">
            <div className="vr-join-title">Enter Room PIN</div>
            <input
              className="vr-input"
              placeholder="4-6 digits"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={10}
            />
            <button
              className="vr-btn primary"
              onClick={connect}
              disabled={!pin}
            >
              Join Room
            </button>
            <div className="vr-join-hint">
              Make sure your camera & mic are enabled.
            </div>
          </div>
        )}

        <div className={`vr-video-grid ${connected ? "connected" : "blurred"}`}>
          <div className="vr-tile">
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className={`vr-video ${!isCamOn ? "off" : ""}`}
            />
            {!isCamOn && <div className="vr-video-off">Camera Off</div>}
            <div className="vr-nameplate">You</div>
          </div>

          <div className="vr-tile">
            <video ref={remoteRef} autoPlay playsInline className="vr-video" />
            <div className="vr-nameplate">Guest</div>
          </div>
        </div>

        {/* Controls */}
        <div className="vr-controls">
          <button
            className={`vr-ctl ${isMicOn ? "" : "danger"}`}
            onClick={toggleMic}
            title={isMicOn ? "Mute" : "Unmute"}
          >
            {/* Mic icon */}
            {isMicOn ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 14a4 4 0 0 0 4-4V6a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M19 10a7 7 0 0 1-14 0M12 17v4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 5v5a3 3 0 0 0 5 2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M15 11V6a3 3 0 0 0-5-2.2M19 10a7 7 0 0 1-11.6 5.2M12 17v4M3 3l18 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          <button
            className={`vr-ctl ${isCamOn ? "" : "danger"}`}
            onClick={toggleCam}
            title={isCamOn ? "Turn camera off" : "Turn camera on"}
          >
            {/* Camera icon */}
            {isCamOn ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M17 10l4-2v8l-4-2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 8a3 3 0 0 1 3-3h4M4 16a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-1"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M17 10l4-2v8l-2.7-1.4M3 3l18 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {!isSharing ? (
            <button
              className="vr-ctl"
              onClick={startScreenShare}
              title="Share screen"
            >
              {/* Screen share */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M8 20h8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : (
            <button
              className="vr-ctl warning"
              onClick={stopScreenShare}
              title="Stop sharing"
            >
              {/* Stop share */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <rect
                  x="9"
                  y="9"
                  width="6"
                  height="4"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}

          <button
            className="vr-ctl leave"
            onClick={leaveRoom}
            title="Leave call"
          >
            {/* End call */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 14c2.7-1.3 5.3-2 8-2s5.3.7 8 2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M7 16l-2 3M17 16l2 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </main>

      {/* Page styles */}
      <style>{css}</style>
    </div>
  );
}

const css = `
:root {
  --bg: #0b1020;
  --panel: rgba(255,255,255,0.06);
  --panel-strong: rgba(255,255,255,0.12);
  --text: #e9eefb;
  --muted: #aab3cf;
  --brand: #5b8cff;
  --ok: #42d392;
  --warn: #ffb020;
  --danger: #ff5d5d;
}
* { box-sizing: border-box; }
body { background: var(--bg); }

.vr-root {
  min-height: 100vh;
  background: radial-gradient(1200px 800px at 20% -10%, #1c2b64 0%, transparent 60%),
              radial-gradient(1000px 700px at 120% 20%, #2d3a86 0%, transparent 55%),
              var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
}

.vr-topbar {
  height: 64px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border-bottom: 1px solid var(--panel-strong);
  backdrop-filter: blur(10px);
}

.vr-left { display: flex; align-items: center; gap: 12px; }
.vr-logo {
  width: 38px; height: 38px; border-radius: 12px;
  background: linear-gradient(135deg, #6a8dff, #9faeff);
  color: #0c1127; display: grid; place-items: center;
  font-weight: 800; letter-spacing: 0.5px;
}
.vr-room-name { font-weight: 700; font-size: 15px; }
.vr-room-meta { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
.vr-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.vr-dot.on { background: var(--ok); box-shadow: 0 0 10px var(--ok); }
.vr-dot.off { background: #6b7280; }

.vr-right { display: flex; gap: 10px; }
.vr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 10px; border: 1px solid var(--panel-strong);
  background: var(--panel); color: var(--text); cursor: pointer;
  transition: transform .08s ease, background .2s ease, border-color .2s ease;
}
.vr-btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.2); }
.vr-btn.primary { background: linear-gradient(135deg, #5273ff, #7c94ff); border-color: transparent; }
.vr-btn.ghost { background: transparent; }

.vr-status {
  text-align: center; padding: 8px 12px; font-size: 13px; color: var(--muted);
}

.vr-stage {
  flex: 1;
  position: relative;
  padding: 18px;
  display: grid;
  place-items: center;
}

.vr-join-card {
  position: absolute; z-index: 3;
  width: min(420px, 92vw);
  padding: 22px;
  border-radius: 16px;
  background: rgba(10, 15, 35, 0.7);
  border: 1px solid var(--panel-strong);
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  backdrop-filter: blur(12px);
}
.vr-join-title { font-size: 18px; font-weight: 700; margin-bottom: 10px; }
.vr-input {
  width: 100%; padding: 12px 14px; margin: 8px 0 14px;
  border-radius: 12px; border: 1px solid var(--panel-strong);
  background: rgba(255,255,255,0.04); color: var(--text);
  outline: none;
}
.vr-input:focus { border-color: rgba(255,255,255,0.25); }
.vr-join-hint { color: var(--muted); font-size: 12px; margin-top: 8px; }

.vr-video-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 14px;
  width: 100%;
  max-width: 1200px;
  transition: filter .25s ease;
}
.vr-video-grid.blurred { filter: blur(2px) brightness(0.9); }
.vr-video-grid.connected { filter: none; }

.vr-tile {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #0a0f23;
  border: 1px solid var(--panel-strong);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03), 0 8px 22px rgba(0,0,0,0.35);
  aspect-ratio: 16/9;
}

.vr-video {
  width: 100%; height: 100%; object-fit: cover; background: #000;
}
.vr-video.off { filter: grayscale(100%) brightness(0.5); }

.vr-video-off {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: #c7cbe0; font-weight: 700; letter-spacing: .5px;
  background: linear-gradient(180deg, rgba(12,17,40,0.8), rgba(12,17,40,0.4));
}

.vr-nameplate {
  position: absolute; left: 10px; bottom: 10px;
  background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15);
  padding: 6px 10px; font-size: 12px; border-radius: 999px; color: #eaefff;
  backdrop-filter: blur(6px);
}

.vr-controls {
  position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%);
  display: flex; gap: 10px; z-index: 2;
  background: rgba(10, 15, 35, 0.65); border: 1px solid var(--panel-strong);
  padding: 10px; border-radius: 14px; backdrop-filter: blur(10px);
}

.vr-ctl {
  width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
  border: 1px solid var(--panel-strong); background: var(--panel);
  color: var(--text); cursor: pointer; transition: transform .08s ease, background .2s ease, border-color .2s ease;
}
.vr-ctl:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); }
.vr-ctl.warning { background: rgba(255, 176, 32, 0.12); border-color: rgba(255,176,32,0.3); color: #ffd385; }
.vr-ctl.danger { background: rgba(255, 93, 93, 0.12); border-color: rgba(255,93,93,0.3); color: #ff9c9c; }
.vr-ctl.leave { background: linear-gradient(135deg, #ff5d5d, #ff7b7b); border-color: transparent; color: #0b1020; font-weight: 700; }
@media (max-width: 880px) {
  .vr-video-grid { grid-template-columns: 1fr; }
}
`;
