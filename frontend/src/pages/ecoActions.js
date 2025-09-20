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

const BACKEND_API_URL = process.env.BACKEND_API_URL;

const ecoActions = [
  { name: "Used public transport", coins: 20, image: "actions/publictransport.jpg" },
  { name: "Reused shopping bag", coins: 10, image: "actions/resueshoppingbag.jpg" },
  { name: "Switched off unused lights", coins: 5, image: "actions/turnofflights.jpeg" },
  { name: "Home composting", coins: 25, image: "actions/composting.jpeg" },
  { name: "Walked/cycled", coins: 15, image: "actions/walkingcycling.jpg" },
  { name: "Saved water while brushing", coins: 10, image: "actions/brushing.jpeg" },
  { name: "Carpooled", coins: 15, image: "actions/carpooling.jpg" },
  { name: "Used reusable bottle", coins: 10, image: "actions/bottle.jpg" },
  { name: "Donated old clothes", coins: 20, image: "actions/clothes.jpeg" },
  { name: "Planted a tree", coins: 30, image: "actions/plantatree.jpg" },
  { name: "Used plastic cutlery", coins: -10, image: "actions/plastic.jpeg" },
  { name: "Left tap running", coins: -15, image: "actions/tap.jpg" },
  { name: "Solo car ride", coins: -20, image: "actions/solocarride.jpg" },
  { name: "Used single-use coffee cup", coins: -10, image: "actions/singleusecofeecup.png" },
  { name: "Excessive fast fashion", coins: -25, image: "actions/fastfashion.jpeg" },
  { name: "Threw food waste", coins: -15, image: "actions/foodwaste.jpg" },
  { name: "Left electronics charging", coins: -10, image: "actions/charginf.jpg" },
  { name: "Excessive AC/heater", coins: -20, image: "actions/acheater.jpg" },
  { name: "Bought bottled water", coins: -10, image: "actions/plasticwaterbottle.jpg" },
  { name: "Littered in public", coins: -30, image: "actions/litterinpublic.jpg" },
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
    <div className="modern-eco-dashboard">
      <div className="container-fluid px-4 py-4">
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-white mb-2">
            🌱 Eco Actions Dashboard
          </h1>
          <p className="lead text-white-50">
            Track your environmental impact and earn eco coins!
          </p>
        </div>

        {/* Row 1: Stats Cards - Made Smaller */}
        <div className="row g-3 mb-4">
          {/* Eco Coins */}
          <motion.div
            className="col-md-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-card eco-coins-card">
              <div className="stat-header">
                <div className="stat-icon">🪙</div>
                <div>
                  <h6 className="stat-title">Daily Eco Coins</h6>
                  <p className="stat-subtitle">Today's impact</p>
                </div>
              </div>
              <AnimatePresence>
                <motion.div
                  key={balance}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="stat-value">{balance}</div>
                </motion.div>
              </AnimatePresence>
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill eco-progress"
                    style={{
                      width: `${Math.min((balance / maxCoins) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="progress-text">Max: {maxCoins} coins</p>
              </div>
            </div>
          </motion.div>

          {/* Streak */}
          <motion.div
            className="col-md-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-card streak-card">
              <div className="stat-header">
                <div className="stat-icon">🔥</div>
                <div>
                  <h6 className="stat-title">Streak Days</h6>
                  <p className="stat-subtitle">Consecutive days</p>
                </div>
              </div>
              <motion.div
                key={streak}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="stat-value">{streak}</div>
              </motion.div>
              <div className="streak-badge">
                <span
                  className={`badge ${getStreakBadge(streak).bg}`}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: "0.7rem",
                  }}
                >
                  {getStreakBadge(streak).text}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Total Coins */}
          <motion.div
            className="col-md-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="stat-card total-coins-card">
              <div className="stat-header">
                <div className="stat-icon">👑</div>
                <div>
                  <h6 className="stat-title">Total Coins</h6>
                  <p className="stat-subtitle">All-time score</p>
                </div>
              </div>
              <AnimatePresence>
                <motion.div
                  key={totalCoins}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="stat-value">{totalCoins}</div>
                </motion.div>
              </AnimatePresence>
              <div className="level-info">
                <div className="level-badge">
                  <span className={`level-text ${color.replace("text-", "")}`}>
                    {level}
                  </span>
                </div>
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className="progress-fill level-progress"
                      style={{
                        width: `${Math.min(
                          (totalCoins / nextLevel) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="progress-text">Next: {nextLevel} coins</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Row 2: Actions */}
        <div className="row g-4 mb-5">
          {/* Eco Boosters */}
          <div className="col-lg-6">
            <div className="actions-section positive-section">
              <div className="actions-header">
                <div className="actions-icon positive-icon">🌟</div>
                <div>
                  <h3 className="actions-title">Eco Boosters</h3>
                  <p className="actions-subtitle">
                    Positive environmental actions
                  </p>
                </div>
              </div>
              <div className="actions-grid">
                {positiveActions.map((action, index) => {
                  const isSelected = selectedActions.includes(action.name);
                  return (
                    <div
                      key={action.name}
                      className={`action-card positive-action ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleActionClick(action)}
                      style={{
                        backgroundImage: `url(${action.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        brightness: '50%'
                      }}
                    >
                      <div className="action-content">
                        <h5 className="action-name">{action.name}</h5>
                        <div className="action-coins positive-coins">
                          +{action.coins}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Eco Bloopers */}
          <div className="col-lg-6">
            <div className="actions-section negative-section">
              <div className="actions-header">
                <div className="actions-icon negative-icon">⚠️</div>
                <div>
                  <h3 className="actions-title">Eco Bloopers</h3>
                  <p className="actions-subtitle">
                    Actions that harm the environment
                  </p>
                </div>
              </div>
              <div className="actions-grid">
                {negativeActions.map((action, index) => {
                  const isSelected = selectedActions.includes(action.name);
                  return (
                    <div
                      key={action.name}
                      className={`action-card negative-action ${
                        isSelected ? "selected" : ""
                      }`}
                      onClick={() => handleActionClick(action)}
                      style={{
                        backgroundImage: `url(${action.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div className="action-content">
                        <h5 className="action-name">{action.name}</h5>
                        <div className="action-coins negative-coins">
                          {action.coins}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Weekly Progress Chart */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-icon">📊</div>
                <div>
                  <h3 className="chart-title">Weekly Progress</h3>
                  <p className="chart-subtitle">
                    Your eco performance over the last 7 days
                  </p>
                </div>
              </div>
              <div className="chart-content">
                {weeklyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12, fill: "#666" }}
                        axisLine={{ stroke: "#e0e0e0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#666" }}
                        axisLine={{ stroke: "#e0e0e0" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="balance"
                        stroke="#06d6a0"
                        strokeWidth={4}
                        dot={{ fill: "#06d6a0", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: "#06d6a0", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">📈</div>
                    <p className="no-data-text">
                      No eco actions logged this week.
                    </p>
                    <p className="no-data-subtext">
                      Start logging actions to see your progress!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Action History Table */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="history-card">
              <div className="history-header">
                <div className="history-icon">📋</div>
                <div>
                  <h3 className="history-title">Action History</h3>
                  <p className="history-subtitle">Your complete eco journey</p>
                </div>
              </div>
              <div className="history-toggle">
                <button
                  className={`toggle-btn ${showTable ? "active" : ""}`}
                  onClick={() => setShowTable(!showTable)}
                >
                  {showTable ? "Hide History" : "View Full History"}
                </button>
              </div>

              <AnimatePresence>
                {showTable && (
                  <motion.div
                    className="history-content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {history.length > 0 ? (
                      <div className="history-table-container">
                        <table className="history-table">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Coins</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {history.map((row, index) => (
                              <motion.tr
                                key={row._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                              >
                                <td>
                                  {new Date(row.date).toLocaleDateString()}
                                </td>
                                <td className="coins-cell">
                                  <span
                                    className={`coins-badge ${
                                      row.balance >= 0 ? "positive" : "negative"
                                    }`}
                                  >
                                    {row.balance >= 0 ? "+" : ""}
                                    {row.balance}
                                  </span>
                                </td>
                                <td className="actions-cell">
                                  <div className="actions-list-cell">
                                    {row.actionsTaken.map((action, i) => (
                                      <span key={i} className="action-tag">
                                        {action}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="no-data">
                        <div className="no-data-icon">📝</div>
                        <p className="no-data-text">
                          No past eco actions recorded.
                        </p>
                        <p className="no-data-subtext">
                          Start your eco journey today!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Row 5: Leaderboard */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="leaderboard-card">
              <div className="leaderboard-header">
                <div className="leaderboard-icon">🏆</div>
                <div>
                  <h3 className="leaderboard-title">Today's Eco Champions</h3>
                  <p className="leaderboard-subtitle">
                    Top eco-friendly users of the day
                  </p>
                </div>
              </div>

              <div className="leaderboard-content">
                {leaderboard.length > 0 ? (
                  <div className="leaderboard-list">
                      {leaderboard.map((user, index) => (
                        <div
                          key={user.userId}
                          className={`leaderboard-item ${
                            index === 0 ? "champion" : ""
                          } ${index === 1 ? "runner-up" : ""} ${
                            index === 2 ? "third-place" : ""
                          }`}
                        >
                          <div className="rank-info">
                            <div className="rank-number">
                              {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : index === 2
                                ? "🥉"
                                : `#${index + 1}`}
                            </div>
                            <div className="user-info">
                              <span className="username">{user.username}</span>
                              {index === 0 && (
                                <span className="champion-badge">
                                  👑 Champion
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="user-score">
                            <span className="score-value">{user.balance}</span>
                            <span className="score-label">coins</span>
                          </div>
                        </div>
                      ))}

                      {userRank && userRank.position > 5 && (
                        <div
                          key={userRank.userId}
                          className="leaderboard-item user-rank"
                        >
                          <div className="rank-info">
                            <div className="rank-number">
                              #{userRank.position}
                            </div>
                            <div className="user-info">
                              <span className="username">
                                {userRank.username}
                              </span>
                              <span className="you-badge">You</span>
                            </div>
                          </div>
                          <div className="user-score">
                            <span className="score-value">
                              {userRank.balance}
                            </span>
                            <span className="score-label">coins</span>
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon">🏆</div>
                    <p className="no-data-text">
                      No leaderboard data available
                    </p>
                    <p className="no-data-subtext">
                      Be the first to start logging eco actions!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Confetti for top 1 */}
        {/* {leaderboard[0]?.userId === localStorage.getItem("userId") && (
          <Confetti numberOfPieces={200} gravity={0.3} />
        )} */}
      </div>

      {/* Modern Styling */}
      <style jsx>{`
        .modern-eco-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow-x: hidden;
        }

        .modern-eco-dashboard::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(120, 119, 198, 0.3) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(255, 119, 198, 0.3) 0%,
              transparent 50%
            );
          pointer-events: none;
        }

        .container-fluid {
          position: relative;
          z-index: 1;
        }

        /* Stat Cards */
        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          height: 260px;
        }

        .stat-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
          border-radius: 20px 20px 0 0;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }

        .stat-title {
          font-size: 1rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
        }

        .stat-subtitle {
          font-size: 0.8rem;
          color: #718096;
          margin: 0;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 900;
          color: #2d3748;
          text-align: center;
          margin: 0.5rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .progress-container {
          margin-top: 1rem;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        .eco-progress {
          background: linear-gradient(90deg, #06d6a0, #54d1db);
        }

        .level-progress {
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .progress-text {
          font-size: 0.75rem;
          color: #718096;
          text-align: center;
          margin: 0;
        }

        .streak-badge,
        .level-info {
          text-align: center;
          margin-top: 0.5rem;
        }

        .level-badge {
          margin-bottom: 0.5rem;
        }

        .level-text {
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          background: rgba(102, 126, 234, 0.1);
        }

        /* Actions Section */
        .actions-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          height: 100%;
        }

        .actions-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid rgba(0, 0, 0, 0.1);
        }

        .actions-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        .positive-icon {
          background: linear-gradient(135deg, #06d6a0, #54d1db);
        }

        .negative-icon {
          background: linear-gradient(135deg, #f56565, #fc8181);
        }

        .actions-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
        }

        .positive-section .actions-title {
          color: #06d6a0;
        }

        .negative-section .actions-title {
          color: #f56565;
        }

        .actions-subtitle {
          color: #718096;
          margin: 0;
          font-size: 0.9rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-card {
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .action-card:hover {
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .positive-action.selected {
          border-color: #06d6a0;
          box-shadow: 0 8px 16px rgba(6, 214, 160, 0.3);
        }

        .negative-action.selected {
          border-color: #f56565;
          box-shadow: 0 8px 16px rgba(245, 101, 101, 0.3);
        }

        .action-name {
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          padding: 0.25rem 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .action-coins {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .positive-coins {
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          color: #06d6a0;
        }

        .negative-coins {
          background-color: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          color: #f56565;
        }

        .selected-indicator {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          color: #06d6a0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
        }

        /* Chart and History Cards */
        .chart-card,
        .history-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chart-header,
        .history-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .chart-icon,
        .history-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
        }

        .chart-title,
        .history-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
        }

        .chart-subtitle,
        .history-subtitle {
          font-size: 0.9rem;
          color: #718096;
          margin: 0;
        }

        .history-toggle {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .toggle-btn {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .history-table-container {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
        }

        .history-table th {
          background: #f7fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #2d3748;
          border-bottom: 2px solid #e2e8f0;
        }

        .history-table td {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .coins-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .coins-badge.positive {
          background: #c6f6d5;
          color: #22543d;
        }

        .coins-badge.negative {
          background: #fed7d7;
          color: #742a2a;
        }

        .action-tag {
          display: inline-block;
          background: #edf2f7;
          color: #4a5568;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          margin: 0.125rem;
        }

        .action-more {
          color: #718096;
          font-style: italic;
          font-size: 0.75rem;
        }

        /* Leaderboard */
        .leaderboard-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .leaderboard-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          text-align: center;
          justify-content: center;
        }

        .leaderboard-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          border-radius: 16px;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          box-shadow: 0 8px 16px rgba(255, 215, 0, 0.3);
        }

        .leaderboard-title {
          font-size: 1.6rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0 0 0.25rem 0;
        }

        .leaderboard-subtitle {
          font-size: 0.9rem;
          color: #718096;
          margin: 0;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .leaderboard-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.2rem 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .leaderboard-item:hover {
          transform: translateX(5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .leaderboard-item.champion {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          border-color: #ffd700;
          box-shadow: 0 12px 30px rgba(255, 215, 0, 0.3);
        }

        .leaderboard-item.runner-up {
          background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
          border-color: #a0aec0;
        }

        .leaderboard-item.third-place {
          background: linear-gradient(135deg, #fed7aa, #fdba74);
          border-color: #f97316;
        }

        .leaderboard-item.user-rank {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: #667eea;
        }

        .rank-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rank-number {
          font-size: 1.5rem;
          font-weight: 700;
          min-width: 50px;
          text-align: center;
        }

        .username {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .champion-badge,
        .you-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .user-score {
          text-align: right;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: 700;
          display: block;
        }

        .score-label {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        /* No Data States */
        .no-data {
          text-align: center;
          padding: 3rem 1rem;
        }

        .no-data-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-data-text {
          font-size: 1.2rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .no-data-subtext {
          color: #718096;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .actions-grid {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .container-fluid {
            padding: 0 1rem;
          }

          .stat-card,
          .actions-section,
          .chart-card,
          .history-card,
          .leaderboard-card {
            padding: 1.5rem;
            border-radius: 16px;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .stat-value {
            font-size: 2rem;
          }

          .leaderboard-header {
            flex-direction: column;
            text-align: center;
          }

          .rank-info {
            gap: 0.75rem;
          }

          .username {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .modern-eco-dashboard {
            padding: 1rem 0;
          }

          .stat-card {
            height: auto;
            padding: 1rem;
          }

          .stat-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .action-card {
            padding: 1rem;
          }

          .leaderboard-item {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default EcoActions;
