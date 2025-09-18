import { getAQILevel } from '../utils/aqiUtils';

export default function HealthImpact({ aqiData }) {
  if (!aqiData) {
    return (
      <div className="health-container">
        <div className="loading-health">
          <div className="loading-spinner"></div>
          <p>Loading health impact assessment...</p>
        </div>
        <style jsx>{`
          .health-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .loading-health {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            background: linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%);
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

  return (
    <div className="health-container">
      <div className="section-header">
        <h2>🏥 Health Impact Assessment</h2>
        <div className="aqi-badge-small">
          <span className="aqi-icon">{aqiLevel.icon}</span>
          <span className="aqi-level">{aqiLevel.level}</span>
        </div>
      </div>
      
      <div className="impact-content">
        <div className="impact-level" style={{ backgroundColor: aqiLevel.bgColor, borderLeft: `5px solid ${aqiLevel.color}` }}>
          <div className="impact-header">
            <span style={{ color: aqiLevel.color, fontSize: '28px' }}>{aqiLevel.icon}</span>
            <div className="impact-text">
              <strong style={{ color: aqiLevel.color, fontSize: '20px' }}>{aqiLevel.level} Air Quality</strong>
              <p style={{ margin: '8px 0 0 0', color: '#4a5568' }}>{aqiLevel.description}</p>
            </div>
          </div>
        </div>
        
        <div className="recommendation-card">
          <div className="recommendation-header">
            <span className="recommendation-icon">💡</span>
            <h3>Health Recommendations</h3>
          </div>
          <p className="recommendation-text">{aqiLevel.recommendation}</p>
        </div>
      </div>

      <style jsx>{`
        .health-container {
          background: linear-gradient(135deg, rgba(224, 242, 254, 0.95) 0%, rgba(179, 229, 252, 0.95) 100%);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(2, 136, 209, 0.15);
          border: 1px solid rgba(129, 212, 250, 0.3);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid rgba(129, 212, 250, 0.3);
        }

        .section-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #0277bd;
          background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .aqi-badge-small {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.9);
          padding: 8px 16px;
          border-radius: 20px;
          box-shadow: 0 4px 15px rgba(2, 136, 209, 0.2);
        }

        .aqi-icon {
          font-size: 20px;
        }

        .aqi-level {
          font-weight: 600;
          color: #0277bd;
          font-size: 14px;
        }

        .impact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .impact-level {
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .impact-header {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .impact-text {
          flex: 1;
        }

        .recommendation-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.9) 100%);
          padding: 25px;
          border-radius: 16px;
          border: 2px solid rgba(129, 212, 250, 0.3);
          box-shadow: 0 4px 20px rgba(2, 136, 209, 0.1);
        }

        .recommendation-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .recommendation-icon {
          font-size: 14px;
          background: linear-gradient(135deg, #0288d1 0%, #0277bd 100%);
          padding: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .recommendation-header h3 {
          margin: 0;
          color: #0277bd;
          font-size: 18px;
          font-weight: 600;
        }

        .recommendation-text {
          margin: 0;
          color: #37474f;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .health-container {
            padding: 20px;
          }
          
          .impact-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .section-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
          
          .section-header h2 {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
