import React, { useState } from 'react';
import './PredictionComponent.css';

interface RecommendationRequest {
  user_budget: number;
  user_min_bedrooms: number;
}

interface PropertyRecommendation {
  basic_info: {
    _id: string;
    id: number;
    title: string;
    price: number;
    location: string;
  };
  details: {
    _id: string;
    id: number;
    bedrooms: number;
    bathrooms: number;
    size_sqft: number;
    amenities: string[];
    school_rating: number;
    commute_time: number;
    has_garage: boolean;
    has_garden: boolean;
    has_pool: boolean;
    year_built: number;
  };
  scores: {
    price_match_score: number;
    bedroom_score: number;
    school_rating_score: number;
    commute_score: number;
    property_age_score: number;
    amenities_score: number;
    total_score: number;
  };
}

interface RecommendationResponse {
  status: string;
  total_properties: number;
  recommended_properties: PropertyRecommendation[];
  cache_info?: {
    cache_hit_rate: string;
    cache_hits: number;
    cache_misses: number;
  } | null;
  performance_metrics?: {
    total_properties_analyzed: number;
    properties_meeting_criteria: number;
    cached_results: number;
    newly_calculated: number;
  } | null;
}

const Recommendation: React.FC = () => {
  const [userBudget, setUserBudget] = useState<string>('');
  const [userMinBedrooms, setUserMinBedrooms] = useState<string>('');
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    const budget = Number(userBudget);
    const bedrooms = Number(userMinBedrooms);
    
    if (!userBudget.trim() || isNaN(budget) || budget <= 0) return 'Please enter a valid budget (greater than 0)';
    if (!userMinBedrooms.trim() || isNaN(bedrooms) || bedrooms < 1) return 'Please enter valid minimum bedrooms (1 or greater)';
    
    return null;
  };

  const handleRecommendation = async () => {
    const validationError = validateForm();
    if (validationError) return setError(validationError);

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_budget: Number(userBudget),
          user_min_bedrooms: Number(userMinBedrooms)
        })
      });

      if (!response.ok) {
        const errorMsg = response.status === 400 || response.status === 404 
          ? 'No properties found for your criteria' 
          : `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }

      const result: RecommendationResponse = await response.json();
      setRecommendationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserBudget('');
    setUserMinBedrooms('');
    setRecommendationResult(null);
    setError(null);
  };

  const renderRecommendations = () => {
    if (!recommendationResult) return null;

    return (
      <div className="recommendation-results-section">
        <div className="recommendation-results-header">
          <h3>🎯 Property Recommendations ({recommendationResult.recommended_properties.length} found)</h3>
          <div className="criteria-tags">
            <span className="criteria-tag">Budget: ${Number(userBudget).toLocaleString()}</span>
            <span className="criteria-tag">Min Bedrooms: {userMinBedrooms}</span>
            {recommendationResult.cache_info && (
              <span className="criteria-tag">Cache: {recommendationResult.cache_info.cache_hit_rate}</span>
            )}
          </div>
        </div>

        {recommendationResult.performance_metrics && (
          <div className="api-summary-section">
            <h4>� Quick Stats</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Properties:</span>
                <span className="summary-value">{recommendationResult.total_properties}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Analyzed:</span>
                <span className="summary-value">{recommendationResult.performance_metrics.total_properties_analyzed}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Meeting Criteria:</span>
                <span className="summary-value">{recommendationResult.performance_metrics.properties_meeting_criteria}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Recommended:</span>
                <span className="summary-value">{recommendationResult.recommended_properties.length}</span>
              </div>
            </div>
          </div>
        )}

        {recommendationResult.recommended_properties.length > 0 ? (
          <div className="recommendations-grid">
            {recommendationResult.recommended_properties.map((property: PropertyRecommendation) => (
              <div key={property.basic_info.id} className="recommendation-card">
                <div className="recommendation-card-header">
                  <div className="match-score">
                    <span className="score-value">{Math.round(property.scores.total_score)}%</span>
                    <span className="score-label">Match</span>
                  </div>
                </div>
                
                <div className="recommendation-card-image">
                  <div className="placeholder-image">
                    <span>🏠</span>
                  </div>
                </div>
                
                <div className="recommendation-card-content">
                  <h4>{property.basic_info.title}</h4>
                  <div className="property-price">
                    <span className="price">${property.basic_info.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="property-details">
                    <div className="detail-row">
                      <span className="detail-label">📍 {property.basic_info.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🏠 {property.details.size_sqft.toLocaleString()} sq ft • {property.details.bedrooms}BR / {property.details.bathrooms}BA</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">🏗️ Built {property.details.year_built} • 🎓 {property.details.school_rating}/10 Schools</span>
                    </div>
                  </div>

                  <div className="score-breakdown">
                    <div className="score-grid">
                      <div className="score-item">
                        <span className="score-name">💰 Price:</span>
                        <span className="score-percent">{Math.round(property.scores.price_match_score)}%</span>
                      </div>
                      <div className="score-item">
                        <span className="score-name">🛏️ Bedrooms:</span>
                        <span className="score-percent">{Math.round(property.scores.bedroom_score)}%</span>
                      </div>
                      <div className="score-item">
                        <span className="score-name">🎓 Schools:</span>
                        <span className="score-percent">{Math.round(property.scores.school_rating_score)}%</span>
                      </div>
                      <div className="score-item">
                        <span className="score-name">🚗 Commute:</span>
                        <span className="score-percent">{Math.round(property.scores.commute_score)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="property-features">
                    <div className="features-list">
                      {property.details.has_garage && <span className="feature-tag">🚗 Garage</span>}
                      {property.details.has_garden && <span className="feature-tag">🌿 Garden</span>}
                      {property.details.has_pool && <span className="feature-tag">🏊 Pool</span>}
                      <span className="feature-tag">⏱️ {property.details.commute_time}min</span>
                      <span className="feature-tag">🎯 {property.details.amenities.length} amenities</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-recommendations">
            <p>No properties found matching your criteria. Try adjusting your budget or bedroom requirements.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h1>Property Recommendations</h1>
        <button onClick={resetForm} className="refresh-button">
          Reset Form
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="recommendation-form-section">
        <h2>Get Personalized Recommendations</h2>
        <p className="table-instruction">Enter your budget and bedroom requirements to get AI-powered property recommendations</p>
        
        <div className="recommendation-form">
          <div className="form-row">
            <div className="input-group required">
              <label htmlFor="userBudget">Budget (USD) *</label>
              <input
                id="userBudget"
                type="number"
                min="0"
                value={userBudget}
                onChange={(e) => setUserBudget(e.target.value)}
                placeholder="Enter your maximum budget"
                className="recommendation-input"
                required
              />
            </div>
            <div className="input-group required">
              <label htmlFor="userMinBedrooms">Minimum Bedrooms *</label>
              <input
                id="userMinBedrooms"
                type="number"
                min="1"
                value={userMinBedrooms}
                onChange={(e) => setUserMinBedrooms(e.target.value)}
                placeholder="Minimum number of bedrooms"
                className="recommendation-input"
                required
              />
            </div>
          </div>

          <div className="recommendation-button-container">
            <button
              onClick={handleRecommendation}
              disabled={loading || !userBudget.trim() || !userMinBedrooms.trim()}
              className="recommendation-button"
            >
              {loading ? 'Finding Recommendations...' : '🔍 Get Recommendations'}
            </button>
          </div>
        </div>
      </div>

      {/* Display recommendation results */}
      {recommendationResult && renderRecommendations()}
    </div>
  );
};

export default Recommendation;