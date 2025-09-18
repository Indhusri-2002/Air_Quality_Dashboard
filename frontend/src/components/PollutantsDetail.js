import { pollutantInfo } from '../utils/aqiUtils';

export default function PollutantsDetail({ aqiData }) {
  if (!aqiData || !aqiData.components) {
    return (
      <div className="pollutants-container">
        <div className="loading-pollutants">
          <div className="loading-spinner"></div>
          <p>Loading detailed air quality components...</p>
        </div>
        <style jsx>{`
          .pollutants-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .loading-pollutants {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 20px;
            color: #4a5568;
            border: 2px dashed #cbd5e0;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #667eea;
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

  const components = aqiData.components || {};

  return (
    <div className="pollutants-container">
      <div className="section-header">
        <h2>🔬 Detailed Air Quality Components</h2>
        <div className="components-count">
          {Object.keys(components).length} pollutants monitored
        </div>
      </div>
      
      <div className="pollutants-grid">
        {Object.entries(components).map(([key, value]) => {
          const pollutant = pollutantInfo[key];
          if (!pollutant) return null;
          
          return (
            <div key={key} className="pollutant-card">
              <div className="pollutant-header">
                <span className="pollutant-icon">{pollutant.icon}</span>
                <div className="pollutant-name">
                  <strong>{pollutant.name}</strong>
                  <small>{pollutant.fullName}</small>
                </div>
              </div>
              <div className="pollutant-value">
                {typeof value === 'number' ? value.toFixed(2) : value} <span className="unit">{pollutant.unit}</span>
              </div>
              <div className="pollutant-description">
                {pollutant.description}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .pollutants-container {
          background: linear-gradient(135deg, rgba(227, 242, 253, 0.95) 0%, rgba(187, 222, 251, 0.95) 100%);
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 8px 32px rgba(25, 118, 210, 0.15);
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
          color: #0d47a1;
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .components-count {
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
        }

        .pollutants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .pollutant-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 248, 255, 0.9) 100%);
          padding: 20px;
          border-radius: 16px;
          border: 2px solid rgba(129, 212, 250, 0.3);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(5px);
        }

        .pollutant-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #1976d2 0%, #0288d1 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .pollutant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(25, 118, 210, 0.2);
          border-color: #1976d2;
        }

        .pollutant-card:hover::before {
          transform: scaleX(1);
        }

        .pollutant-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .pollutant-icon {
          font-size: 28px;
          margin-right: 15px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .pollutant-name {
          display: flex;
          flex-direction: column;
        }

        .pollutant-name strong {
          color: #2d3748;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .pollutant-name small {
          color: #718096;
          font-size: 12px;
          font-weight: 500;
        }

        .pollutant-value {
          font-size: 32px;
          font-weight: 800;
          color: #1976d2;
          margin-bottom: 12px;
          line-height: 1;
        }

        .unit {
          font-size: 16px;
          color: #718096;
          font-weight: 500;
          margin-left: 4px;
        }

        .pollutant-description {
          font-size: 14px;
          color: #4a5568;
          line-height: 1.5;
          background: rgba(255, 255, 255, 0.7);
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid #1976d2;
        }

        @media (max-width: 768px) {
          .pollutants-container {
            padding: 20px;
          }
          
          .pollutants-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }
          
          .section-header {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
          
          .section-header h2 {
            font-size: 20px;
          }
        }

        @media (max-width: 480px) {
          .pollutants-grid {
            grid-template-columns: 1fr;
          }
          
          .pollutant-card {
            padding: 15px;
          }
          
          .pollutant-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
