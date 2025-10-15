// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// const API_BASE = "http://localhost:5000/api";

// const App = () => {
//   const [driverName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [logs, setLogs] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const intervalRef = useRef(null);
//   const timeoutRef = useRef(null);
//   const emailSentRef = useRef(false);

//   const checkpoints = [
//     "Leave Dealer Office",
//     "Arrive at UCIC Plant",
//     "Arrive at Sales Office",
//     "Arrive at Weighbridge",
//     "Leave UCIC Plant",
//     "Arrive at Delivery Location",
//   ];

//   const clearTimers = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }
//   };

//   const sendDelayEmail = async () => {
//     if (emailSentRef.current) return;
//     emailSentRef.current = true;

//     try {
//       await axios.post(`${API_BASE}/delay-email`, { driverName });
//       console.log("Delay email sent!");
//     } catch (err) {
//       console.error("Email send failed", err);
//     }
//   };

//   const startTimer = (seconds) => {
//     clearTimers();
//     emailSentRef.current = false;
//     setTimeLeft(seconds);

//     intervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     timeoutRef.current = setTimeout(() => {
//       if (!emailSentRef.current) {
//         alert("⚠️ 3 hours passed! Driver has not pressed the next point.");
//         sendDelayEmail();
//       }
//       setTimeLeft(0);
//       clearTimers();
//     }, seconds * 1000);
//   };

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

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
//           setCurrentIndex((prev) => prev + 1);
//           startTimer(60); // demo: 1 minute
//           fetchLogs();
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

//   const fetchLogs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/logs`);
//       setLogs(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(fetchLogs, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     return () => {
//       clearTimers();
//     };
//   }, []);

//   const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

//   return (
//     <div className="app-container">
//       <h1>🚛 Driver Log App</h1>

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

//       {/* ✅ Buttons with color change */}
//       <div className="button-container">
//         {checkpoints.map((point, i) => (
//           <button
//             key={i}
//             onClick={() => handleCheckpoint(point)}
//             disabled={loading || i !== currentIndex}
//             className={`btn ${
//               i < currentIndex
//                 ? "completed"
//                 : i === currentIndex
//                 ? "active"
//                 : "upcoming"
//             }`}
//           >
//             {point}
//           </button>
//         ))}
//       </div>

//       {loading && <p>⏳ Sending data...</p>}
//       {message && <p className="message">{message}</p>}

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
























// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// const API_BASE = "http://localhost:5000/api";

// const App = () => {
//   const [driverName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [logs, setLogs] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   const intervalRef = useRef(null);
//   const timeoutRef = useRef(null);
//   const emailSentRef = useRef(false);

//   const checkpoints = [
//     "Leave Dealer Office",
//     "Arrive at UCIC Plant",
//     "Arrive at Sales Office",
//     "Arrive at Weighbridge",
//     "Leave UCIC Plant",
//     "Arrive at Delivery Location",
//   ];

//   const clearTimers = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }
//   };

//   const sendDelayEmail = async () => {
//     if (emailSentRef.current) return;
//     emailSentRef.current = true;

//     try {
//       await axios.post(`${API_BASE}/delay-email`, { driverName });
//       console.log("Delay email sent!");
//     } catch (err) {
//       console.error("Email send failed", err);
//     }
//   };

//   const startTimer = (seconds) => {
//     clearTimers();
//     emailSentRef.current = false;
//     setTimeLeft(seconds);

//     intervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//   timeoutRef.current = setTimeout(() => {
//   if (!emailSentRef.current) {
//     setMessage("⚠️ 3 گھنٹے گزر گئے ہیں! ڈرائیور نے اگلا پوائنٹ پریس نہیں کیا۔");
//     sendDelayEmail();
//   }
//   setTimeLeft(0);
//   clearTimers();
// }, seconds * 1000);






//   };




  


