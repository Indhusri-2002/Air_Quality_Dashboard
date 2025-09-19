"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import WeatherCard from "@/components/WeatherCard";
import LoadingScreen from "@/components/LoadingScreen";
import NoDataFound from "@/components/NoDataFound";
import { isLoggedIn } from "@/utils/auth";
import { useRouter } from "next/router";

const BACKEND_API_URL = process.env.BACKEND_API_URL;
const CITY_COORDS = JSON.parse(process.env.CITY_COORDS);

const Home = () => {
  const router = useRouter();
  const [city, setCity] = useState("Hyderabad");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [customCity, setCustomCity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    }
  }, []);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const cityToFetch = customCity.trim() || city;
      const response = await axios.get(
        `${BACKEND_API_URL}/weather/city/${cityToFetch}`
      );
      setWeatherData(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(`Could not fetch weather data for ${customCity || city}`);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const intervalId = setInterval(fetchWeather, 300000); // 5 mins
    return () => clearInterval(intervalId);
  }, [city]);

  return (
    <div className="home-bg">
      <div className="content-wrapper">
        {/* Search & Dropdown */}
        <div className="controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Enter city name"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
            />
            <button
              onClick={() => {
                setCity("");
                fetchWeather();
              }}
              disabled={!customCity}
            >
              Search
            </button>
          </div>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCustomCity("");
            }}
          >
            <option value={"select city"}>Select city</option>
            {Object.entries(CITY_COORDS).map(([cityName]) => (
              <option key={cityName} value={cityName}>
                {cityName}
              </option>
            ))}
          </select>
        </div>

        {/* Weather Details */}
        <div className="glass-card">
          {loading ? (
            <LoadingScreen />
          ) : weatherData ? (
            <WeatherCard weather={weatherData} />
          ) : error ? (
            <NoDataFound message={error} />
          ) : (
            <NoDataFound message="No weather details found for the entered city." />
          )}
        </div>
      </div>

      {/* Scoped CSS */}
      <style jsx>{`
        .home-bg {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: url("/home.jpg") no-repeat center center/cover;
          padding: 20px;
        }

        .content-wrapper {
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .controls {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .search-bar {
          display: flex;
          gap: 10px;
          flex: 1;
        }

        input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          outline: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-size: 14px;
        }

        button {
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          background: #0070f3;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s ease-in-out;
        }

        button:disabled {
          background: #a0a0a0;
          cursor: not-allowed;
        }

        button:hover:not(:disabled) {
          background: #0059c1;
        }

        select {
          padding: 10px 14px;
          border-radius: 8px;
          border: none;
          outline: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          font-size: 14px;
          background: white;
        }

        .glass-card {
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Home;
