// src/components/WeatherCard.js

import React, { useState } from "react";
import Image from "next/image";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const WeatherCard = ({ weather }) => {
  const [unit, setUnit] = useState("celsius"); // default unit is Kelvin

  // Function to convert temperature based on selected unit
  const convertTemperature = (temp) => {
    switch (unit) {
      case "celsius":
        return (temp - 273.15).toFixed(2); // Kelvin to Celsius
      case "fahrenheit":
        return (((temp - 273.15) * 9) / 5 + 32).toFixed(2); // Kelvin to Fahrenheit
      default:
        return temp.toFixed(2); // Kelvin
    }
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  // Convert the timestamp to a readable date format
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert from Unix timestamp
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className="rounded border-0 shadow-lg p-4 p-md-5 w-100"
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        transition: "all 0.3s ease"
      }}
    >
      <div className="d-flex flex-column justify-content-center align-items-center px-3">
        <div className="w-100 d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end mb-3">
          <div style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: "600" }} className="mb-2 mb-md-0">
             <FontAwesomeIcon icon={faLocationDot} bounce style={{color: "#578dea",}} size="sm" className="me-2" />
            {weather.name}
          </div>
          <div>
            <select
              id="unitSelect"
              className="form-select border-0 shadow-sm"
              style={{ 
                fontWeight: "500", 
                fontSize: 16,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderRadius: "8px"
              }}
              value={unit}
              onChange={handleUnitChange}
            >
              <option value="kelvin">K</option>
              <option value="celsius">°C</option>
              <option value="fahrenheit">°F</option>
            </select>
          </div>
        </div>

        {/* Date display */}
        <div
          style={{ fontSize: "16px", fontWeight: "400", fontStyle: "italic" }}
          className="w-100 mb-2"
        >
          {formatDate(weather.dt)}
        </div>

        <div className="d-flex flex-column flex-lg-row justify-content-around align-items-center w-100 mt-4 gap-5">
          <div className="text-center weather-image-container">
            <Image
              src={`/${weather.weather[0].main}.png`} // Local image in the public folder
              alt={`${weather.weather[0].description}`}
              width={280}
              height={280}
              className="img-fluid weather-image"
              style={{ maxWidth: "280px", height: "auto" }}
            />
          </div>
          <div className="d-flex flex-column justify-content-between gap-4 flex-grow-1">
            <div className="d-flex flex-row justify-content-center w-100">
              <div style={{ 
                fontSize: "clamp(32px, 8vw, 48px)", 
                fontWeight: "700",
                color: "#2c3e50",
                textShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}>
                {convertTemperature(weather.main.temp)}{" "}
                {unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"}
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="metric-item">
                  <div className="metric-icon feels-like-icon">🌡️</div>
                  <div className="metric-content">
                    <div className="metric-label">Feels Like</div>
                    <div className="metric-value">
                      {convertTemperature(weather.main.feels_like)}{" "}
                      {unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="metric-item">
                  <div className="metric-icon condition-icon">🌤️</div>
                  <div className="metric-content">
                    <div className="metric-label">Condition</div>
                    <div className="metric-value condition-text">
                      {weather.weather[0].description}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="metric-item">
                  <div className="metric-icon humidity-icon">💧</div>
                  <div className="metric-content">
                    <div className="metric-label">Humidity</div>
                    <div className="metric-value">
                      {weather.main.humidity.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6">
                <div className="metric-item">
                  <div className="metric-icon wind-icon">💨</div>
                  <div className="metric-content">
                    <div className="metric-label">Wind Speed</div>
                    <div className="metric-value">
                      {weather.wind.speed.toFixed(1)} m/s
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped CSS matching Daily Summary Card */}
      <style jsx>{`
        .weather-image-container {
          margin-bottom: 1rem;
        }

        .weather-image {
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
          transition: transform 0.3s ease;
        }

        .weather-image:hover {
          transform: scale(1.05);
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          transition: transform 0.2s ease;
        }

        .metric-item:hover {
          transform: translateY(-2px);
        }

        .metric-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 10px;
          font-size: 1.25rem;
        }

        .metric-content {
          flex: 1;
        }

        .metric-label {
          font-size: 0.875rem;
          color: #718096;
          margin-bottom: 0.25rem;
        }

        .metric-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
        }

        .condition-text {
          text-transform: capitalize;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .weather-image-container {
            margin-bottom: 1.5rem;
          }

          .metric-item {
            padding: 0.875rem;
          }

          .metric-icon {
            width: 36px;
            height: 36px;
            font-size: 1.1rem;
          }

          .metric-value {
            font-size: 1rem;
          }
        }

        @media (max-width: 576px) {
          .metric-item {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .metric-icon {
            width: 32px;
            height: 32px;
            font-size: 1rem;
          }

          .metric-label {
            font-size: 0.8rem;
          }

          .metric-value {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default WeatherCard;