//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

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
//           setCurrentIndex((prev) => prev + 1);
//           startTimer(60); // 1 minute for demo
//           fetchLogs();
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

//   const fetchLogs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/logs`);
//       setLogs(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(fetchLogs, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     return () => {
//       clearTimers();
//     };
//   }, []);

//   const progressPercent = Math.round((currentIndex / checkpoints.length) * 100);
//   const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

//   return (
//     <div className="app-container">
//       <h1>🚛 Driver Log App</h1>

//       {/* Progress Bar */}
//       <div className="progress-bar">
//         <div
//           className="progress-fill"
//           style={{ width: `${progressPercent}%` }}
//         ></div>
//       </div>
//       <p className="progress-text">Progress: {progressPercent}%</p>

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

//       {/* Buttons */}
//       <div className="button-container">
//         {checkpoints.map((point, i) => (
//           <button
//             key={i}
//             onClick={() => handleCheckpoint(point)}
//             disabled={loading || i !== currentIndex}
//             className={`btn ${
//               i < currentIndex
//                 ? "completed"
//                 : i === currentIndex
//                 ? "active"
//                 : "upcoming"
//             }`}
//           >
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

















































// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// const API_BASE = "http://localhost:5000/api";

// const App = () => {
//   const [driverName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [logs, setLogs] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showWarning, setShowWarning] = useState(false);

//   const intervalRef = useRef(null);
//   const timeoutRef = useRef(null);
//   const emailSentRef = useRef(false);

//   const checkpoints = [
//     "Leave Dealer Office",
//     "Arrive at UCIC Plant",
//     "Arrive at Sales Office",
//     "Arrive at Weighbridge",
//     "Leave UCIC Plant",
//     "Arrive at Delivery Location",
//   ];

//   const clearTimers = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }
//   };

//   const sendDelayEmail = async () => {
//     if (emailSentRef.current) return;
//     emailSentRef.current = true;

//     try {
//       await axios.post(`${API_BASE}/delay-email`, { driverName });
//       console.log("Delay email sent!");
//     } catch (err) {
//       console.error("Email send failed", err);
//     }
//   };

//   const startTimer = (seconds) => {
//     clearTimers();
//     emailSentRef.current = false;
//     setShowWarning(false);
//     setTimeLeft(seconds);

//     intervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // ⚠️ After 3 hours (for demo, after 60 seconds), warning will be shown
//     timeoutRef.current = setTimeout(() => {
//       if (!emailSentRef.current) {
//         setShowWarning(true);
//         setMessage("⚠️ 3 hours have passed! Kindly click the next point");
//         sendDelayEmail();
//       }
//       setTimeLeft(0);
//       clearTimers();
//     }, seconds * 1000);
//   };

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   const handleCheckpoint = async (pointName) => {
//     setLoading(true);
//     setMessage("");
//     setShowWarning(false);

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const gps = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };
//         try {
//           await axios.post(`${API_BASE}/checkpoint`, { driverName, pointName, gps });
//           setMessage(`✅ ${pointName} recorded successfully!`);
//           setCurrentIndex((prev) => prev + 1);
//           startTimer(60); // demo = 1 minute
//           fetchLogs();
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

//   const fetchLogs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/logs`);
//       setLogs(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(fetchLogs, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     return () => {
//       clearTimers();
//     };
//   }, []);

//   const progressPercent = Math.round((currentIndex / checkpoints.length) * 100);
//   const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

//   return (
//     <div className="app-container">
//       <h1>🚛 Driver Log App</h1>

//       {/* Progress Bar */}
//       <div className="progress-bar">
//         <div
//           className="progress-fill"
//           style={{ width: `${progressPercent}%` }}
//         ></div>
//       </div>
//       <p className="progress-text">Progress: {progressPercent}%</p>

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

