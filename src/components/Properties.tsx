import React, { useState, useEffect } from 'react';
import './PredictionComponent.css';

interface Property {
  _id: string;
  id: number;
  title: string;
  price: number;
  location: string;
}

interface PropertyDetails extends Property {
  images: { _id: string; id: number; image_url: string; }[];
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
}

interface PropertiesResponse {
  status: string;
  total_properties: number;
  properties: Property[];
}

interface PropertyDetailResponse {
  status: string;
  property: PropertyDetails;
}

const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://127.0.0.1:8000/properties', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: PropertiesResponse = await response.json();
      
      if (result.status === 'success' && Array.isArray(result.properties)) {
        setProperties(result.properties);
        setTotalProperties(result.total_properties);
      } else {
        setProperties([]);
        setTotalProperties(0);
      }
    } catch (err) {
      setError(`Failed to fetch properties: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId: number) => {
    try {
      setDetailsLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/properties/${propertyId}`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result: PropertyDetailResponse = await response.json();
      
      if (result.status === 'success' && result.property) {
        setSelectedProperty(result.property);
        setShowModal(true);
      }
    } catch (err) {
      setError(`Failed to fetch details: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h1>Properties</h1>
        <button onClick={fetchProperties} className="refresh-button" disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="loading-message">
          Loading properties...
        </div>
      )}

      {!loading && !error && properties.length === 0 && (
        <div className="no-data-message">
          No properties available
        </div>
      )}

      {!loading && !error && properties.length > 0 && (
        <div className="data-section">
          <h2>Available Properties ({totalProperties} items)</h2>
          <p className="table-instruction">Click on any ID to view detailed information</p>
          <div className="properties-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property._id}>
                    <td>
                      <button 
                        className="property-id-link"
                        onClick={() => fetchPropertyDetails(property.id)}
                        disabled={detailsLoading}
                      >
                        {property.id}
                      </button>
                    </td>
                    <td>{property.title}</td>
                    <td>${property.price.toLocaleString()}</td>
                    <td>{property.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailsLoading && (
        <div className="loading-message">Loading property details...</div>
      )}

      {showModal && selectedProperty && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProperty.title}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              {selectedProperty.images?.length > 0 && (
                <div className="property-image">
                  <img 
                    src={selectedProperty.images[0].image_url} 
                    alt={selectedProperty.title}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
              
              <div className="property-details-grid">
                <div className="detail-item">
                  <strong>Price:</strong> ${selectedProperty.price.toLocaleString()}
                </div>
                <div className="detail-item">
                  <strong>Location:</strong> {selectedProperty.location}
                </div>
                <div className="detail-item">
                  <strong>Bedrooms:</strong> {selectedProperty.bedrooms}
                </div>
                <div className="detail-item">
                  <strong>Bathrooms:</strong> {selectedProperty.bathrooms}
                </div>
                <div className="detail-item">
                  <strong>Size:</strong> {selectedProperty.size_sqft.toLocaleString()} sq ft
                </div>
                <div className="detail-item">
                  <strong>Year Built:</strong> {selectedProperty.year_built}
                </div>
                <div className="detail-item">
                  <strong>School Rating:</strong> {selectedProperty.school_rating}/5
                </div>
                <div className="detail-item">
                  <strong>Commute:</strong> {selectedProperty.commute_time} min
                </div>
              </div>

              <div className="property-features">
                {selectedProperty.has_garage && <span className="feature-tag">🚗 Garage</span>}
                {selectedProperty.has_garden && <span className="feature-tag">🌿 Garden</span>}
                {selectedProperty.has_pool && <span className="feature-tag">🏊 Pool</span>}
              </div>

              {selectedProperty.amenities?.length > 0 && (
                <div className="property-amenities">
                  <strong>Amenities:</strong>
                  <div className="amenities-list">
                    {selectedProperty.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Properties;