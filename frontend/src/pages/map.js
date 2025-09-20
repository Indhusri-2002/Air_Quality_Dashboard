import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import AQIDisplay from "../components/AQIDisplay";
import PollutantsDetail from "../components/PollutantsDetail";
import HealthImpact from "../components/HealthImpact";

// Dynamically import Map to avoid SSR issues
const MapView = dynamic(() => import("../components/MapView"), { ssr: false });

const BACKEND_API_URL = process.env.BACKEND_API_URL;

export default function Map() {
  const [coords, setCoords] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [city, setCity] = useState("-");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAQI, setIsLoadingAQI] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [place, setPlace] = useState("-");

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      });
    }
  }, []);

  // Fetch AQI whenever coords change
  useEffect(() => {
    const fetchAQI = async () => {
      if (!coords) return;
      
      setIsLoadingAQI(true);
      try {
        const response = await axios.get(
          `${BACKEND_API_URL}/air-quality/current?lat=${coords.lat}&lon=${coords.lon}`
        );
        // Ensure consistent data structure
        const aqiResponseData = response.data;
        if (aqiResponseData.pollutants && !aqiResponseData.components) {
          aqiResponseData.components = aqiResponseData.pollutants;
        }
        setAqiData(aqiResponseData);
        console.log(aqiResponseData);

        // Try to reverse geocode city name from coords
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json`
        );
        const geocodeData = await res.json();
        console.log(geocodeData);
        if (geocodeData?.display_name || geocodeData?.address?.city || geocodeData?.address?.town) {
          const cityName = geocodeData?.address?.city || geocodeData?.address?.town || geocodeData?.address?.village || "Current Location";
          setCity(cityName);
          setPlace(geocodeData.display_name);
          
        }
      } catch (err) {
        console.error(err);
        setAqiData(null);
        setCity("Error loading location");
      } finally {
        setIsLoadingAQI(false);
      }
    };
    
    fetchAQI();
  }, [coords]);

  // Auto-search function with debouncing
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for auto-search
    const newTimeout = setTimeout(() => {
      performSearch(value);
    }, 500); // 500ms delay
    
    setSearchTimeout(newTimeout);
  };

  // Search city using OpenStreetMap Nominatim
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    performSearch(searchQuery);
  };

  const handleSelectPlace = (place) => {
    setCoords({
      lat: parseFloat(place.lat),
      lon: parseFloat(place.lon),
    });
    setCity(place.display_name.split(",")[0]); // Take first part as city
    setSearchResults([]); // hide suggestions
    setSearchQuery(""); // clear input
  };

  return (
    <div className="page-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="header-content">
          <div className="title-section">
            <div>
              <h1>AQI</h1>
              <p className="subtitle">Real-time Air Quality Monitoring</p>
            </div>
          </div>
          
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                <input
                  type="text"
                  placeholder="Search for a city or location..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <button type="submit" className="search-button" disabled={isSearching}>
                  {isSearching ? (
                    <div className="spinner"></div>
                  ) : (
                    <span>🔍</span>
                  )}
                </button>
              </div>
            </form>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((place) => (
                  <div 
                    key={place.place_id} 
                    className="search-result-item"
                    onClick={() => handleSelectPlace(place)}
                  >
                    <div className="result-icon">📍</div>
                    <div className="result-text">
                      <div className="result-name">{place.display_name.split(",")[0]}</div>
                      <div className="result-address">{place.display_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* First Row: AQI Left, Map Right */}
        <div className="first-row">
          {/* AQI Data Section - Left */}
          <div className="aqi-section">
            <div className="section-header">
              <h2> Air Quality Data</h2>
              <div className="location-info">
                {isLoadingAQI ? (
                  <div className="loading-location">
                    <div className="spinner-small"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  <span className="current-location">📍 {city}</span>
                )}
              </div>
            </div>
            <div className="aqi-content">
              <AQIDisplay aqiData={aqiData} city={city} place={place} />
            </div>
          </div>

          {/* Map Section - Right */}
          <div className="map-section">
            <div className="section-header">
              <h2>📍 Interactive Map</h2>
              <div className="location-info">
                <span className="map-instruction">Click anywhere to get AQI data</span>
              </div>
            </div>
            <div className="map-container">
              {coords ? (
                <MapView
                  coords={coords}
                  setCoords={(newCoords) => {
                    setCoords(newCoords);
                    setSearchResults([]); // hide suggestions when map clicked
                  }}
                />
              ) : (
                <div className="map-placeholder">
                  <div className="placeholder-content">
                    <div className="placeholder-icon">🗺️</div>
                    <h3>Getting your location...</h3>
                    <p>Please allow location access to view the map</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <PollutantsDetail aqiData={aqiData} />
        
        {/* Health Impact Assessment */}
        <div className="health-section">
          <HealthImpact aqiData={aqiData} />
        </div>
        
        {/* Additional Information Section */}
        <div className="info-section">
          <div className="full-width-section">
            <div className="section-header">
              <h2>📊 Additional Air Quality Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <h3>🌍 About Air Quality Index</h3>
                <p>The Air Quality Index (AQI) is a standardized way to communicate air pollution levels to the public. It ranges from 1 (Good) to 5 (Very Poor) and helps you understand the health implications of current air quality conditions.</p>
              </div>
              <div className="info-card">
                <h3>🏥 Health Recommendations</h3>
                <p>Based on the current AQI level, we provide personalized recommendations for outdoor activities, exercise, and protective measures to help you stay healthy.</p>
              </div>
              <div className="info-card">
                <h3>🔬 Pollutant Monitoring</h3>
                <p>We track multiple air pollutants including PM2.5, PM10, Ozone, Nitrogen Dioxide, Carbon Monoxide, and Sulfur Dioxide to give you a comprehensive view of air quality.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header Section */
        .header-section {
          background: linear-gradient(135deg, rgba(227, 242, 253, 0.98) 0%, rgba(187, 222, 251, 0.98) 100%);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(33, 150, 243, 0.1);
          box-shadow: 0 4px 25px rgba(33, 150, 243, 0.15);
          position: sticky;
          top: 0;
          // z-index: 1000;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .app-icon {
          font-size: 40px;
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 4px rgba(25, 118, 210, 0.3));
        }

        .title-section h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #0d47a1;
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 4px rgba(25, 118, 210, 0.2));
        }

        .subtitle {
          margin: 0;
          color: #718096;
          font-size: 14px;
          font-weight: 500;
        }

        .search-section {
          position: relative;
          min-width: 400px;
        }

        .search-form {
          width: 100%;
        }

        .search-input-container {
          display: flex;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .search-input-container:focus-within {
          border-color: #1976d2;
          box-shadow: 0 4px 25px rgba(25, 118, 210, 0.2);
        }

        .search-input {
          flex: 1;
          padding: 14px 18px;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          background: transparent;
          color: #2d3748;
        }

        .search-input:focus {
          outline: none;
        }

        .search-input::placeholder {
          color: #a0aec0;
        }

        .search-button {
          padding: 14px 18px;
          border: none;
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          color: white;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 50px;
          box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(25, 118, 210, 0.4);
          background: linear-gradient(135deg, #1565c0 0%, #0277bd 100%);
        }

        .search-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
          margin-top: 8px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 1000;
        }

        .search-result-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f7fafc;
          transition: all 0.2s ease;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background: #f7fafc;
          padding-left: 20px;
        }

        .result-icon {
          font-size: 16px;
          margin-right: 12px;
          color: #1976d2;
        }

        .result-text {
          flex: 1;
        }

        .result-name {
          font-weight: 600;
          color: #2d3748;
          font-size: 14px;
        }

        .result-address {
          color: #718096;
          font-size: 12px;
          margin-top: 2px;
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .first-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
          align-items: start;
        }

        .second-row {
          width: 100%;
        }

        .health-section {
          width: 100%;
          margin: 30px 0;
        }

        .info-section {
          width: 100%;
          margin-top: 30px;
        }

        .map-section, .aqi-section, .full-width-section {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 25px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .aqi-content {
          max-height: 600px;
          overflow-y: auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #0d47a1;
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .location-info {
          display: flex;
          align-items: center;
        }

        .loading-location {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #718096;
          font-size: 14px;
        }

        .spinner-small {
          width: 12px;
          height: 12px;
          border: 2px solid #e2e8f0;
          border-top: 2px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .current-location {
          color: #1976d2;
          font-weight: 500;
          font-size: 14px;
        }

        .map-instruction {
          color: #718096;
          font-size: 12px;
          font-style: italic;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .info-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.9) 100%);
          padding: 20px;
          border-radius: 15px;
          border: 2px solid rgba(129, 212, 250, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
        }

        .info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(25, 118, 210, 0.2);
          border-color: #1976d2;
        }

        .info-card h3 {
          margin: 0 0 12px 0;
          color: #0d47a1;
          font-size: 16px;
          font-weight: 600;
        }

        .info-card p {
          margin: 0;
          color: #4a5568;
          font-size: 14px;
          line-height: 1.6;
        }

        .map-container {
          height: 400px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .map-placeholder {
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
          border-radius: 16px;
          border: 2px dashed #cbd5e0;
        }

        .placeholder-content {
          text-align: center;
          color: #718096;
        }

        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .placeholder-content h3 {
          margin: 0 0 8px 0;
          color: #4a5568;
          font-size: 18px;
          font-weight: 600;
        }

        .placeholder-content p {
          margin: 0;
          font-size: 14px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .first-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .header-content {
            flex-direction: column;
            gap: 20px;
          }
          
          .search-section {
            min-width: 100%;
            max-width: 500px;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 20px 15px;
          }
          
          .map-section, .aqi-section, .full-width-section {
            padding: 20px;
          }
          
          .map-container, .map-placeholder {
            height: 300px;
          }
          
          .title-section h1 {
            font-size: 24px;
          }
          
          .header-content {
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}
