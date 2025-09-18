import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DailySummaryCard from "@/components/DailySummaryCard";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import NoDataFound from "@/components/NoDataFound";
import moment from "moment-timezone";

const BACKEND_API_URL = process.env.BACKEND_API_URL;
// Fetch cities and weather conditions from environment variables
const cities = Object.keys(JSON.parse(process.env.CITY_COORDS));

const WeatherHistory = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [city, setCity] = useState("Hyderabad");
  const [history, setHistory] = useState([]);
  const [dayHistory, setDayHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);
  const [days, setDays] = useState(2);
  const [dailySummary, setDailySummary] = useState(null);
  const [loadHistory, setLoadHistory] = useState(true);
  const [loadDayHistory, setLoadDayHistory] = useState(true);

  // Fetch weather history
  const fetchWeatherHistory = async () => {
    setLoadHistory(true);
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/weather/latest-history`,
        {
          params: { city, days },
        }
      );
      // Sort response data by date before setting it to state
      const sortedData = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setHistory(sortedData);
    } catch (error) {
      Swal.fire("Error", "Could not fetch weather history", "error");
    } finally {
      setLoadHistory(false);
    }
  };

  // Fetch weather history
  const fetchWeatherHistoryByDate = async () => {
    setLoadDayHistory(true);
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/weather/history-date`,
        {
          params: { city, date: selectedDate },
        }
      );
      setDayHistory(response.data);
    } catch (error) {
      console.log("Could not fetch weather history", error);
      setDayHistory("");
    } finally {
      setLoadDayHistory(false);
    }
  };

  // Fetch daily weather summary
  const fetchDailySummary = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/weather/daily-summary`,
        { params: { city } }
      );
      setDailySummary(response.data);
    } catch (error) {
      Swal.fire("Error", "Could not fetch daily weather summary", "error");
    }
  };

  useEffect(() => {
    fetchWeatherHistory();
    fetchDailySummary();
  }, [city, days]);

  useEffect(() => {
    fetchWeatherHistoryByDate();
  }, [selectedDate, city]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Prepare data for graph
  const prepareGraphData = () => {
    if (!dayHistory || !Array.isArray(dayHistory)) return [];
    return dayHistory
      .slice()
      .sort(
        (a, b) =>
          new Date(a.updatedAt || a.createdAt) -
          new Date(b.updatedAt || b.createdAt)
      )
      .map((day) => {
        const timestring = moment(day.updatedAt || day.createdAt)
          .tz("Asia/Kolkata")
          .format("HH:mm");
        return {
          date: timestring,
          fullDate: moment(day.updatedAt || day.createdAt)
            .tz("Asia/Kolkata")
            .format("DD/MM/YYYY HH:mm"),
          maxTemp: parseFloat((day.maxTemp || 0).toFixed(2)),
          avgTemp: parseFloat((day.avgTemp || day.temperature || 0).toFixed(2)),
          minTemp: parseFloat((day.minTemp || 0).toFixed(2)),
          avgHumidity: parseFloat(
            (day.avgHumidity || day.humidity || 0).toFixed(2)
          ),
          avgWindSpeed: parseFloat(
            (day.avgWindSpeed || day.windSpeed || 0).toFixed(2)
          ),
          avgAqi: parseFloat((day.avgAqi || day.aqi || 0).toFixed(2)),
        };
      });
  };

  // Get AQI level and color
  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { level: "Good", color: "#00e400" };
    if (aqi <= 100) return { level: "Fair", color: "#ffff00" };
    if (aqi <= 150) return { level: "Moderate", color: "#ff7e00" };
    if (aqi <= 200) return { level: "Poor", color: "#ff0000" };
    if (aqi <= 300) return { level: "Very Poor", color: "#8f3f97" };
    return { level: "Severe", color: "#7e0023" };
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <>
          <div className="custom-tooltip">
            <p className="tooltip-label">{`Time: ${data.fullDate}`}</p>
            {payload.map((entry, index) => (
              <p
                key={index}
                className="tooltip-entry"
                style={{ color: entry.color }}
              >
                {`${entry.name}: ${entry.value}${
                  entry.dataKey.includes("Temp")
                    ? "°C"
                    : entry.dataKey.includes("Humidity")
                    ? "%"
                    : entry.dataKey.includes("Wind")
                    ? " km/h"
                    : entry.dataKey.includes("Aqi")
                    ? " AQI"
                    : ""
                }`}
              </p>
            ))}
          </div>
          <style jsx>{`
            .custom-tooltip {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(0, 0, 0, 0.1);
              border-radius: 12px;
              padding: 12px 16px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
              font-size: 0.875rem;
            }

            .tooltip-label {
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 8px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 4px;
            }

            .tooltip-entry {
              margin: 4px 0;
              font-weight: 500;
            }
          `}</style>
        </>
      );
    }
    return null;
  };

  return (
    <div className="main-container d-flex flex-column align-items-center gap-3">
      <div
        className="d-flex flex-row justify-content-between align-items-center w-100 shadow"
        style={{
          background:
            "linear-gradient(135deg,rgb(249, 252, 255) 0%,rgb(235, 245, 253) 100%)",
          marginBottom: "1rem",
          padding: "1.2rem 2rem",
          borderRadius: "12px",
        }}
      >
        <div className="d-flex flex-row align-items-center">
          <Image
            src={`/Time.gif`}
            alt="history"
            width={35}
            height={35}
            className="me-2"
          />
          <div style={{ fontWeight: "400", fontSize: 28 }}>Weather History</div>
        </div>
        <div>
          <select
            className="form-select shadow border-0"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daily Summary */}
      {dailySummary && (
        <DailySummaryCard city={city} dailySummary={dailySummary} />
      )}

      <div
        className="d-flex flex-column align-items-center shadow rounded border-0 p-5 w-100 mb-3"
        style={{
          background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
        }}
      >
        <div className="d-flex flex-row justify-content-between align-items-center w-100">
          <div style={{ fontWeight: 400, fontSize: 24 }}>Trends for {city}</div>
          <div className="d-flex flex-row justify-content-center align-items-center gap-2">
            <div
              htmlFor="date-picker"
              className=""
              style={{ fontWeight: 400, fontSize: 18 }}
            >
              Select Date:
            </div>
            <div>
              <input
                type="date"
                id="date-picker"
                className="form-control shadow border-0"
                value={selectedDate}
                onChange={handleDateChange}
                // Ensure that the date input is in the YYYY-MM-DD format
                pattern="\d{4}-\d{2}-\d{2}"
                max={today}
              />
            </div>
          </div>
        </div>

        {loadDayHistory ? (
          <div className="loading-container">
            <LoadingScreen />
          </div>
        ) : dayHistory.length > 0 ? (
          <div className="charts-container">
            <div className="charts-grid">
              {/* Temperature Chart */}
              <div className="chart-card temperature-chart">
                <div className="chart-header">
                  <div className="chart-icon">🌡️</div>
                  <h5>Temperature Trends</h5>
                  <p>Max, Average & Minimum Temperature (°C)</p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={prepareGraphData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="tempGradientMax"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ff6b6b"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ff6b6b"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="tempGradientAvg"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4ecdc4"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4ecdc4"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient
                        id="tempGradientMin"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#45b7d1"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#45b7d1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="maxTemp"
                      stroke="#ff6b6b"
                      fillOpacity={1}
                      fill="url(#tempGradientMax)"
                      name="Max Temp"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="avgTemp"
                      stroke="#4ecdc4"
                      fillOpacity={1}
                      fill="url(#tempGradientAvg)"
                      name="Avg Temp"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="minTemp"
                      stroke="#45b7d1"
                      fillOpacity={1}
                      fill="url(#tempGradientMin)"
                      name="Min Temp"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* AQI Chart */}
              <div className="chart-card aqi-chart">
                <div className="chart-header">
                  <div className="chart-icon">🌫️</div>
                  <h5>Air Quality Index</h5>
                  <p>AQI levels throughout the day</p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={prepareGraphData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="aqiGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="avgAqi"
                      stroke="#8b5cf6"
                      fillOpacity={1}
                      fill="url(#aqiGradient)"
                      name="AQI"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Humidity Chart */}
              <div className="chart-card humidity-chart">
                <div className="chart-header">
                  <div className="chart-icon">💧</div>
                  <h5>Humidity Levels</h5>
                  <p>Relative humidity percentage (%)</p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={prepareGraphData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="humidityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#06d6a0"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#06d6a0"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="avgHumidity"
                      stroke="#06d6a0"
                      fillOpacity={1}
                      fill="url(#humidityGradient)"
                      name="Humidity"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Wind Speed Chart */}
              <div className="chart-card wind-chart">
                <div className="chart-header">
                  <div className="chart-icon">💨</div>
                  <h5>Wind Speed</h5>
                  <p>Wind speed in km/h</p>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={prepareGraphData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="windGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f093fb"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f5576c"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#666" }}
                      axisLine={{ stroke: "#e0e0e0" }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="avgWindSpeed"
                      stroke="url(#windGradient)"
                      strokeWidth={3}
                      dot={{ fill: "#f5576c", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#f5576c", strokeWidth: 2 }}
                      name="Wind Speed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data-container">
            <NoDataFound
              message={`No weather history available for ${selectedDate}`}
            />
          </div>
        )}
      </div>

      <div className="shadow rounded border-0 p-3 w-100 ">
        {/* Days Selection */}
        <div className="d-flex flex-row justify-content-between align-items-center w-100">
          <div style={{ fontWeight: 400, fontSize: 24 }}>
            Weather History for {city} (Past {days} Days)
          </div>
          <div className="d-flex flex-row justify-content-center align-items-center gap-2">
            <div
              htmlFor="days"
              className=""
              style={{ fontWeight: 400, fontSize: 18 }}
            >
              Select Days:
            </div>
            <div>
              <select
                className="form-select shadow border-0"
                id="days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              >
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days</option>
              </select>
            </div>
          </div>
        </div>

        {history.length > 0 ? (
          <div
            className="card border-0 shadow mt-4 w-100 p-5"
            style={{
              background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
            }}
          >
            {loadHistory ? (
              <LoadingScreen />
            ) : (
              <div
                className="d-flex flex-row gap-3 w-100 rounded shadow p-1"
                style={{ overflowX: "scroll" }}
              >
                {history.map((day, index) => (
                  <div key={index}>
                    <DailySummaryCard city={city} dailySummary={day} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-100 mt-4">
            <NoDataFound message={`No weather history available`} />
          </div>
        )}
      </div>

      <style jsx>{`
        .main-container {
          margin: 0 auto;
          width: 100%;
          max-width: 1400px;
          min-height: 100vh;
          padding: 2rem 1rem;
        }

        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin-top: 2rem;
        }

        .no-data-container {
          margin-top: 2rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          text-align: center;
        }

        .charts-container {
          width: 100%;
          margin-top: 2rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          width: 100%;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .chart-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .chart-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1);
          border-radius: 20px 20px 0 0;
        }

        .temperature-chart::before {
          background: linear-gradient(90deg, #ff6b6b, #ff8e53);
        }

        .aqi-chart::before {
          background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .humidity-chart::before {
          background: linear-gradient(90deg, #06d6a0, #54d1db);
        }

        .wind-chart::before {
          background: linear-gradient(90deg, #f093fb, #f5576c);
        }

        .chart-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .chart-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .chart-header h5 {
          color: #2d3748;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .chart-header p {
          color: #718096;
          font-size: 0.875rem;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
            gap: 1.5rem;
          }
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .chart-card {
            padding: 1rem;
            border-radius: 16px;
          }

          .chart-header h5 {
            font-size: 1.1rem;
          }

          .chart-icon {
            font-size: 2rem;
          }

          .container {
            padding: 1rem 0.5rem;
          }
        }

        @media (max-width: 576px) {
          .charts-grid {
            gap: 1rem;
          }

          .chart-card {
            padding: 0.75rem;
            border-radius: 12px;
          }

          .chart-header {
            margin-bottom: 1rem;
          }

          .chart-header h5 {
            font-size: 1rem;
          }

          .chart-header p {
            font-size: 0.8rem;
          }

          .chart-icon {
            font-size: 1.75rem;
          }
        }

        /* Enhanced form controls */
        .form-select,
        .form-control {
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          transition: all 0.3s ease !important;
        }

        .form-select:focus,
        .form-control:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
          background: rgba(255, 255, 255, 1) !important;
        }

        /* Header styling */
        .d-flex.flex-row.justify-content-between.align-items-center.mb-3.w-100 {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 2rem !important;
        }

        /* Trends section styling */
        .d-flex.flex-column.align-items-center.shadow.rounded.border-0.p-5.w-100.mb-3 {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 25px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        }

        /* Daily summary section */
        .shadow.rounded.border-0.p-3.w-100 {
          background: rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(20px) !important;
          border-radius: 25px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
        }

        /* Text styling */
        div[style*="fontWeight: 400"] {
          color: #2d3748 !important;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }

        /* Responsive text */
        @media (max-width: 768px) {
          div[style*="fontSize: 38"] {
            font-size: 28px !important;
          }

          div[style*="fontSize: 24"] {
            font-size: 20px !important;
          }

          div[style*="fontSize: 18"] {
            font-size: 16px !important;
          }
        }

        @media (max-width: 576px) {
          div[style*="fontSize: 38"] {
            font-size: 24px !important;
          }

          div[style*="fontSize: 24"] {
            font-size: 18px !important;
          }

          div[style*="fontSize: 18"] {
            font-size: 14px !important;
          }

          .d-flex.flex-row.justify-content-between.align-items-center.mb-3.w-100 {
            flex-direction: column !important;
            gap: 1rem;
            text-align: center;
          }

          .d-flex.flex-row.justify-content-between.align-items-center.w-100 {
            flex-direction: column !important;
            gap: 1rem;
            text-align: center;
          }

          .d-flex.flex-row.justify-content-center.align-items-center.gap-2 {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherHistory;
