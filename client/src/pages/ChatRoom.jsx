// client/src/pages/ChatRoom.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

export default function ChatRoom() {
  const { roomId } = useParams();
  const [pin, setPin] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(null);

  const socketRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      clearTimeout(typingTimer.current);
    };
  }, []);

  const joinChat = () => {
    if (!pin) return alert("Enter PIN");
    socketRef.current = io("http://localhost:5000/video", {
      transports: ["websocket"],
      auth: { roomId, pin },
    });

    socketRef.current.on("connect_error", (err) => alert(err.message));
    socketRef.current.on("connect", () => setConnected(true));

    socketRef.current.on("chat:message", (msg) =>
      setMessages((m) => [...m, msg])
    );

    socketRef.current.on("chat:typing", ({ displayName, typing }) => {
      setTyping(typing ? displayName || "Guest" : null);
    });
  };

  const sendMsg = () => {
    if (!draft.trim()) return;
    socketRef.current.emit("chat:send", {
      text: draft,
      displayName: displayName || "Me",
    });
    setDraft("");
  };

  const handleTyping = (e) => {
    setDraft(e.target.value);
    socketRef.current.emit("chat:typing", {
      typing: true,
      displayName: displayName || "Me",
    });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current.emit("chat:typing", { typing: false });
    }, 900);
  };

  return (
    <div style={styles.root}>
      <h2>Live Chat – Room {roomId}</h2>

      {!connected ? (
        <div style={styles.joinBox}>
          <input
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />
          <button onClick={joinChat} style={styles.btn}>
            Join
          </button>
        </div>
      ) : (
        <>
          <div style={styles.chatBox}>
            {messages.map((m, i) => (
              <div key={i}>
                <strong>{m.displayName || "Guest"}:</strong> {m.text}
              </div>
            ))}
            {typing && <em>{typing} is typing…</em>}
          </div>
          <div style={styles.inputRow}>
            <input
              placeholder="Type message..."
              value={draft}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              style={styles.textInput}
            />
            <button onClick={sendMsg} style={styles.btn}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  root: {
    background: "#0b1020",
    color: "#fff",
    minHeight: "100vh",
    padding: 20,
    textAlign: "center",
  },
  joinBox: { display: "flex", justifyContent: "center", gap: 8 },
  input: { padding: 8, borderRadius: 6, width: 120, border: "1px solid #ccc" },
  btn: {
    padding: "8px 16px",
    borderRadius: 8,
    background: "#5b8cff",
    border: "none",
    color: "#fff",
  },
  chatBox: {
    border: "1px solid #333",
    borderRadius: 8,
    padding: 10,
    height: 300,
    overflowY: "auto",
    textAlign: "left",
    margin: "10px auto",
    width: "90%",
    background: "rgba(255,255,255,0.05)",
  },
  inputRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    width: "90%",
    margin: "auto",
  },
  textInput: { flex: 1, padding: 8, borderRadius: 6, border: "1px solid #555" },
};