//       {/* Buttons */}
//       <div className="button-container">
//         {checkpoints.map((point, i) => (
//           <button
//             key={i}
//             onClick={() => handleCheckpoint(point)}
//             disabled={loading || i !== currentIndex || showWarning}
//             className={`btn ${
//               i < currentIndex
//                 ? "completed"
//                 : i === currentIndex
//                 ? "active"
//                 : "upcoming"
//             }`}
//           >
//             {point}
//           </button>
//         ))}
//       </div>

//       {loading && <p>⏳ Sending data...</p>}

//       {/* ✅ Screen Message + OK Button */}
//       {showWarning ? (
//         <div className="warning-box">
//           <p>{message}</p>
//           <button
//             className="ok-btn"
//             onClick={() => {
//               setShowWarning(false);
//               setMessage("");
//               setCurrentIndex((prev) => prev + 1);
//             }}
//           >
//             OK
//           </button>
//         </div>
//       ) : (
//         message && <p className="message">{message}</p>
//       )}

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






































// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// const API_BASE = "http://localhost:5000/api";

// const App = () => {
//   const [driverName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [logs, setLogs] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showWarning, setShowWarning] = useState(false);

//   const intervalRef = useRef(null);
//   const timeoutRef = useRef(null);
//   const emailSentRef = useRef(false);

//   const checkpoints = [
//     "Leave Dealer Office",
//     "Arrive at UCIC Plant",
//     "Arrive at Sales Office",
//     "Arrive at Weighbridge",
//     "Leave UCIC Plant",
//     "Arrive at Delivery Location",
//   ];

//   const clearTimers = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }
//   };

//   const sendDelayEmail = async () => {
//     if (emailSentRef.current) return;
//     emailSentRef.current = true;

//     try {
//       await axios.post(`${API_BASE}/delay-email`, { driverName });
//       console.log("Delay email sent!");
//     } catch (err) {
//       console.error("Email send failed", err);
//     }
//   };

//   const startTimer = (seconds) => {
//     clearTimers();
//     emailSentRef.current = false;
//     setShowWarning(false);
//     setTimeLeft(seconds);

//     intervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     timeoutRef.current = setTimeout(() => {
//       if (!emailSentRef.current) {
//         setShowWarning(true);
//         setMessage("⚠️ 3 hours have passed! Kindly click the next point");
//         sendDelayEmail();
//       }
//       setTimeLeft(0);
//       clearTimers();
//     }, seconds * 1000);
//   };

//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   const handleCheckpoint = async (pointName) => {
//     setLoading(true);
//     setMessage("");
//     setShowWarning(false);

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const gps = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };
//         try {
//           await axios.post(`${API_BASE}/checkpoint`, {
//             driverName,
//             pointName,
//             gps,
//           });
//           setMessage(`✅ ${pointName} recorded successfully!`);
//           setCurrentIndex((prev) => prev + 1);
//           startTimer(60); // demo = 1 minute
//           fetchLogs();
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

//   const fetchLogs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/logs`);
//       setLogs(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(fetchLogs, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     return () => {
//       clearTimers();
//     };
//   }, []);

//   const progressPercent = Math.round((currentIndex / checkpoints.length) * 100);
//   const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

//   return (
//     <div className="app-container">
//       <h1>🚛 Driver Log App</h1>

//       {/* Progress Bar */}
//       <div className="progress-bar">
//         <div
//           className="progress-fill"
//           style={{ width: `${progressPercent}%` }}
//         ></div>
//       </div>
//       <p className="progress-text">Progress: {progressPercent}%</p>

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

//       {/* Buttons */}
//       <div className="button-container">
//         {checkpoints.map((point, i) => (
//           <button
//             key={i}
//             onClick={() => handleCheckpoint(point)}
//             disabled={loading || i !== currentIndex || showWarning}
//             className={`btn ${
//               i < currentIndex
//                 ? "completed"
//                 : i === currentIndex
//                 ? "active"
//                 : "upcoming"
//             }`}
//           >
//             {point}
//           </button>
//         ))}
//       </div>

