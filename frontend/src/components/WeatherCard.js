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
      className="rounded border-0 shadow p-5"
      style={{ width: "800px", backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column justify-content-center align-items-center px-3">
        <div className="w-100 d-flex flex-row justify-content-between align-items-end">
          <div style={{ fontSize: 32, fontWeight: "600" }}>
             <FontAwesomeIcon icon={faLocationDot} bounce style={{color: "#578dea",}} size="sm" className="me-2" />
            {weather.name}
          </div>
          <div>
            <select
              id="unitSelect"
              className="form-select border-0"
              style={{ fontWeight: "500", fontSize: 18 }}
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

        <div className="d-flex flex-row justify-content-around align-items-center w-100 mt-4">
          <Image
            src={`/${weather.weather[0].main}.png`} // Local image in the public folder
            alt={`${weather.weather[0].description}`}
            width={250}
            height={250}
            className="img-fluid"
          />
          <div className="d-flex flex-column justify-content-between gap-4 ">
            <div className="d-flex flex-row justify-content-center w-100">
              <div style={{ fontSize: 40 }}>
                {convertTemperature(weather.main.temp)}{" "}
                {unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"}
              </div>
            </div>
            <div>
              <div className="mb-3">
                <Image
                  src={`/Feelslike.gif`}
                  alt="Feels like"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Feels Like: {convertTemperature(weather.main.feels_like)}{" "}
                {unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"}
              </div>
              <div className="mb-3">
                <Image
                  src={`/Weather.gif`}
                  alt="Conition"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Condition: {weather.weather[0].description}
              </div>

              <div className="mb-3">
                <Image
                  src={`/Humidity.gif`}
                  alt="humidity"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Humidity: {weather.main.humidity.toFixed(2)} %
              </div>

              <div className="mb-3">
                <Image
                  src={`/WindSpeed.gif`}
                  alt="wind speed"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Wind Speed: {weather.wind.speed.toFixed(2)} m/s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
