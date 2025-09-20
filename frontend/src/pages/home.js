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
          width: 100%;
          min-height: calc(100vh - 80px);
          display: flex;
          justify-content: center;
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
          margin-top: 80px;
        }

        .controls {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        @media (min-width: 768px) {
          .controls {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
          }
        }

        .search-bar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        @media (min-width: 576px) {
          .search-bar {
            flex-direction: row;
            gap: 10px;
          }
        }

        input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          outline: none;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          font-size: 15px;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: #0070f3;
          box-shadow: 0 4px 20px rgba(0, 112, 243, 0.2);
          transform: translateY(-1px);
        }

        input::placeholder {
          color: #666;
        }

        button {
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #0070f3, #0059c1);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 112, 243, 0.3);
          font-size: 15px;
        }

        button:disabled {
          background: linear-gradient(135deg, #a0a0a0, #888);
          cursor: not-allowed;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        button:hover:not(:disabled) {
          background: linear-gradient(135deg, #0059c1, #004494);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 112, 243, 0.4);
        }

        button:active:not(:disabled) {
          transform: translateY(0);
        }

        select {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          outline: none;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 140px;
        }

        select:focus {
          border-color: #0070f3;
          box-shadow: 0 4px 20px rgba(0, 112, 243, 0.2);
          transform: translateY(-1px);
        }

        .glass-card {
          width: 100%;
          position: relative;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .glass-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default Home;
