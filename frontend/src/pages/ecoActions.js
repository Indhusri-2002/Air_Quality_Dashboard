import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { getToken } from "@/utils/auth";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { FaWallet, FaFire, FaTrophy } from "react-icons/fa";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

const ecoActions = [
  { name: "Used public transport", coins: 20 },
  { name: "Reused shopping bag", coins: 10 },
  { name: "Switched off unused lights", coins: 5 },
  { name: "Home composting", coins: 25 },
  { name: "Walked/cycled", coins: 15 },
  { name: "Saved water while brushing", coins: 10 },
  { name: "Carpooled", coins: 15 },
  { name: "Used reusable bottle", coins: 10 },
  { name: "Donated old clothes", coins: 20 },
  { name: "Planted a tree", coins: 30 },
  { name: "Used plastic cutlery", coins: -10 },
  { name: "Left tap running", coins: -15 },
  { name: "Solo car ride", coins: -20 },
  { name: "Used single-use coffee cup", coins: -10 },
  { name: "Excessive fast fashion", coins: -25 },
  { name: "Threw food waste", coins: -15 },
  { name: "Left electronics charging", coins: -10 },
  { name: "Excessive AC/heater", coins: -20 },
  { name: "Bought bottled water", coins: -10 },
  { name: "Littered in public", coins: -30 },
];

const getLevelInfo = (totalCoins) => {
  if (totalCoins >= 1000)
    return { level: "🌟 Eco Master", color: "text-warning", next: 1200 };
  if (totalCoins >= 500)
    return { level: "💎 Eco Hero", color: "text-success", next: 1000 };
  if (totalCoins >= 200)
    return { level: "🌿 Eco Warrior", color: "text-primary", next: 500 };
  return { level: "🍀 Beginner", color: "text-secondary", next: 200 };
};

const getStreakBadge = (streak) => {
  if (streak >= 7)
    return { text: "🔥 Eco Streak Champion!", bg: "bg-gradient text-dark" };
  if (streak >= 3)
    return { text: "💪 Eco Streak Hero", bg: "bg-success text-white" };
  if (streak >= 1)
    return { text: "🌱 Eco Streak Starter", bg: "bg-primary text-white" };
  return { text: "😴 No Streak Yet", bg: "bg-secondary text-white" };
};

