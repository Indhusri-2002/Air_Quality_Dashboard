// src/components/DailySummaryCard.js

import React, { useState } from "react";
import Image from "next/image";

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
    const date = new Date(d);
    return date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div
      className="rounded border-0 shadow p-5"
      style={{ width: "850px", backgroundColor: "#fff" }}
    >
      <div className="d-flex flex-column justify-content-center align-items-center px-3">
        <div className="w-100 d-flex flex-row justify-content-between align-items-end">
          <div style={{ fontSize: 28, fontWeight: "600" }}>
            Daily Summary for {city}
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
          {formatDate(dailySummary.date)}
        </div>

        <div className="d-flex flex-row justify-content-around align-items-end gap-3 w-100 mt-4">
          <Image
            src={`/${dailySummary.dominantCondition}.png`}
            alt={`${dailySummary.dominantCondition}`}
            width={300}
            height={300}
            className="img-fluid"
          />
          <div className="d-flex flex-column justify-content-between gap-5 ">
            <div className="d-flex flex-row justify-content-around w-100">
              <div style={{ fontSize: 36 }}>
                {convertTemperature(dailySummary.avgTemp)}{" "}
                {unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"}
              </div>
              <div>
                <div className="mb-2">
                  {`${convertTemperature(dailySummary.maxTemp)} ${
                    unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"
                  }`}
                  <Image
                    src={`/hot.gif`}
                    alt="max temp"
                    width={28}
                    height={28}
                    className="ms-2"
                  />
                </div>
                <div>
                  {`${convertTemperature(dailySummary.minTemp)} ${
                    unit === "kelvin" ? "K" : unit === "celsius" ? "°C" : "°F"
                  }`}
                  <Image
                    src={`/cold.gif`}
                    alt="min temp"
                    width={28}
                    height={28}
                    className="ms-2"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="mb-3">
                <Image
                  src={`/Weather.gif`}
                  alt="condition"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Dominant Weather Condition: {dailySummary.dominantCondition}
              </div>

              <div className="mb-3">
                <Image
                  src={`/Humidity.gif`}
                  alt="Humidity"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Avg Humidity: {dailySummary.avgHumidity.toFixed(2)} %
              </div>

              <div className="mb-3">
                <Image
                  src={`/WindSpeed.gif`}
                  alt="wind speed"
                  width={24}
                  height={24}
                  className="me-2"
                />
                Avg Wind Speed: {dailySummary.avgWindSpeed.toFixed(2)} m/s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryCard;