//       {loading && <p>⏳ Sending data...</p>}

//       {/* ✅ Screen Message + OK Button */}
//       {showWarning ? (
//         <div className="warning-box">
//           <p>{message}</p>
//           <button
//             className="ok-btn"
//             onClick={() => {
//               setShowWarning(false);
//               setMessage("");
//               setCurrentIndex((prev) => prev + 1);
//             }}
//           >
//             OK
//           </button>
//         </div>
//       ) : (
//         message && <p className="message">{message}</p>
//       )}

//       {/* Logs Table */}
//       <div className="table-container">
//         <h2>📊 Last 1 Minute Logs</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Point</th>
//               <th>Location (Google Map)</th>
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
//                     <td>
//                       <a
//                         href={`https://www.google.com/maps?q=${cp.gps.lat},${cp.gps.lng}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{
//                           color: "blue",
//                           textDecoration: "underline",
//                           fontWeight: "bold",
//                         }}
//                       >
//                         📍 View on Google Maps
//                       </a>
//                     </td>
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



































// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "./App.css";

// const API_BASE = "./api";

// const App = () => {
//   const [driverName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [logs, setLogs] = useState([]);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showWarning, setShowWarning] = useState(false);

//   const intervalRef = useRef(null);
//   const timeoutRef = useRef(null);
//   const emailSentRef = useRef(false);

//   // ✅ Checkpoints (stages)
//   const checkpoints = [
//     "Leave Dealer Office",
//     "Arrive at UCIC Plant",
//     "Arrive at Sales Office",
//     "Arrive at Weighbridge",
//     "Leave UCIC Plant",
//     "Arrive at Delivery Location",
//   ];

//   // 🧹 Clear running timers
//   const clearTimers = () => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//       timeoutRef.current = null;
//     }
//   };

//   // 📧 Send delay email
//   const sendDelayEmail = async () => {
//     if (emailSentRef.current) return;
//     emailSentRef.current = true;
//     try {
//       await axios.post(`${API_BASE}/delay-email`, { driverName });
//       console.log("Delay email sent!");
//     } catch (err) {
//       console.error("Email send failed", err);
//     }
//   };

//   // ⏲️ Start countdown timer
//   const startTimer = (seconds) => {
//     clearTimers();
//     emailSentRef.current = false;
//     setShowWarning(false);
//     setTimeLeft(seconds);

//     intervalRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(intervalRef.current);
//           intervalRef.current = null;
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     // For demo: after (seconds) → show warning
//     timeoutRef.current = setTimeout(() => {
//       if (!emailSentRef.current) {
//         setShowWarning(true);
//         setMessage("⚠️ 3 hours have passed! Kindly click the next point");
//         sendDelayEmail();
//       }
//       setTimeLeft(0);
//       clearTimers();
//     }, seconds * 1000);
//   };

//   // 🕒 Time formatter
//   const formatTime = (seconds) => {
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = seconds % 60;
//     return `${h.toString().padStart(2, "0")}:${m
//       .toString()
//       .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
//   };

//   // 📍 Handle Checkpoint — captures *real* GPS
//   const handleCheckpoint = async (pointName) => {
//     setLoading(true);
//     setMessage("");
//     setShowWarning(false);

//     if (!navigator.geolocation) {
//       alert("❌ Geolocation not supported by your browser!");
//       setLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const gps = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };

//         try {
//           // ✅ Send exact coordinates to backend
//           await axios.post(`${API_BASE}/checkpoint`, { driverName, pointName, gps });

//           setMessage(`✅ ${pointName} recorded successfully!`);
//           setCurrentIndex((prev) => prev + 1);
//           startTimer(60); // Demo timer (1 minute)
//           fetchLogs();
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
//         alert("❌ GPS permission denied! Please allow location access for accurate tracking.");
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } // ✅ High accuracy for real location
//     );
//   };

