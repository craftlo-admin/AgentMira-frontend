import React, { useState } from 'react';
import './PredictionComponent.css';

interface SearchPreferences {
  bedrooms?: number;
  bathrooms?: number;
  min_size_sqft?: number;
  amenities?: string[];
}

interface SearchRequest {
  location: string;
  budget: number;
  preferences?: SearchPreferences;
}

interface PropertyResult {
  _id: string;
  id: number;
  title: string;
  price: number;
  location: string;
}

interface SearchResponse {
  status: string;
  total_properties: number;
  properties: PropertyResult[];
}

const SearchProperties: React.FC = () => {
  const [location, setLocation] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [bedrooms, setBedrooms] = useState<string>('');
  const [bathrooms, setBathrooms] = useState<string>('');
  const [minSizesqft, setMinSizeSquft] = useState<string>('');
  const [amenitiesInput, setAmenitiesInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const buildPreferences = (): SearchPreferences | undefined => {
    const prefs: SearchPreferences = {};
    
    if (bedrooms.trim() && Number(bedrooms) > 0) prefs.bedrooms = Number(bedrooms);
    if (bathrooms.trim() && Number(bathrooms) > 0) prefs.bathrooms = Number(bathrooms);
    if (minSizesqft.trim() && Number(minSizesqft) > 0) prefs.min_size_sqft = Number(minSizesqft);
    if (amenitiesInput.trim()) {
      const amenities = amenitiesInput.split(',').map(item => item.trim()).filter(Boolean);
      if (amenities.length > 0) prefs.amenities = amenities;
    }
    
    return Object.keys(prefs).length > 0 ? prefs : undefined;
  };

  const handleSearch = async () => {
    // Validation
    if (!location.trim()) return setError('Location is required');
    if (!budget.trim() || Number(budget) <= 0) return setError('Please enter a valid budget amount');

    const searchRequest: SearchRequest = {
      location: location.trim(),
      budget: Number(budget),
      preferences: buildPreferences()
    };

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/findproperties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        const errorMsg = response.status === 400 ? 'Invalid search parameters' : `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      const result: SearchResponse = await response.json();
      setSearchResults(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setLocation('');
    setBudget('');
    setBedrooms('');
    setBathrooms('');
    setMinSizeSquft('');
    setAmenitiesInput('');
    setSearchResults(null);
    setError(null);
  };

  const renderSearchResults = () => {
    if (!searchResults) return null;

    return (
      <div className="search-results-section">
        <div className="search-results-header">
          <h3>🏠 Search Results ({searchResults.properties.length} of {searchResults.total_properties})</h3>
          <div className="filter-tags">
            <span className="filter-tag">📍 {location}</span>
            <span className="filter-tag">💰 ${Number(budget).toLocaleString()}</span>
            {bedrooms && Number(bedrooms) > 0 && <span className="filter-tag">🛏️ {bedrooms}+ BR</span>}
            {bathrooms && Number(bathrooms) > 0 && <span className="filter-tag">🚿 {bathrooms}+ BA</span>}
            {minSizesqft && Number(minSizesqft) > 0 && <span className="filter-tag">📐 {Number(minSizesqft).toLocaleString()}+ sqft</span>}
            {amenitiesInput.trim() && <span className="filter-tag">🏅 {amenitiesInput}</span>}
          </div>
        </div>

        {searchResults.properties.length > 0 && (
          <div className="api-summary-section">
            <h4>📊 Quick Stats</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Average Price:</span>
                <span className="summary-value">
                  ${Math.round(searchResults.properties.reduce((sum, p) => sum + p.price, 0) / searchResults.properties.length).toLocaleString()}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Price Range:</span>
                <span className="summary-value">
                  ${Math.min(...searchResults.properties.map(p => p.price)).toLocaleString()} - ${Math.max(...searchResults.properties.map(p => p.price)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {searchResults.properties.length > 0 ? (
          <div className="search-results-grid">
            {searchResults.properties.map((property: PropertyResult) => (
              <div key={property.id} className="property-card">
                <div className="property-card-image">
                  <div className="placeholder-image">
                    <span>🏠</span>
                  </div>
                </div>
                <div className="property-card-content">
                  <h4>{property.title}</h4>
                  <div className="property-price">
                    <span className="price">${property.price.toLocaleString()}</span>
                  </div>
                  <div className="property-card-details">
                    <div className="detail-row">
                      <span className="detail-label">📍 {property.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🆔 Property #{property.id}</span>
                    </div>
                  </div>
                  <div className="property-actions">
                    <button className="action-btn primary">View Details</button>
                    <button className="action-btn secondary">Contact Agent</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>No properties found matching your criteria. Try adjusting your search parameters.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h1>Search Properties</h1>
        <button onClick={resetForm} className="refresh-button">
          Reset Form
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="search-form-section">
        <h2>🔍 Property Search</h2>
        <p className="table-instruction">Find properties by location and budget, with optional preferences for bedrooms, bathrooms, size, and amenities</p>
        
        <div className="search-form">
          <div className="form-row">
            <div className="input-group required">
              <label htmlFor="location">📍 Location *</label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or area (e.g., New York, California)"
                className="search-input"
                required
              />
            </div>
            <div className="input-group required">
              <label htmlFor="budget">💰 Max Budget *</label>
              <input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Maximum budget (USD)"
                className="search-input"
                min="0"
                required
              />
            </div>
          </div>

          <div className="preferences-section">
            <h3>🎯 Preferences (Optional)</h3>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="bedrooms">🛏️ Min Bedrooms</label>
                <input
                  id="bedrooms"
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="Min bedrooms"
                  className="search-input"
                  min="0"
                />
              </div>
              <div className="input-group">
                <label htmlFor="bathrooms">🚿 Min Bathrooms</label>
                <input
                  id="bathrooms"
                  type="number"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="Min bathrooms"
                  className="search-input"
                  min="0"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="minSize">📐 Min Size (sq ft)</label>
                <input
                  id="minSize"
                  type="number"
                  value={minSizesqft}
                  onChange={(e) => setMinSizeSquft(e.target.value)}
                  placeholder="Min square footage"
                  className="search-input"
                  min="0"
                />
              </div>
              <div className="input-group">
                <label htmlFor="amenities">🏅 Amenities</label>
                <input
                  id="amenities"
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="Gym, Parking, Pool, etc."
                  className="search-input"
                />
              </div>
            </div>
          </div>

          <div className="search-button-container">
            <button
              onClick={handleSearch}
              disabled={loading || !location.trim() || !budget.trim()}
              className="search-button"
            >
              {loading ? 'Searching...' : '🔍 Search Properties'}
            </button>
          </div>
        </div>
      </div>

      {/* Display search results */}
      {searchResults && renderSearchResults()}
    </div>
  );
};

export default SearchProperties;