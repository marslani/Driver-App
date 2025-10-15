// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css";

// const API_BASE = "http://localhost:5000/api";

// const App = () => {
//   const [driverName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [logs, setLogs] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [timer, setTimer] = useState(null);

//   const checkpoints = [
//     "Leave Dealer Office",
//     "Arrive at UCIC Plant",
//     "Arrive at Sales Office",
//     "Arrive at Weighbridge",
//     "Leave UCIC Plant",
//     "Arrive at Delivery Location",
//   ];

//   // --- Timer ---
//   const startTimer = (seconds) => {
//     if (timer) clearInterval(timer);
//     setTimeLeft(seconds);

//     const newTimer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(newTimer);
//           alert("⚠️ 3 hours passed! Driver has not pressed the next point.");
//           sendDelayEmail();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);
//     setTimer(newTimer);
//   };

//   // --- Send delay email ---
//   const sendDelayEmail = async () => {
//     try {
//       await axios.post(`${API_BASE}/delay-email`, { driverName });
//       console.log("Delay email sent!");
//     } catch (err) {
//       console.error("Email send failed", err);
//     }
//   };

//   // --- Format timer display ---
//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   // --- Handle checkpoint click ---
//   const handleCheckpoint = async (pointName) => {
//     setLoading(true);
//     setMessage("");
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const gps = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };
//         try {
//           await axios.post(`${API_BASE}/checkpoint`, { driverName, pointName, gps });
//           setMessage(`✅ ${pointName} recorded successfully!`);
//           startTimer(2 * 60); // 2 minutes for demo
//           fetchLogs(); // Live update logs
//         } catch (err) {
//           console.error(err);
//           setMessage("❌ Error sending data!");
//         } finally {
//           setLoading(false);
//         }
//       },
//       (err) => {
//         console.error(err);
//         setLoading(false);
//         alert("GPS permission denied!");
//       }
//     );
//   };

//   // --- Fetch last 1 minute logs ---
//   const fetchLogs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/logs`);
//       setLogs(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // --- Auto-refresh logs every 5 seconds ---
//   useEffect(() => {
//     const interval = setInterval(fetchLogs, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // --- Circular progress ---
//   const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

//   return (
//     <div className="app-container">
//       <h1>🚛 Driver Log App</h1>

//       {/* Timer */}
//       {timeLeft > 0 && (
//         <div className="circle-timer">
//           <svg width="180" height="180">
//             <circle
//               stroke="url(#grad)"
//               strokeWidth="10"
//               fill="transparent"
//               r="75"
//               cx="90"
//               cy="90"
//               style={{
//                 strokeDasharray: `${2 * Math.PI * 75}`,
//                 strokeDashoffset: `${2 * Math.PI * 75 * ((100 - progress) / 100)}`,
//                 transition: "stroke-dashoffset 1s linear",
//               }}
//             />
//             <defs>
//               <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
//                 <stop offset="0%" stopColor="#00ff9d" />
//                 <stop offset="100%" stopColor="#00aaff" />
//               </linearGradient>
//             </defs>
//           </svg>
//           <div className="timer-text">{formatTime(timeLeft)}</div>
//         </div>
//       )}

//       {/* Checkpoint buttons */}
//       <div className="button-container">
//         {checkpoints.map((point, i) => (
//           <button key={i} onClick={() => handleCheckpoint(point)} disabled={loading} className="btn">
//             {point}
//           </button>
//         ))}
//       </div>

//       {loading && <p>⏳ Sending data...</p>}
//       {message && <p className="message">{message}</p>}

//       {/* Logs Table */}
//       <div className="table-container">
//         <h2>📊 Last 1 Minute Logs</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Point</th>
//               <th>Latitude</th>
//               <th>Longitude</th>
//               <th>Time</th>
//             </tr>
//           </thead>
//           <tbody>
//             {logs.length === 0 ? (
//               <tr>
//                 <td colSpan="5">No logs in the last 1 minute</td>
//               </tr>
//             ) : (
//               logs.map((log, li) =>
//                 log.checkpoints.map((cp, i) => (
//                   <tr key={`${li}-${i}`}>
//                     <td>{cp.pointName}</td>
//                     <td>{cp.gps.lat}</td>
//                     <td>{cp.gps.lng}</td>
//                     <td>{new Date(cp.timestamp).toLocaleTimeString()}</td>
//                   </tr>
//                 ))
//               )
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default App;

























import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

const App = () => {
  const [driverName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timer, setTimer] = useState(null);

  // Track the current checkpoint index
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkpoints = [
    "Leave Dealer Office",
    "Arrive at UCIC Plant",
    "Arrive at Sales Office",
    "Arrive at Weighbridge",
    "Leave UCIC Plant",
    "Arrive at Delivery Location",
  ];

  // --- Timer ---
  const startTimer = (seconds) => {
    if (timer) clearInterval(timer);
    setTimeLeft(seconds);

    const newTimer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          alert("⚠️ 3 hours passed! Driver has not pressed the next point.");
          sendDelayEmail();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimer(newTimer);
  };

  const sendDelayEmail = async () => {
    try {
      await axios.post(`${API_BASE}/delay-email`, { driverName });
      console.log("Delay email sent!");
    } catch (err) {
      console.error("Email send failed", err);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- Handle checkpoint click ---
  const handleCheckpoint = async (pointName) => {
    setLoading(true);
    setMessage("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const gps = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        try {
          await axios.post(`${API_BASE}/checkpoint`, { driverName, pointName, gps });
          setMessage(`✅ ${pointName} recorded successfully!`);

          // Move to next checkpoint
          setCurrentIndex((prev) => prev + 1);

          startTimer(2 * 60); // 2 minutes for demo
          fetchLogs(); // Live update logs
        } catch (err) {
          console.error(err);
          setMessage("❌ Error sending data!");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setLoading(false);
        alert("GPS permission denied!");
      }
    );
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/logs`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

  return (
    <div className="app-container">
      <h1>🚛 Driver Log App</h1>

      {/* Timer */}
      {timeLeft > 0 && (
        <div className="circle-timer">
          <svg width="180" height="180">
            <circle
              stroke="url(#grad)"
              strokeWidth="10"
              fill="transparent"
              r="75"
              cx="90"
              cy="90"
              style={{
                strokeDasharray: `${2 * Math.PI * 75}`,
                strokeDashoffset: `${2 * Math.PI * 75 * ((100 - progress) / 100)}`,
                transition: "stroke-dashoffset 1s linear",
              }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ff9d" />
                <stop offset="100%" stopColor="#00aaff" />
              </linearGradient>
            </defs>
          </svg>
          <div className="timer-text">{formatTime(timeLeft)}</div>
        </div>
      )}

      {/* Checkpoint buttons */}
      <div className="button-container">
        {checkpoints.map((point, i) => (
          <button
            key={i}
            onClick={() => handleCheckpoint(point)}
            disabled={loading || i !== currentIndex} // Only next checkpoint is enabled
            className="btn"
          >
            {point}
          </button>
        ))}
      </div>

      {loading && <p>⏳ Sending data...</p>}
      {message && <p className="message">{message}</p>}

      {/* Logs Table */}
      <div className="table-container">
        <h2>📊 Last 1 Minute Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Point</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5">No logs in the last 1 minute</td>
              </tr>
            ) : (
              logs.map((log, li) =>
                log.checkpoints.map((cp, i) => (
                  <tr key={`${li}-${i}`}>
                    <td>{cp.pointName}</td>
                    <td>{cp.gps.lat}</td>
                    <td>{cp.gps.lng}</td>
                    <td>{new Date(cp.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