//   // 📦 Fetch Logs from backend
//   const fetchLogs = async () => {
//     try {
//       const res = await axios.get(`${API_BASE}/logs`);
//       setLogs(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(fetchLogs, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     return () => {
//       clearTimers();
//     };
//   }, []);

//   // 📊 Progress tracking
//   const progressPercent = Math.round((currentIndex / checkpoints.length) * 100);
//   const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

//   return (
//     <div className="app-container">
//       <h1>🚛 Driver Log App</h1>

//       {/* Progress Bar */}
//       <div className="progress-bar">
//         <div
//           className="progress-fill"
//           style={{ width: `${progressPercent}%` }}
//         ></div>
//       </div>
//       <p className="progress-text">Progress: {progressPercent}%</p>

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

//       {/* Buttons */}
//       <div className="button-container">
//         {checkpoints.map((point, i) => (
//           <button
//             key={i}
//             onClick={() => handleCheckpoint(point)}
//             disabled={loading || i !== currentIndex || showWarning}
//             className={`btn ${
//               i < currentIndex
//                 ? "completed"
//                 : i === currentIndex
//                 ? "active"
//                 : "upcoming"
//             }`}
//           >
//             {point}
//           </button>
//         ))}
//       </div>

//       {loading && <p>⏳ Sending data...</p>}

//       {/* Warning Message */}
//       {showWarning ? (
//         <div className="warning-box">
//           <p>{message}</p>
//           <button
//             className="ok-btn"
//             onClick={() => {
//               setShowWarning(false);
//               setMessage("");
//               setCurrentIndex((prev) => prev + 1);
//             }}
//           >
//             OK
//           </button>
//         </div>
//       ) : (
//         message && <p className="message">{message}</p>
//       )}

//       {/* Logs Table */}
//       <div className="table-container">
//         <h2>📍 Exact Location Logs (Live)</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>Point</th>
//               <th>Location</th>
//               <th>Time</th>
//             </tr>
//           </thead>
//           <tbody>
//             {logs.length === 0 ? (
//               <tr>
//                 <td colSpan="3">No logs found yet</td>
//               </tr>
//             ) : (
//               logs.map((log, li) =>
//                 log.checkpoints.map((cp, i) => (
//                   <tr key={`${li}-${i}`}>
//                     <td>{cp.pointName}</td>
//                     <td>
//                       <a
//                         href={`https://www.google.com/maps?q=${cp.gps.lat},${cp.gps.lng}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         style={{ color: "blue", textDecoration: "underline" }}
//                       >
//                         📍 View on Google Maps
//                       </a>
//                     </td>
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














































import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

// ✅ اگر آپ Vercel پر backend چلا رہے ہیں، یہاں اپنا backend URL لگائیں
const API_BASE = "./api";

