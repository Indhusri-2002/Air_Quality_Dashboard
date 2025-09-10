import React, { useState, useEffect } from "react";
import axios from "axios";
import WeatherCard from "@/components/WeatherCard";
import Image from "next/image";
import LoadingScreen from "@/components/LoadingScreen";
import NoDataFound from "@/components/NoDataFound";

const BACKEND_API_URL = process.env.BACKEND_API_URL;
// Fetch cities and weather conditions from environment variables
const cities = process.env.CITIES.split(",");

const Home = () => {
  const [city, setCity] = useState("Hyderabad");
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [customCity, setCustomCity] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetching weather data for the selected or custom city
  const fetchWeather = async () => {
    setLoading(true);
    try {
      // Use the custom city if provided, otherwise use the selected city
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

    // Set up interval to fetch weather data every 5 minutes (300,000 milliseconds)
    const intervalId = setInterval(() => {
      fetchWeather();
    }, 300000); // 5 minutes

    // Clear the interval when the component unmounts or city changes
    return () => clearInterval(intervalId);
  }, [city]);

  return (
    <div className="container my-5 d-flex flex-column align-items-center">
      <div className="d-flex flex-row justify-content-between align-items-center mb-5 w-100">
        <div className="d-flex flex-row align-items-center">
          <Image
            src={`/WeatherHeader.gif`}
            alt="header"
            width={55}
            height={55}
            className="me-2"
          />
          <div style={{ fontWeight: "400", fontSize: 38 }}>
            Weather Dashboard
          </div>
        </div>
        {/* Show the custom city input only if "Other" is selected */}
        <div className="d-flex flex-row gap-2 align-items-center">
          <input
            type="text"
            className="shadow border-0 rounded py-2 px-3 "
            placeholder="Enter city name"
            value={customCity}
            onChange={(e) => {
              setCustomCity(e.target.value);
            }}
            style={{
              outline: "none",
            }}
          />
          {/* Search button to fetch weather data */}
          <button
            className="btn btn-primary "
            onClick={() => {
              setCity("");
              fetchWeather();
            }}
            disabled={!customCity}
          >
            Search
          </button>
        </div>
        <div>
          <select
            className="form-select shadow border-0"
            id="city"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCustomCity(""); // Reset custom city when changing from dropdown
            }}
          >
            <option value={"select city"}>select city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weather Data */}
      {loading ? (
        <LoadingScreen />
      ) : weatherData ? (
        <WeatherCard weather={weatherData} />
      ) : error ? (
        <div className="w-100 mt-4">
          <NoDataFound message={error} />
        </div>
      ) : (
        <div className="w-100 mt-4">
          <NoDataFound message={`No weather details found for the entered city.`} />
        </div>
      )}
    </div>
  );
};

export default Home;
