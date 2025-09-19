import { getAQILevel, pollutantInfo, formatTimestamp } from '../utils/aqiUtils';

export default function AQIDisplay({ aqiData, city, place }) {
  if (!aqiData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading AQI data...</p>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 20px;
            color: #0277bd;
            border: 2px dashed #81d4fa;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #b3e5fc;
            border-top: 4px solid #0288d1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const aqiLevel = getAQILevel(aqiData.aqi);
  const components = aqiData.components || {};

  return (
    <div className="aqi-container">
      {/* Main AQI Card */}
      <div className="aqi-main-card">
        <div className="aqi-header">
          <div className="location-info">
            <h2>🌍 {city}</h2>
            <h5> {place}</h5>
            <p className="timestamp">Updated: {formatTimestamp(aqiData.timestamp)}</p>
          </div>
          <div className="aqi-badge">
            <span className="aqi-icon">{aqiLevel.icon}</span>
            <div className="aqi-value">{aqiData.aqi}</div>
            <div className="aqi-level">{aqiLevel.level}</div>
          </div>
        </div>
        
        <div className="aqi-description">
          <p>{aqiLevel.description}</p>
          <div className="recommendation">
            <strong>💡 Recommendation:</strong> {aqiLevel.recommendation}
          </div>
        </div>
      </div>



      <style jsx>{`
        .aqi-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .aqi-main-card {
          background: linear-gradient(135deg, ${aqiLevel.color}15 0%, ${aqiLevel.color}25 100%);
          border-radius: 20px;
          padding: 25px;
          border: 2px solid ${aqiLevel.color}40;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .aqi-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .location-info h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
          font-weight: 700;
        }

        .timestamp {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        .aqi-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          min-width: 120px;
        }

        .aqi-icon {
          font-size: 30px;
          margin-bottom: 5px;
        }

        .aqi-value {
          font-size: 48px;
          font-weight: 900;
          color: ${aqiLevel.color};
          line-height: 1;
          margin-bottom: 5px;
        }

        .aqi-level {
          font-size: 16px;
          font-weight: 600;
          color: ${aqiLevel.color};
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .aqi-description {
          background: white;
          padding: 20px;
          border-radius: 15px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
        }

        .aqi-description p {
          margin: 0 0 15px 0;
          color: #555;
          font-size: 16px;
          line-height: 1.5;
        }

        .recommendation {
          background: ${aqiLevel.bgColor};
          padding: 15px;
          border-radius: 10px;
          border-left: 4px solid ${aqiLevel.color};
          color: #333;
          font-size: 15px;
          line-height: 1.4;
        }



        @media (max-width: 768px) {
          .aqi-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .aqi-main-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