const App = () => {
  const [driverName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [logs, setLogs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const emailSentRef = useRef(false);

  // ✅ چیک پوائنٹس — ڈرائیور کے مراحل
  const checkpoints = [
    "ڈیلر آفس سے روانہ ہوں",
    "یو سی آئی سی پلانٹ پر پہنچ گئے",
    "سیلز آفس پر پہنچ گئے",
    "وی بریج پر پہنچ گئے",
    "یو سی آئی سی پلانٹ سے روانہ ہوں",
    "ڈلیوری مقام پر پہنچ گئے",
  ];

  // 🧹 ٹائمر صاف کرنے کا فنکشن
  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // 📧 تاخیر کی اطلاع والا ای میل
  const sendDelayEmail = async () => {
    if (emailSentRef.current) return;
    emailSentRef.current = true;
    try {
      await axios.post(`${API_BASE}/delay-email`, { driverName });
      console.log("ای میل کامیابی سے بھیجی گئی۔");
    } catch (err) {
      console.error("ای میل بھیجنے میں خرابی:", err);
    }
  };

  // ⏲️ ٹائمر شروع کرنا
  const startTimer = (seconds) => {
    clearTimers();
    emailSentRef.current = false;
    setShowWarning(false);
    setTimeLeft(seconds);

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      if (!emailSentRef.current) {
        setShowWarning(true);
        setMessage("⚠️ 3 گھنٹے گزر چکے ہیں! براہ کرم اگلا پوائنٹ دبائیں۔");
        sendDelayEmail();
      }
      setTimeLeft(0);
      clearTimers();
    }, seconds * 1000);
  };

  // 🕒 وقت دکھانے کا فنکشن
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 📍 چیک پوائنٹ ہینڈل — GPS کے ساتھ
  const handleCheckpoint = async (pointName) => {
    setLoading(true);
    setMessage("");
    setShowWarning(false);

    if (!navigator.geolocation) {
      alert("❌ آپ کا براؤزر GPS سپورٹ نہیں کرتا!");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const gps = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        try {
          await axios.post(`${API_BASE}/checkpoint`, {
            driverName,
            pointName,
            gps,
          });

          setMessage(`✅ ${pointName} کامیابی سے ریکارڈ ہو گیا!`);
          setCurrentIndex((prev) => prev + 1);
          startTimer(60); // ڈیما کے لیے 1 منٹ
          fetchLogs();
        } catch (err) {
          console.error(err);
          setMessage("❌ ڈیٹا بھیجنے میں خرابی!");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error(err);
        alert("❌ براہ کرم لوکیشن ایکسیس کی اجازت دیں!");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // 📦 لاگز حاصل کریں
  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/logs`);
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]); // اگر غلط ڈیٹا ہو تو خالی array رکھیں
      }
    } catch (err) {
      console.error("لاگز لوڈ کرنے میں خرابی:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => clearTimers, []);

  const progressPercent = Math.round((currentIndex / checkpoints.length) * 100);
  const progress = timeLeft > 0 ? (timeLeft / (3 * 60 * 60)) * 100 : 0;

  return (
    <div className="app-container">
      <h1>🚛 ڈرائیور لاگ ایپ</h1>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <p className="progress-text">ترقی: {progressPercent}%</p>

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

      <div className="button-container">
        {checkpoints.map((point, i) => (
          <button
            key={i}
            onClick={() => handleCheckpoint(point)}
            disabled={loading || i !== currentIndex || showWarning}
            className={`btn ${
              i < currentIndex ? "completed" : i === currentIndex ? "active" : "upcoming"
            }`}
          >
            {point}
          </button>
        ))}
      </div>

      {loading && <p>⏳ ڈیٹا بھیجا جا رہا ہے...</p>}

      {showWarning ? (
        <div className="warning-box">
          <p>{message}</p>
          <button
            className="ok-btn"
            onClick={() => {
              setShowWarning(false);
              setMessage("");
              setCurrentIndex((prev) => prev + 1);
            }}
          >
            ٹھیک ہے
          </button>
        </div>
      ) : (
        message && <p className="message">{message}</p>
      )}

      <div className="table-container">
        <h2>📍 درست GPS لاگز (لائیو)</h2>
        <table>
          <thead>
            <tr>
              <th>پوائنٹ</th>
              <th>مقام</th>
              <th>وقت</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(logs) && logs.length > 0 ? (
              logs.map((log, li) =>
                Array.isArray(log.checkpoints)
                  ? log.checkpoints.map((cp, i) => (
                      <tr key={`${li}-${i}`}>
                        <td>{cp.pointName}</td>
                        <td>
                          <a
                            href={`https://www.google.com/maps?q=${cp.gps.lat},${cp.gps.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "blue", textDecoration: "underline" }}
                          >
                            📍 گوگل میپس پر دیکھیں
                          </a>
                        </td>
                        <td>{new Date(cp.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))
                  : null
              )
            ) : (
              <tr>
                <td colSpan="3">ابھی کوئی ریکارڈ نہیں ملا</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;


