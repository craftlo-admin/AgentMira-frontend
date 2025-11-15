import React, { useState } from 'react';
import './PredictionComponent.css';

interface PredictionRequest {
  property_type: string;
  lot_area?: number;
  building_area?: number;
  bedrooms: number;
  bathrooms: number;
  year_built: number;
  has_pool: boolean;
  has_garage: boolean;
  school_rating: number;
}

interface PredictionResponse {
  status: string;
  predicted_price: number;
  input_data: PredictionRequest;
  model_info?: {
    model_type: string;
    model_class: string;
    model_module: string;
    is_loaded: boolean;
    model_path: string;
  };
}

const Prediction: React.FC = () => {
  const [propertyType, setPropertyType] = useState<string>('SFH');
  const [lotArea, setLotArea] = useState<string>('');
  const [buildingArea, setBuildingArea] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [yearBuilt, setYearBuilt] = useState<string>('');
  const [hasPool, setHasPool] = useState<boolean>(false);
  const [hasGarage, setHasGarage] = useState<boolean>(false);
  const [schoolRating, setSchoolRating] = useState<string>('');
  
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const propertyTypes = [
    { value: 'SFH', label: 'Single Family Home' },
    { value: 'Condo', label: 'Condominium' }
  ];

  const validateField = (value: string, min: number, max: number): boolean => {
    return Boolean(value.trim()) && !isNaN(Number(value)) && Number(value) >= min && Number(value) <= max;
  };

  const validateForm = (): string | null => {
    const currentYear = new Date().getFullYear();
    
    // Area validation based on property type
    if (propertyType === 'SFH' && !validateField(lotArea, 1, Infinity)) {
      return 'Please enter a valid lot area (greater than 0)';
    }
    if (propertyType === 'Condo' && !validateField(buildingArea, 1, Infinity)) {
      return 'Please enter a valid building area (greater than 0)';
    }
    
    // Field validations
    if (!validateField(bedrooms, 0, 50)) return 'Please enter valid bedrooms (0-50)';
    if (!validateField(bathrooms, 0, 20)) return 'Please enter valid bathrooms (0-20)';
    if (!validateField(yearBuilt, 1800, currentYear + 5)) return `Please enter valid year built (1800-${currentYear + 5})`;
    if (!validateField(schoolRating, 1, 10)) return 'Please enter valid school rating (1-10)';
    
    return null;
  };

  const handlePredict = async () => {
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    const predictionRequest: PredictionRequest = {
      property_type: propertyType,
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      year_built: Number(yearBuilt),
      has_pool: hasPool,
      has_garage: hasGarage,
      school_rating: Number(schoolRating),
      ...(propertyType === 'SFH' && { lot_area: Number(lotArea) }),
      ...(propertyType === 'Condo' && { building_area: Number(buildingArea) })
    };

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://agentmira-backend.onrender.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(predictionRequest)
      });

      if (!response.ok) {
        const errorMsg = response.status === 400 ? 'Invalid request data' : `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      const result: PredictionResponse = await response.json();
      setPredictionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPropertyType('SFH');
    setLotArea('');
    setBuildingArea('');
    setBedrooms('');
    setBathrooms('');
    setYearBuilt('');
    setHasPool(false);
    setHasGarage(false);
    setSchoolRating('');
    setPredictionResult(null);
    setError(null);
  };

  const renderPredictionResult = () => {
    if (!predictionResult) return null;

    const predictedPrice = Array.isArray(predictionResult.predicted_price) 
      ? predictionResult.predicted_price[0] 
      : predictionResult.predicted_price;

    const inputData = predictionResult.input_data;

    return (
      <div className="prediction-result-section">
        <div className="prediction-result-header">
          <h3>🏠 Price Prediction Result</h3>
        </div>
        
        <div className="prediction-price-container">
          <div className="predicted-price">
            <span className="price-label">Estimated Property Value:</span>
            <span className="price-value">${predictedPrice.toLocaleString()}</span>
          </div>
        </div>

        {predictionResult.model_info && (
          <div className="model-info">
            <h4>🤖 Model Status</h4>
            <div className="model-status">
              <span className={`status-indicator ${predictionResult.model_info.is_loaded ? 'loaded' : 'error'}`}>
                {predictionResult.model_info.is_loaded ? '✅ Model Active' : '❌ Model Error'}
              </span>
              <span className="model-type">{predictionResult.model_info.model_class}</span>
            </div>
          </div>
        )}

        <div className="input-summary">
          <h4>📋 Property Details</h4>
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Type:</span>
              <span className="summary-value">{propertyTypes.find(t => t.value === inputData.property_type)?.label}</span>
            </div>
            {inputData.lot_area && (
              <div className="summary-item">
                <span className="summary-label">Lot Area:</span>
                <span className="summary-value">{inputData.lot_area.toLocaleString()} sq ft</span>
              </div>
            )}
            {inputData.building_area && (
              <div className="summary-item">
                <span className="summary-label">Building Area:</span>
                <span className="summary-value">{inputData.building_area.toLocaleString()} sq ft</span>
              </div>
            )}
            <div className="summary-item">
              <span className="summary-label">Bed/Bath:</span>
              <span className="summary-value">{inputData.bedrooms}BR / {inputData.bathrooms}BA</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Year Built:</span>
              <span className="summary-value">{inputData.year_built}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Features:</span>
              <span className="summary-value">
                {[
                  inputData.has_pool && '🏊 Pool',
                  inputData.has_garage && '🚗 Garage'
                ].filter(Boolean).join(', ') || 'None'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">School Rating:</span>
              <span className="summary-value">{inputData.school_rating}/10</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h1>Property Price Prediction</h1>
        <button onClick={resetForm} className="refresh-button">
          Reset Form
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="prediction-form-section">
        <h2>Property Details</h2>
        <p className="table-instruction">Enter property information to get an AI-powered price prediction</p>
        
        <div className="prediction-form">
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="propertyType">Property Type *</label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => {
                  setPropertyType(e.target.value);
                  setLotArea('');
                  setBuildingArea('');
                }}
                className="prediction-select"
                required
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <div className="input-help">
                {propertyType === 'SFH' 
                  ? 'Single Family Home - requires lot area (total land size)'
                  : 'Condominium - requires building area (interior space)'
                }
              </div>
            </div>
          </div>

          <div className="form-row">
            {propertyType === 'SFH' ? (
              <div className="input-group">
                <label htmlFor="lotArea">Lot Area (sq ft) *</label>
                <input
                  id="lotArea"
                  type="number"
                  min="0"
                  value={lotArea}
                  onChange={(e) => setLotArea(e.target.value)}
                  placeholder="Total lot size"
                  className="prediction-input"
                  required
                />
              </div>
            ) : (
              <div className="input-group">
                <label htmlFor="buildingArea">Building Area (sq ft) *</label>
                <input
                  id="buildingArea"
                  type="number"
                  min="0"
                  value={buildingArea}
                  onChange={(e) => setBuildingArea(e.target.value)}
                  placeholder="Interior living space"
                  className="prediction-input"
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label htmlFor="schoolRating">School Rating (1-10) *</label>
              <input
                id="schoolRating"
                type="number"
                min="1"
                max="10"
                value={schoolRating}
                onChange={(e) => setSchoolRating(e.target.value)}
                placeholder="School district rating"
                className="prediction-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                id="bedrooms"
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                placeholder="Number of bedrooms"
                className="prediction-input"
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                placeholder="Number of bathrooms"
                className="prediction-input"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="yearBuilt">Year Built *</label>
              <input
                id="yearBuilt"
                type="number"
                min="1800"
                max={new Date().getFullYear() + 5}
                value={yearBuilt}
                onChange={(e) => setYearBuilt(e.target.value)}
                placeholder="Construction year"
                className="prediction-input"
                required
              />
            </div>
            <div className="input-group checkbox-group">
              <div className="checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasPool}
                    onChange={(e) => setHasPool(e.target.checked)}
                    className="prediction-checkbox"
                  />
                  <span className="checkbox-text">Has Swimming Pool</span>
                </label>
              </div>
              <div className="checkbox-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={hasGarage}
                    onChange={(e) => setHasGarage(e.target.checked)}
                    className="prediction-checkbox"
                  />
                  <span className="checkbox-text">Has Garage</span>
                </label>
              </div>
            </div>
          </div>

          <div className="prediction-button-container">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="prediction-button"
            >
              {loading ? 'Predicting...' : '🔮 Predict Price'}
            </button>
          </div>
        </div>
      </div>

      {/* Display prediction results */}
      {predictionResult && renderPredictionResult()}
    </div>
  );
};

export default Prediction;