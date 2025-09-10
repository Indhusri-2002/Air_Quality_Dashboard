import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DailySummaryCard from "@/components/DailySummaryCard";
import {
  LineChart,
  Line,
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

const BACKEND_API_URL = process.env.BACKEND_API_URL;
// Fetch cities and weather conditions from environment variables
const cities = process.env.CITIES.split(",");

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
      const sortedData = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
  }, [selectedDate,city]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Prepare data for graph
  const prepareGraphData = () => {
    if (!dayHistory) return;
    return dayHistory
      .slice()
      .reverse()
      .map((day) => ({
        date: day.date,
        maxTemp: day.maxTemp.toFixed(2),
        avgTemp: day.avgTemp.toFixed(2),
        minTemp: day.minTemp.toFixed(2),
        avgHumidity: day.avgHumidity.toFixed(2),
        avgWindSpeed: day.avgWindSpeed.toFixed(2),
      }));
  };

  return (
    <div className="container my-5 d-flex flex-column align-items-center gap-3">
      <div className="d-flex flex-row justify-content-between align-items-center mb-3 w-100">
        <div className="d-flex flex-row align-items-center">
          <Image
            src={`/Time.gif`}
            alt="history"
            width={55}
            height={55}
            className="me-2"
          />
          <div style={{ fontWeight: "400", fontSize: 38 }}>Weather History</div>
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
          <LoadingScreen />
        ) : dayHistory.length > 0 ? (
          <div className="w-100">
            <div className="card border-0 shadow p-3 mt-4 w-100">
              <h5 className="px-4 py-2">Temperature </h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={prepareGraphData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="maxTemp"
                    stroke="#82ca9d"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgTemp"
                    stroke="#0a48b2"
                    dot={false}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minTemp"
                    stroke="#ff7300"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card border-0 shadow p-3 mt-5 w-100">
              <h5 className="px-4 py-2">Humidity </h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={prepareGraphData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgHumidity"
                    stroke="#82ca9d"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card border-0 shadow p-3 mt-5 w-100">
              <h5 className="px-4 py-2">Wind Speed </h5>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={prepareGraphData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgWindSpeed"
                    stroke="#0a48b2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="w-100 mt-4">
            <NoDataFound message={`No weather history available`} />
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
    </div>
  );
};

export default WeatherHistory;
