import React from 'react';

const ThresholdForm = ({ newThreshold, setNewThreshold, cities, weatherConditions }) => (
  <>
    <div className="mb-3">
      <label htmlFor="city" className="form-label">City</label>
      <select
        className="form-select"
        value={newThreshold.city}
        onChange={(e) => setNewThreshold({ ...newThreshold, city: e.target.value })}
        required
      >
        <option value="">Select a city</option>
        {cities.map((cityOption) => (
          <option key={cityOption} value={cityOption}>
            {cityOption}
          </option>
        ))}
      </select>
    </div>

    <div className="mb-3">
      <label htmlFor="temperatureThreshold" className="form-label">
        Temperature Threshold ({newThreshold.unit === 'Celsius' ? '°C' : 'K'})
      </label>
      <input
        type="number"
        className="form-control"
        value={newThreshold.temperatureThreshold}
        onChange={(e) => setNewThreshold({ ...newThreshold, temperatureThreshold: e.target.value })}
        required
      />
    </div>

    <div className="form-check form-switch mb-3">
      <input
        className="form-check-input"
        type="checkbox"
        id="unitToggle"
        checked={newThreshold.unit === 'Kelvin'}
        onChange={() => setNewThreshold({ ...newThreshold, unit: newThreshold.unit === 'Celsius' ? 'Kelvin' : 'Celsius' })}
      />
      <label className="form-check-label" htmlFor="unitToggle">
        Toggle to {newThreshold.unit === 'Celsius' ? 'Kelvin' : 'Celsius'}
      </label>
    </div>

    <div className="mb-3">
      <label htmlFor="email" className="form-label">Email for Alerts</label>
      <input
        type="email"
        className="form-control"
        value={newThreshold.email}
        onChange={(e) => setNewThreshold({ ...newThreshold, email: e.target.value })}
        required
      />
    </div>

    <div className="mb-3">
      <label htmlFor="weatherCondition" className="form-label">Weather Condition</label>
      <select
        className="form-select"
        value={newThreshold.weatherCondition}
        onChange={(e) => setNewThreshold({ ...newThreshold, weatherCondition: e.target.value })}
      >
        <option value="">Select a condition (optional)</option>
        {weatherConditions.map((condition, index) => (
          <option key={index} value={condition}>
            {condition}
          </option>
        ))}
      </select>
    </div>
  </>
);

export default ThresholdForm;