const EcoActions = () => {
  const [selectedActions, setSelectedActions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [weeklyData, setWeeklyData] = useState([]);
  const [history, setHistory] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [totalCoins, setTotalCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [prevLevel, setPrevLevel] = useState("");
  const [prevStreak, setPrevStreak] = useState(0);
  const [prevCoins, setPrevCoins] = useState(0);

    const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  const positiveActions = ecoActions.filter((a) => a.coins > 0);
  const negativeActions = ecoActions.filter((a) => a.coins < 0);
  const maxCoins = 100 + positiveActions.reduce((acc, a) => acc + a.coins, 0);

  useEffect(() => {
    fetchCoins();
    fetchWeekly();
    fetchHistory();
    fetchLeaderboard();
  }, []);

  const fetchCoins = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${BACKEND_API_URL}/eco/coins`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
      setSelectedActions(response.data.actionsTaken || []);
    } catch {
      Swal.fire("Error", "Failed to fetch coins", "error");
    }
  };

  const fetchWeekly = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BACKEND_API_URL}/eco/weekly`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeklyData(res.data);
    } catch {
      Swal.fire("Error", "Failed to fetch weekly data", "error");
    }
  };

  const fetchHistory = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BACKEND_API_URL}/eco/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const meaningfulHistory = res.data.filter(
        (r) => r.actionsTaken.length > 0 && r.createdAt !== r.updatedAt
      );

      const total = meaningfulHistory.reduce(
        (acc, row) => acc + row.balance,
        0
      );
      setTotalCoins(total);

      let streakCount = 0;
      let prevDate = null;
      meaningfulHistory
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((row) => {
          const rowDate = new Date(row.date);
          if (!prevDate) {
            streakCount = 1;
          } else {
            const diff = (prevDate - rowDate) / (1000 * 3600 * 24);
            if (diff === 1) streakCount += 1;
          }
          prevDate = rowDate;
        });
      setStreak(streakCount);

      // Streak milestone alert
      if ([1, 3, 7].includes(streakCount) && streakCount > prevStreak) {
        Swal.fire(
          "Streak Update!",
          `Your streak badge: ${getStreakBadge(streakCount).text}`,
          "info"
        );
        setPrevStreak(streakCount);
      }
      setHistory(meaningfulHistory);
    } catch {
      Swal.fire("Error", "Failed to fetch history", "error");
    }
  };


    const fetchLeaderboard = async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${BACKEND_API_URL}/eco/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(res.data.top5 || []);
      setUserRank(res.data.userRank || null);
    } catch {
      Swal.fire("Error", "Failed to fetch leaderboard", "error");
    }
  };


  const handleActionClick = async (action) => {
    try {
      const token = getToken();
      const updated = await axios.post(
        `${BACKEND_API_URL}/eco/action`,
        { name: action.name, coins: action.coins },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newBalance = updated.data.balance;

      setBalance(updated.data.balance);
      setSelectedActions(updated.data.actionsTaken);

      if (newBalance >= maxCoins && prevCoins < maxCoins) {
        Swal.fire(
          "Max Coins!",
          "You have reached the maximum eco coins possible!",
          "success"
        );
        setPrevCoins(newBalance);
      }

      fetchWeekly();
      fetchHistory();
    } catch {
      Swal.fire("Error", "Failed to update action", "error");
    }
  };

  // Level info
  const { level, color, next: nextLevel } = getLevelInfo(totalCoins);

  // useEffect to handle level-up alert
  useEffect(() => {
    const { level } = getLevelInfo(totalCoins);

    if (prevLevel && prevLevel !== level) {
      Swal.fire(
        "Level Up!",
        `Congratulations! You reached ${level}`,
        "success"
      );
    }

    setPrevLevel(level);
    fetchLeaderboard();
  }, [totalCoins]);

  return (
    <div className="container py-4">
      {/* Row 1: Eco Coins | Streak | Total Coins */}
      <div className="row g-3 mb-4">
        {/* Eco Coins */}
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="p-4 rounded shadow text-white"
            style={{ background: "linear-gradient(135deg, #28a745, #20c997)" }}
          >
            <h6 className="fw-bold">Eco Coins</h6>
            <AnimatePresence>
              <motion.p
                key={balance}
                className="display-4 fw-bold"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {balance}
              </motion.p>
            </AnimatePresence>
            <div
              className="progress mt-2"
              style={{ height: "10px", backgroundColor: "#e0e0e0" }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${(balance / maxCoins) * 100}%`,
                  background: "#ffc107",
                }}
              />
            </div>
            <p className="small mt-1">Max possible coins: {maxCoins}</p>
          </div>
        </motion.div>

        {/* Streak */}
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className={`p-4 rounded shadow text-center ${
              getStreakBadge(streak).bg
            }`}
          >
            <FaFire size={48} />
            <motion.p className="display-4 fw-bold mb-1">{streak}</motion.p>
            <p className="fw-semibold">{getStreakBadge(streak).text}</p>
          </div>
        </motion.div>

        {/* Total Coins */}
        <motion.div
          className="col-md-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div
            className="p-4 rounded shadow text-white"
            style={{ background: "linear-gradient(135deg, #6f42c1, #6610f2)" }}
          >
            <div className="d-flex align-items-center justify-content-center mb-2">
              <FaWallet size={36} className="me-2" />
              <AnimatePresence>
                <motion.p
                  key={totalCoins}
                  className="display-4 fw-bold mb-0"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {totalCoins}
                </motion.p>
              </AnimatePresence>
            </div>
            <p className={`fw-semibold text-center ${color}`}>{level}</p>
            <div
              className="progress mt-2"
              style={{ height: "10px", backgroundColor: "#e0e0e0" }}
            >
              <div
                className="progress-bar"
                role="progressbar"
                style={{
                  width: `${Math.min((totalCoins / nextLevel) * 100, 100)}%`,
                  background: "#ffc107",
                }}
              />
            </div>
            <p className="small mt-1 text-center">
              Next Level: {nextLevel} coins
            </p>
          </div>
        </motion.div>
      </div>

      {/* Row 2: Actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <h6 className="fw-semibold mb-2 text-success">Eco Boosters</h6>
          <div className="row g-3">
            {positiveActions.map((action) => {
              const isSelected = selectedActions.includes(action.name);
              return (
                <motion.div
                  key={action.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="col-6"
                >
                  <div
                    className={`p-3 rounded shadow text-center ${
                      isSelected ? "bg-success text-white" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleActionClick(action)}
                  >
                    <p className="fw-semibold mb-1">{action.name}</p>
                    <p className="mb-0">+{action.coins}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="col-md-6">
          <h6 className="fw-semibold mb-2 text-danger">Eco Bloopers</h6>
          <div className="row g-3">
            {negativeActions.map((action) => {
              const isSelected = selectedActions.includes(action.name);
              return (
                <motion.div
                  key={action.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="col-6"
                >
                  <div
                    className={`p-3 rounded shadow text-center ${
                      isSelected ? "bg-danger text-white" : "bg-light"
                    }`}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleActionClick(action)}
                  >
                    <p className="fw-semibold mb-1">{action.name}</p>
                    <p className="mb-0">{action.coins}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Graph + Table */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="bg-white p-3 rounded shadow mb-4">
            <h5 className="fw-semibold mb-3">Your Last 7 Days</h5>
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#28a745"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted text-center">
                No eco actions logged this week.
              </p>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="bg-white p-3 rounded shadow mb-4 table-responsive">
            <div className="text-center mb-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowTable(!showTable)}
              >
                {showTable ? "Hide History" : "View Full History"}
              </button>
            </div>

            {showTable && (
              <>
                <h6 className="fw-semibold mb-2">Full History</h6>
                {history.length > 0 ? (
                  <table className="table table-bordered text-center mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Balance</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row._id}>
                          <td>{row.date}</td>
                          <td>{row.balance}</td>
                          <td>{row.actionsTaken.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted">No past eco actions recorded.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="row g-3 mt-5">
        <div className="col-md-12">
          <div className="bg-white p-4 rounded shadow">
            <h5 className="fw-semibold mb-3 text-center text-warning">
              <FaTrophy className="me-2" /> Today's Eco Leaderboard
            </h5>
            {leaderboard.length > 0 ? (
              <div className="list-group">
                <AnimatePresence>
                  {leaderboard.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className={`list-group-item d-flex justify-content-between align-items-center ${
                        index === 0 ? "bg-warning text-dark fw-bold" : ""
                      }`}
                    >
                      <span>
                        #{index + 1} {user.username}
                      </span>
                      <span className="badge bg-success rounded-pill">
                        {user.balance}
                      </span>
                    </motion.div>
                  ))}
                  {userRank && userRank.position > 5 && (
                    <motion.div
                      key={userRank.userId}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="list-group-item d-flex justify-content-between align-items-center bg-light"
                    >
                      <span>
                        #{userRank.position} {userRank.username} (You)
                      </span>
                      <span className="badge bg-success rounded-pill">
                        {userRank.balance}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-center text-muted">No leaderboard data today.</p>
            )}
          </div>
        </div>
      </div>

      {/* Confetti for top 1 */}
      {/* {leaderboard[0]?.userId === localStorage.getItem("userId") && (
        <Confetti numberOfPieces={200} gravity={0.3} />
      )} */}
    </div>
  );
};

export default EcoActions;
