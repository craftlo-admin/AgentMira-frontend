import React, { useState } from 'react';
import './PredictionComponent.css';

interface Property {
  _id: string;
  id: number;
  title: string;
  location: string;
  price: number;
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

interface ComparisonResponse {
  status: string;
  property1: Property;
  property2: Property;
  comparison_summary: {
    price_difference: number;
    bedrooms_difference: number;
    bathrooms_difference: number;
    size_difference: number;
    comparison_notes: {
      larger_property: number;
      more_expensive: number;
      more_bedrooms: number;
      more_bathrooms: number;
    };
  };
}

const CompareProperties: React.FC = () => {
  const [compareId1, setCompareId1] = useState<string>('1');
  const [compareId2, setCompareId2] = useState<string>('2');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResponse | null>(null);
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const compareProperties = async () => {
    const id1 = parseInt(compareId1);
    const id2 = parseInt(compareId2);

    // Validation
    if (!compareId1 || !compareId2) return setError('Please enter both property IDs');
    if (compareId1 === compareId2) return setError('Please enter different property IDs');
    if (isNaN(id1) || isNaN(id2)) return setError('Please enter valid numeric IDs');

    try {
      setCompareLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/comparebyid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id1, id2 })
      });
      
      if (!response.ok) {
        const errorMsg = response.status === 404 ? 'Property ID not found' : `HTTP error! status: ${response.status}`;
        throw new Error(errorMsg);
      }
      
      const result: ComparisonResponse = await response.json();
      setComparisonResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCompareLoading(false);
    }
  };

  const getComparison = (val1: number, val2: number, higherIsBetter = true) => {
    if (val1 === val2) return { winner: "Tie", class: "tie" };
    const prop1Wins = higherIsBetter ? val1 > val2 : val1 < val2;
    return prop1Wins 
      ? { winner: "Property 1", class: "winner-1" }
      : { winner: "Property 2", class: "winner-2" };
  };

  const getAnalysis = (property1: Property, property2: Property) => {
    const priceComp = getComparison(property1.price, property2.price, false);
    const sizeComp = getComparison(property1.size_sqft, property2.size_sqft);
    const bedroomComp = getComparison(property1.bedrooms, property2.bedrooms);
    const bathroomComp = getComparison(property1.bathrooms, property2.bathrooms);
    const schoolComp = getComparison(property1.school_rating, property2.school_rating);
    const commuteComp = getComparison(property1.commute_time, property2.commute_time, false);
    const yearComp = getComparison(property1.year_built, property2.year_built);
    const valueComp = getComparison(property1.price/property1.size_sqft, property2.price/property2.size_sqft, false);

    return {
      price: priceComp, size: sizeComp, bedrooms: bedroomComp, bathrooms: bathroomComp,
      school: schoolComp, commute: commuteComp, year: yearComp, value: valueComp
    };
  };

  const renderOverallWinner = (analysis: any) => {
    const analysisValues = Object.values(analysis) as { winner: string; class: string }[];
    const amenitiesComp = getComparison(comparisonResult!.property1.amenities.length, comparisonResult!.property2.amenities.length);
    const allComparisons = [...analysisValues, amenitiesComp];
    
    const property1Wins = allComparisons.filter(item => item.class === 'winner-1').length;
    const property2Wins = allComparisons.filter(item => item.class === 'winner-2').length;
    const ties = allComparisons.filter(item => item.class === 'tie').length;
    
    let overallWinner = '';
    let winnerClass = '';
    let winnerMessage = '';

    if (property1Wins > property2Wins) {
      overallWinner = `Property ${comparisonResult?.property1.id}`;
      winnerClass = 'overall-winner-1';
      winnerMessage = `Property ${comparisonResult?.property1.id} is the winner`;
    } else if (property2Wins > property1Wins) {
      overallWinner = `Property ${comparisonResult?.property2.id}`;
      winnerClass = 'overall-winner-2';
      winnerMessage = `Property ${comparisonResult?.property2.id} is the winner`;
    } else {
      overallWinner = 'It\'s a Tie!';
      winnerClass = 'overall-tie';
      winnerMessage = 'Both properties are equally matched';
    }

    return (
      <div className="overall-winner-section">
        <h4>🏆 Overall Winner</h4>
        <div className="overall-winner-container">
          <div className={`overall-winner-badge ${winnerClass}`}>
            <div className="winner-title">{overallWinner}</div>
            <div className="winner-subtitle">{winnerMessage}</div>
          </div>
          <div className="score-breakdown">
            <div className="score-item">
              <span className="score-label">Property {comparisonResult?.property1.id} wins:</span>
              <span className="score-value property1-score">{property1Wins} categories</span>
            </div>
            <div className="score-item">
              <span className="score-label">Property {comparisonResult?.property2.id} wins:</span>
              <span className="score-value property2-score">{property2Wins} categories</span>
            </div>
            <div className="score-item">
              <span className="score-label">Ties:</span>
              <span className="score-value tie-score">{ties} categories</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComparisonResults = () => {
    if (!comparisonResult) return null;

    const { property1, property2 } = comparisonResult;
    const analysis = getAnalysis(property1, property2);

    return (
      <div className="comparison-results-container">
        <div className="comparison-header">
          <h3>Property Comparison: ID {property1.id} vs ID {property2.id}</h3>
        </div>
        
        {/* Property Headers */}
        <div className="comparison-images">
          <div className="property-image-container">
            <h4>Property {property1.id}</h4>
            <h5 className="property-title">{property1.title}</h5>
          </div>
          <div className="property-image-container">
            <h4>Property {property2.id}</h4>
            <h5 className="property-title">{property2.title}</h5>
          </div>
        </div>

        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Property {property1.id}</th>
                <th>Property {property2.id}</th>
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Title</strong></td>
                <td>{property1.title}</td>
                <td>{property2.title}</td>
                <td className="no-winner">-</td>
              </tr>
              <tr>
                <td><strong>Location</strong></td>
                <td>{property1.location}</td>
                <td>{property2.location}</td>
                <td className="no-winner">-</td>
              </tr>
              <tr>
                <td><strong>Price</strong></td>
                <td>${property1.price.toLocaleString()}</td>
                <td>${property2.price.toLocaleString()}</td>
                <td className={`winner-cell ${analysis.price.class}`}>
                  {analysis.price.winner} {analysis.price.winner !== 'Tie' && '(Lower Price)'}
                </td>
              </tr>
              <tr>
                <td><strong>Size</strong></td>
                <td>{property1.size_sqft.toLocaleString()} sq ft</td>
                <td>{property2.size_sqft.toLocaleString()} sq ft</td>
                <td className={`winner-cell ${analysis.size.class}`}>
                  {analysis.size.winner} {analysis.size.winner !== 'Tie' && '(Larger)'}
                </td>
              </tr>
              <tr>
                <td><strong>Bedrooms</strong></td>
                <td>{property1.bedrooms}</td>
                <td>{property2.bedrooms}</td>
                <td className={`winner-cell ${analysis.bedrooms.class}`}>
                  {analysis.bedrooms.winner} {analysis.bedrooms.winner !== 'Tie' && '(More Bedrooms)'}
                </td>
              </tr>
              <tr>
                <td><strong>Bathrooms</strong></td>
                <td>{property1.bathrooms}</td>
                <td>{property2.bathrooms}</td>
                <td className={`winner-cell ${analysis.bathrooms.class}`}>
                  {analysis.bathrooms.winner} {analysis.bathrooms.winner !== 'Tie' && '(More Bathrooms)'}
                </td>
              </tr>
              <tr>
                <td><strong>School Rating</strong></td>
                <td>{property1.school_rating}/5</td>
                <td>{property2.school_rating}/5</td>
                <td className={`winner-cell ${analysis.school.class}`}>
                  {analysis.school.winner} {analysis.school.winner !== 'Tie' && '(Better Schools)'}
                </td>
              </tr>
              <tr>
                <td><strong>Commute Time</strong></td>
                <td>{property1.commute_time} min</td>
                <td>{property2.commute_time} min</td>
                <td className={`winner-cell ${analysis.commute.class}`}>
                  {analysis.commute.winner} {analysis.commute.winner !== 'Tie' && '(Shorter Commute)'}
                </td>
              </tr>
              <tr>
                <td><strong>Year Built</strong></td>
                <td>{property1.year_built}</td>
                <td>{property2.year_built}</td>
                <td className={`winner-cell ${analysis.year.class}`}>
                  {analysis.year.winner} {analysis.year.winner !== 'Tie' && '(Newer)'}
                </td>
              </tr>
              <tr>
                <td><strong>Has Garage</strong></td>
                <td>{property1.has_garage ? '✅ Yes' : '❌ No'}</td>
                <td>{property2.has_garage ? '✅ Yes' : '❌ No'}</td>
                <td className="no-winner">-</td>
              </tr>
              <tr>
                <td><strong>Has Garden</strong></td>
                <td>{property1.has_garden ? '✅ Yes' : '❌ No'}</td>
                <td>{property2.has_garden ? '✅ Yes' : '❌ No'}</td>
                <td className="no-winner">-</td>
              </tr>
              <tr>
                <td><strong>Has Pool</strong></td>
                <td>{property1.has_pool ? '✅ Yes' : '❌ No'}</td>
                <td>{property2.has_pool ? '✅ Yes' : '❌ No'}</td>
                <td className="no-winner">-</td>
              </tr>
              <tr>
                <td><strong>Price per sq ft</strong></td>
                <td>${(property1.price / property1.size_sqft).toFixed(2)}</td>
                <td>${(property2.price / property2.size_sqft).toFixed(2)}</td>
                <td className={`winner-cell ${analysis.value.class}`}>
                  {analysis.value.winner} {analysis.value.winner !== 'Tie' && '(Better Value)'}
                </td>
              </tr>
              <tr>
                <td><strong>Amenities</strong></td>
                <td>
                  <div className="amenities-list">
                    {property1.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="amenity-tag small">{amenity}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <div className="amenities-list">
                    {property2.amenities.map((amenity: string, index: number) => (
                      <span key={index} className="amenity-tag small">{amenity}</span>
                    ))}
                  </div>
                </td>
                <td className={`winner-cell ${getComparison(property1.amenities.length, property2.amenities.length).class}`}>
                  {getComparison(property1.amenities.length, property2.amenities.length).winner} {getComparison(property1.amenities.length, property2.amenities.length).winner !== 'Tie' && '(More Amenities)'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick Summary */}
        {comparisonResult.comparison_summary && (
          <div className="api-summary-section">
            <h4>📊 Quick Summary</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Price Gap:</span>
                <span className="summary-value">${Math.abs(comparisonResult.comparison_summary.price_difference).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Size Gap:</span>
                <span className="summary-value">{Math.abs(comparisonResult.comparison_summary.size_difference).toLocaleString()} sq ft</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">More Expensive:</span>
                <span className="summary-value">Property {comparisonResult.comparison_summary.comparison_notes.more_expensive}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Larger:</span>
                <span className="summary-value">Property {comparisonResult.comparison_summary.comparison_notes.larger_property}</span>
              </div>
            </div>
          </div>
        )}

        {/* Overall Winner Analysis */}
        {renderOverallWinner(analysis)}
      </div>
    );
  };

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h1>Compare Properties</h1>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="data-section comparison-section">
        <h2>Property Comparison Tool</h2>
        <p className="table-instruction">Enter two property IDs to compare their features and find the winner</p>
        <div className="comparison-inputs">
          <div className="input-group">
            <label htmlFor="compareId1">Property ID 1:</label>
            <input
              id="compareId1"
              type="number"
              value={compareId1}
              onChange={(e) => setCompareId1(e.target.value)}
              placeholder="Enter first property ID"
              className="compare-input"
            />
          </div>
          <div className="input-group">
            <label htmlFor="compareId2">Property ID 2:</label>
            <input
              id="compareId2"
              type="number"
              value={compareId2}
              onChange={(e) => setCompareId2(e.target.value)}
              placeholder="Enter second property ID"
              className="compare-input"
            />
          </div>
          <button
            onClick={compareProperties}
            disabled={compareLoading || !compareId1 || !compareId2}
            className="compare-button"
          >
            {compareLoading ? 'Comparing...' : 'Compare Properties'}
          </button>
        </div>
        
        {/* Display comparison results inline */}
        {comparisonResult && (
          <div className="comparison-results">
            {renderComparisonResults()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProperties;