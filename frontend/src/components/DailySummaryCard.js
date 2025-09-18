// src/components/DailySummaryCard.js

import React, { useState } from "react";
import Image from "next/image";
import moment from "moment-timezone";
import { getAQILevel } from "../utils/aqiUtils";

const DailySummaryCard = ({ city, dailySummary }) => {
  const [unit, setUnit] = useState("celsius"); // default to Celsius

  // Temperature conversion function
  const convertTemperature = (temp) => {
    switch (unit) {
      case "kelvin":
        return (temp + 273.15).toFixed(2); // Celsius to Kelvin
      case "fahrenheit":
        return ((temp * 9) / 5 + 32).toFixed(2); // Celsius to Fahrenheit
      default:
        return temp.toFixed(2); // Celsius
    }
  };

  const handleUnitChange = (e) => {
    setUnit(e.target.value);
  };

  // Convert the timestamp to a readable date format
  const formatDate = (d) => {
    return moment(d).tz("Asia/Kolkata").format("DD MMM YYYY");
  };

  // Handle missing AQI data
  const handleMissingAQI = () => {
    return {
      level: "N/A",
      color: "#9ca3af",
      bgColor: "#f3f4f6",
      description: "AQI data not available",
      recommendation: "Unable to provide air quality recommendations",
      icon: "❓",
    };
  };

  // Get weather condition emoji
  const getWeatherEmoji = (condition) => {
    const conditionMap = {
      Clear: "☀️",
      Clouds: "☁️",
      Rain: "🌧️",
      Drizzle: "🌦️",
      Thunderstorm: "⛈️",
      Snow: "❄️",
      Mist: "🌫️",
      Fog: "🌫️",
      Haze: "🌫️",
    };
    return conditionMap[condition] || "🌤️";
  };

  const aqiValue =
    dailySummary.avgAqi?.toFixed(2) || dailySummary.aqi?.toFixed(2);
  const aqiData = aqiValue ? getAQILevel(aqiValue) : handleMissingAQI();
  const weatherEmoji = getWeatherEmoji(dailySummary.dominantCondition);

  return (
    <>
      <div className="daily-summary-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="header-content">
            <div className="title-section">
              <h3 className="card-title">Daily Summary for {city}</h3>
              <p className="card-date">{formatDate(dailySummary.date)}</p>
            </div>
            <div className="unit-selector">
              <select
                id="unitSelect"
                className="form-select"
                value={unit}
                onChange={handleUnitChange}
              >
                <option value="celsius">°C</option>
                <option value="fahrenheit">°F</option>
                <option value="kelvin">K</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="card-content">
          {/* Weather Icon Section */}
          <div className="weather-icon-section">
            <Image
              src={`/${dailySummary.dominantCondition}.png`}
              alt={`${dailySummary.dominantCondition}`}
              width={240}
              height={240}
              className="weather-icon"
            />
          </div>

          {/* Data Section */}
          <div className="data-section">
            {/* Temperature Section */}
            <div className="temperature-section">
              <div className="main-temp">
                <span className="temp-value">
                  {convertTemperature(dailySummary.avgTemp)}°
                </span>
                <span className="temp-unit">
                  {unit === "kelvin" ? "K" : unit === "celsius" ? "C" : "F"}
                </span>
              </div>
              <div className="temp-range">
                <div className="temp-item max-temp">
                  <span className="temp-icon">🔥</span>
                  <span className="temp-text">
                    {convertTemperature(dailySummary.maxTemp)}°
                  </span>
                </div>
                <div className="temp-item min-temp">
                  <span className="temp-icon">❄️</span>
                  <span className="temp-text">
                    {convertTemperature(dailySummary.minTemp)}°
                  </span>
                </div>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-icon">
                <Image
                  src={`/Weather.gif`}
                  alt="condition"
                  width={24}
                  height={24}
                />
              </div>
              <div className="metric-content">
                <div className="metric-label">Dominant Weather Condition:</div>
                <div className="metric-value">
                  {dailySummary.dominantCondition}
                </div>
              </div>
            </div>

            {/* Other Metrics */}
            <div className="metrics-section">
              <div className="metric-item">
                <div className="metric-icon">💧</div>
                <div className="metric-content">
                  <div className="metric-label">Humidity</div>
                  <div className="metric-value">
                    {dailySummary.avgHumidity.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="metric-item">
                <div className="metric-icon">💨</div>
                <div className="metric-content">
                  <div className="metric-label">Wind Speed</div>
                  <div className="metric-value">
                    {dailySummary.avgWindSpeed.toFixed(1)} m/s
                  </div>
                </div>
              </div>
            </div>

            {/* AQI Section - Matching map.js style */}
            <div className="aqi-main-card">
              <div className="aqi-header-section">
                <h3>Air Quality</h3>
                <div className="aqi-sub-section">
                  <div className="aqi-level">{aqiData.level}</div>
                  <span className="aqi-icon">{aqiData.icon}</span>
                </div>
              </div>
              <div className="aqi-badge">
                <div className="aqi-value">{aqiValue || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .daily-summary-card {
          background: linear-gradient(
            135deg,
            rgb(249, 252, 255) 0%,
            rgb(235, 245, 253) 100%
          );
          border-radius: 24px;
          padding: 0;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          min-width: 320px;
          position: relative;
        }

        .daily-summary-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.05) 100%
          );
          pointer-events: none;
        }

        .card-header {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(20px);
          padding: 1.5rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .title-section {
          flex: 1;
        }

        .card-title {
          font-size: 1.6rem;
          font-weight: 700;
          color:rgba(68, 67, 67, 0.9);
          margin: 0 0 0.2rem 0;
        }

        .card-date {
          font-size: 1rem;
          color:rgba(127, 129, 131, 0.9);
          margin: 0;
          font-style: italic;
        }

        .unit-selector .form-select {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          padding: 0.5rem 1rem;
          font-weight: 600;
          color: #4a5568;
          min-width: 80px;
        }

        .unit-selector .form-select:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          outline: none;
        }

        .card-content {
          background: linear-gradient(
            135deg,
            rgb(249, 252, 255) 0%,
            rgb(235, 245, 253) 100%
          );
          backdrop-filter: blur(20px);
          padding: 2rem;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          gap: 2rem;
          align-items: center;
        }

        .weather-icon-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          flex: 1;
        }

        .weather-icon-container {
          position: relative;
        }

        .weather-icon {
          filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
          transition: transform 0.3s ease;
        }

        .weather-icon:hover {
          transform: scale(1.05);
        }

        .weather-condition {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .weather-emoji {
          font-size: 2rem;
        }

        .condition-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #4a5568;
        }

        .data-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .temperature-section {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .main-temp {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .temp-value {
          font-size: 4rem;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .temp-unit {
          font-size: 1.5rem;
          font-weight: 600;
          color: #718096;
        }

        .temp-range {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .temp-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .temp-icon {
          font-size: 1.25rem;
        }

        .temp-text {
          font-size: 1.1rem;
          font-weight: 600;
          color: #4a5568;
        }

        .max-temp {
          border-left: 4px solid #f56565;
        }

        .min-temp {
          border-left: 4px solid #4299e1;
        }

        /* AQI Section - Matching map.js exactly */
        .aqi-main-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .aqi-header-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .aqi-sub-section {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: .5rem;
        }

        .aqi-header-section h3 {
          margin: 0;
          color: #333;
          font-size: 20px;
          font-weight: 700;
        }


        .aqi-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          min-width: 120px;
        }

        .aqi-icon {
          font-size: 24px;
        }

        .aqi-value {
          font-size: 48px;
          font-weight: 900;
          color: ${aqiData.color};
          line-height: 1;
        }

        .aqi-level {
          font-size: 12px;
          font-weight: 600;
          color: ${aqiData.color};
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .aqi-description {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
        }

        .aqi-description p {
          margin: 0 0 15px 0;
          color: #555;
          font-size: 16px;
          line-height: 1.5;
        }

        .recommendation {
          background: ${aqiData.bgColor};
          padding: 15px;
          border-radius: 10px;
          border-left: 4px solid ${aqiData.color};
          color: #333;
          font-size: 15px;
          line-height: 1.4;
        }

        .metrics-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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

        /* Responsive Design */
        @media (max-width: 768px) {
          .daily-summary-card {
            max-width: 100%;
            margin: 0 1rem;
          }

          .card-header {
            padding: 1rem 1.5rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .card-title {
            font-size: 1.5rem;
          }

          .card-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem;
          }

          .temperature-section {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
          }

          .temp-value {
            font-size: 3rem;
          }

          .temp-range {
            flex-direction: row;
            justify-content: center;
            gap: 1rem;
          }

          .metrics-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .card-header {
            padding: 1rem;
          }

          .card-content {
            padding: 1rem;
          }

          .card-title {
            font-size: 1.25rem;
          }

          .temp-value {
            font-size: 2.5rem;
          }

          .temp-range {
            flex-direction: column;
            gap: 0.75rem;
          }

          .aqi-header-section {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .aqi-main-card {
            padding: 20px;
          }

          .aqi-value {
            font-size: 2rem;
          }
        }
      `}</style>
    </>
  );
};

export default DailySummaryCard;
