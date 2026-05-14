import { useState, useMemo, useEffect, useRef } from 'react';
import { hotels } from './data';
import './index.css';

const MathFormula = ({ formula, displayMode = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.katex) {
      try {
        window.katex.render(formula, containerRef.current, {
          displayMode,
          throwOnError: false
        });
      } catch (err) {
        containerRef.current.textContent = formula;
      }
    }
  }, [formula, displayMode]);

  return <span ref={containerRef} />;
};

function App() {
  const [city, setCity] = useState('vienna');
  const [algorithmMode, setAlgorithmMode] = useState('maut'); // 'maut' or 'filter'
  const [expandedHotel, setExpandedHotel] = useState(null);
  
  // Weights (0 to 100)
  const [weights, setWeights] = useState({
    price: 50,
    location: 50,
    stars: 50,
    rating: 50,
    publicTransport: 50,
  });

  // Constraints for Filtering
  const [constraints, setConstraints] = useState({
    maxPrice: 300,
    maxLocation: 10,
    minStars: 3,
    minRating: 7,
    minTransport: 5,
  });

  const handleConstraintChange = (key, value) => {
    setConstraints(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleWeightChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: Number(value) }));
  };

  const setAutomatically = () => {
    // high on price, location, and transport, low on stars and rating
    setWeights({
      price: 100,
      location: 100,
      stars: 10,
      rating: 10,
      publicTransport: 100,
    });
  };

  // Filter hotels by city and calculate score
  const recommendedHotels = useMemo(() => {
    const cityHotels = hotels.filter(h => h.city === city);
    
    if (algorithmMode === 'filter') {
      return cityHotels.filter(hotel => {
        return hotel.price <= constraints.maxPrice &&
               hotel.location <= constraints.maxLocation &&
               hotel.stars >= constraints.minStars &&
               hotel.rating >= constraints.minRating &&
               hotel.publicTransport >= constraints.minTransport;
      });
    }
    
    // Find max/min for normalization across the current city to make it relative
    const prices = cityHotels.map(h => h.price);
    const locations = cityHotels.map(h => h.location);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const minLoc = Math.min(...locations);
    const maxLoc = Math.max(...locations);

    const scored = cityHotels.map(hotel => {
      // Normalize features to 0-1 range
      // Price: lower is better -> 1 is cheapest, 0 is most expensive
      const normPrice = maxPrice === minPrice ? 1 : (maxPrice - hotel.price) / (maxPrice - minPrice);
      
      // Location: lower is better -> 1 is closest, 0 is furthest
      const normLoc = maxLoc === minLoc ? 1 : (maxLoc - hotel.location) / (maxLoc - minLoc);
      
      // Stars: higher is better -> 1 is 5 stars, 0 is 1 star
      const normStars = (hotel.stars - 1) / 4;
      
      // Rating: higher is better -> 1 is 10, 0 is 1
      const normRating = (hotel.rating - 1) / 9;

      // Transport: higher is better -> 1 is 10, 0 is 1
      const normTransport = (hotel.publicTransport - 1) / 9;

      // Calculate weighted score using user weights
      const totalWeight = weights.price + weights.location + weights.stars + weights.rating + weights.publicTransport || 1; 
      
      const priceScore = weights.price * normPrice;
      const locScore = weights.location * normLoc;
      const starsScore = weights.stars * normStars;
      const ratingScore = weights.rating * normRating;
      const transportScore = weights.publicTransport * normTransport;
      
      const rawScore = priceScore + locScore + starsScore + ratingScore + transportScore;
      const percentageScore = (rawScore / totalWeight) * 100;

      return {
        ...hotel,
        matchScore: Math.round(percentageScore),
        breakdown: {
          normPrice: normPrice.toFixed(2),
          normLoc: normLoc.toFixed(2),
          normStars: normStars.toFixed(2),
          normRating: normRating.toFixed(2),
          normTransport: normTransport.toFixed(2),
          pricePts: Math.round(priceScore),
          locPts: Math.round(locScore),
          starsPts: Math.round(starsScore),
          ratingPts: Math.round(ratingScore),
          transportPts: Math.round(transportScore),
          totalWeight
        }
      };
    });

    // Sort by match score descending
    return scored.sort((a, b) => b.matchScore - a.matchScore);

  }, [city, weights, constraints, algorithmMode]);

  return (
    <>
      {/* Background blobs for premium look */}
      <div className="bg-gradient"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="container">
        <header className="header glass-panel">
          <h1>Travel Recommender</h1>
          <p>Welcome to the travel recommender system, where you decide what's important for you! Choose your destination and adjust the sliders to match your priorities. We'll find the perfect hotel for your needs.</p>
        </header>

        {algorithmMode === 'maut' && (
          <div className="glass-panel" style={{ background: 'rgba(238, 242, 255, 0.8)', border: '1px solid #c7d2fe' }}>
            <h3>🔍 Transparency: Multi-Attribute Utility Theory (MAUT)</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#4338ca' }}>
              In accordance with the EU Digital Services Act (DSA), we believe in transparent algorithms. Here is the mathematical foundation of your recommendations:
            </p>
            <div style={{ background: '#e0e7ff', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', color: '#3730a3', textAlign: 'center' }}>
              <MathFormula formula="U(X) = \sum_{i=1}^{5} w_i \cdot u_i(x_i)" displayMode={true} />
            </div>
            <ul style={{ fontSize: '0.85rem', color: '#4f46e5', paddingLeft: '1.5rem', marginBottom: '0' }}>
              <li><strong>Normalization (<MathFormula formula="u_i" />):</strong> We map the worst option to <strong>0</strong> and the best option to <strong>1</strong>.</li>
              <li><strong>Weighting (<MathFormula formula="w_i" />):</strong> The sliders represent your custom weights.</li>
              <li><strong>Calculation:</strong> We multiply the normalized score by your weight for each category. We sum these up and divide by the total sum of weights to get your exact "Percentage Match".</li>
            </ul>
          </div>
        )}

        <div className="glass-panel">
          <div className="city-selector">
            <button 
              className={`btn ${city === 'vienna' ? 'btn-active' : 'btn-secondary'}`}
              onClick={() => setCity('vienna')}
            >
              🏛️ Vienna
            </button>
            <button 
              className={`btn ${city === 'munich' ? 'btn-active' : 'btn-secondary'}`}
              onClick={() => setCity('munich')}
            >
              🍺 Munich
            </button>
          </div>

          <div className="algorithm-selector">
            <button 
              className={`btn ${algorithmMode === 'maut' ? 'btn-active' : 'btn-secondary'}`}
              onClick={() => setAlgorithmMode('maut')}
            >
              📊 Weighted MAUT
            </button>
            <button 
              className={`btn ${algorithmMode === 'filter' ? 'btn-active' : 'btn-secondary'}`}
              onClick={() => setAlgorithmMode('filter')}
            >
              🎯 Constraint-Guided
            </button>
          </div>

          {algorithmMode === 'maut' ? (
            <>
              <div className="controls-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">💰 Price Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="100" 
                        value={weights.price} 
                        onChange={(e) => handleWeightChange('price', e.target.value)} 
                      />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={weights.price} onChange={(e) => handleWeightChange('price', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means cheaper price is more important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">📍 Location Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="100" 
                        value={weights.location} 
                        onChange={(e) => handleWeightChange('location', e.target.value)} 
                      />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={weights.location} onChange={(e) => handleWeightChange('location', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means closer to center is more important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">⭐ Hotel Stars Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="100" 
                        value={weights.stars} 
                        onChange={(e) => handleWeightChange('stars', e.target.value)} 
                      />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={weights.stars} onChange={(e) => handleWeightChange('stars', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means more stars (luxury) is important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">👍 User Rating Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="100" 
                        value={weights.rating} 
                        onChange={(e) => handleWeightChange('rating', e.target.value)} 
                      />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={weights.rating} onChange={(e) => handleWeightChange('rating', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means better guest reviews are important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">🚇 Public Transport</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="100" 
                        value={weights.publicTransport} 
                        onChange={(e) => handleWeightChange('publicTransport', e.target.value)} 
                      />
                      <span className="unit">%</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="100" value={weights.publicTransport} onChange={(e) => handleWeightChange('publicTransport', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means better transit access is important.</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={setAutomatically}>
                  ✨ Set Recommendations Automatically
                </button>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', marginBottom: 0 }}>
                  (Prioritizes Price, Location & Transport)
                </p>
              </div>
            </>
          ) : (
            <div className="controls-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">💰 Max Price / Night</label>
                  <div className="input-with-unit">
                    <span className="unit">$</span>
                    <input 
                      type="number" 
                      className="control-input" 
                      min="30" max="600" step="10" 
                      value={constraints.maxPrice} 
                      onChange={(e) => handleConstraintChange('maxPrice', e.target.value)} 
                    />
                  </div>
                </div>
                <input type="range" min="30" max="600" step="10" value={constraints.maxPrice} onChange={(e) => handleConstraintChange('maxPrice', e.target.value)} />
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Filter out hotels more expensive than this.</p>
              </div>
              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">📍 Max Distance from Center</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      className="control-input" 
                      min="0.1" max="30" step="0.5" 
                      value={constraints.maxLocation} 
                      onChange={(e) => handleConstraintChange('maxLocation', e.target.value)} 
                    />
                    <span className="unit">km</span>
                  </div>
                </div>
                <input type="range" min="0.1" max="30" step="0.5" value={constraints.maxLocation} onChange={(e) => handleConstraintChange('maxLocation', e.target.value)} />
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Filter out hotels further away than this.</p>
              </div>
              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">⭐ Minimum Stars</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      className="control-input" 
                      min="1" max="5" step="1" 
                      value={constraints.minStars} 
                      onChange={(e) => handleConstraintChange('minStars', e.target.value)} 
                    />
                  </div>
                </div>
                <input type="range" min="1" max="5" step="1" value={constraints.minStars} onChange={(e) => handleConstraintChange('minStars', e.target.value)} />
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Must have at least this many stars.</p>
              </div>
              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">👍 Minimum Rating</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      className="control-input" 
                      min="1" max="10" step="0.5" 
                      value={constraints.minRating} 
                      onChange={(e) => handleConstraintChange('minRating', e.target.value)} 
                    />
                    <span className="unit">/10</span>
                  </div>
                </div>
                <input type="range" min="1" max="10" step="0.5" value={constraints.minRating} onChange={(e) => handleConstraintChange('minRating', e.target.value)} />
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Must have at least this user rating.</p>
              </div>
              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">🚇 Minimum Public Transport</label>
                  <div className="input-with-unit">
                    <input 
                      type="number" 
                      className="control-input" 
                      min="1" max="10" step="1" 
                      value={constraints.minTransport} 
                      onChange={(e) => handleConstraintChange('minTransport', e.target.value)} 
                    />
                    <span className="unit">/10</span>
                  </div>
                </div>
                <input type="range" min="1" max="10" step="1" value={constraints.minTransport} onChange={(e) => handleConstraintChange('minTransport', e.target.value)} />
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Must have at least this transit score.</p>
              </div>
            </div>
          )}
        </div>

        <h2>Recommended Hotels</h2>
        
        <div className="results-grid">
          {recommendedHotels.length === 0 && (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: '1.2rem', padding: '2rem' }}>
              No hotels match your constraints. Try relaxing them!
            </p>
          )}
          {recommendedHotels.map((hotel, index) => (
            <div key={hotel.id} className="hotel-card" style={{ animationDelay: `${index * 0.1}s` }}>
              {algorithmMode === 'maut' && (
                <div className="hotel-score">
                  🎯 {hotel.matchScore}% Match
                </div>
              )}
              <img src={hotel.image} alt={hotel.name} className="hotel-image" />
              <div className="hotel-content">
                <div className="hotel-header">
                  <h3 style={{ margin: 0 }}>{hotel.name}</h3>
                  <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{hotel.description}</p>
                </div>
                
                <div className="hotel-features" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="feature">
                    <span className="feature-icon">💰</span>
                    <span className="feature-value">${hotel.price} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/night</span></span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📍</span>
                    <span className="feature-value">{hotel.location} km <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>from center</span></span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">⭐</span>
                    <span className="feature-value">{hotel.stars} Stars</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">👍</span>
                    <span className="feature-value">{hotel.rating} / 10</span>
                  </div>
                  <div className="feature" style={{ gridColumn: '1 / -1' }}>
                    <span className="feature-icon">🚇</span>
                    <span className="feature-value">Transport Access: {hotel.publicTransport} / 10</span>
                  </div>
                </div>

                {algorithmMode === 'maut' && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <button 
                      onClick={() => setExpandedHotel(expandedHotel === hotel.id ? null : hotel.id)}
                      className="btn-text"
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
                    >
                      {expandedHotel === hotel.id ? 'Hide Calculation' : 'Show Mathematical Breakdown 🧮'}
                    </button>
                    
                    {expandedHotel === hotel.id && hotel.breakdown && (
                      <div className="math-breakdown">
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', textAlign: 'center' }}>
                          <MathFormula formula="\text{Score} = \frac{\sum (w_i \cdot \text{norm}_i)}{\sum w_i}" displayMode={true} />
                        </h4>
                        <div className="math-row">
                          <span>💰 Price:</span>
                          <span>{hotel.breakdown.normPrice} × {weights.price} = <strong>{hotel.breakdown.pricePts}</strong></span>
                        </div>
                        <div className="math-row">
                          <span>📍 Loc:</span>
                          <span>{hotel.breakdown.normLoc} × {weights.location} = <strong>{hotel.breakdown.locPts}</strong></span>
                        </div>
                        <div className="math-row">
                          <span>⭐ Stars:</span>
                          <span>{hotel.breakdown.normStars} × {weights.stars} = <strong>{hotel.breakdown.starsPts}</strong></span>
                        </div>
                        <div className="math-row">
                          <span>👍 Rating:</span>
                          <span>{hotel.breakdown.normRating} × {weights.rating} = <strong>{hotel.breakdown.ratingPts}</strong></span>
                        </div>
                        <div className="math-row">
                          <span>🚇 Trans:</span>
                          <span>{hotel.breakdown.normTransport} × {weights.publicTransport} = <strong>{hotel.breakdown.transportPts}</strong></span>
                        </div>
                        <div className="math-total">
                          <span>Sum: {hotel.breakdown.pricePts + hotel.breakdown.locPts + hotel.breakdown.starsPts + hotel.breakdown.ratingPts + hotel.breakdown.transportPts}</span>
                          <span>Total W: {hotel.breakdown.totalWeight}</span>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '0.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                          Final Match = {hotel.matchScore}%
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
