import { useState, useMemo, useEffect, useRef } from 'react';
import { hotels } from './data';
import './index.css';
import { calculateMaut, filterConstraints } from './recommenderEngine';


const MathFormula = ({ formula, displayMode = false }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && window.katex) {
      try {
        window.katex.render(formula, containerRef.current, {
          displayMode,
          throwOnError: false
        });
      } catch {
        containerRef.current.textContent = formula;
      }
    }
  }, [formula, displayMode]);

  return <span ref={containerRef} />;
};

function App() {
  const [city, setCity] = useState('vienna');
  const [algorithmMode, setAlgorithmMode] = useState(null); // null, 'maut', or 'filter'
  const [expandedHotel, setExpandedHotel] = useState(null);
  const [showFormulas, setShowFormulas] = useState(false);
  
  // Weights (0 to 10)
  const [weights, setWeights] = useState({
    price: 5,
    location: 5,
    stars: 5,
    rating: 5,
    publicTransport: 5,
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
    // Clamp weight between 0 and 10
    let val = Number(value);
    if (val < 0) val = 0;
    if (val > 10) val = 10;
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  // Filter hotels by city and calculate score
  const recommendedHotels = useMemo(() => {
    const cityHotels = hotels.filter(h => h.city === city);
    
    if (algorithmMode === 'filter') {
      return filterConstraints(cityHotels, constraints);
    }
    
    if (algorithmMode === 'maut') {
      return calculateMaut(cityHotels, weights);
    }

    return [];
  }, [city, weights, constraints, algorithmMode]);

  // If no algorithm selected yet, show selection landing page
  if (algorithmMode === null) {
    return (
      <>
        {/* Background blobs for premium look */}
        <div className="bg-gradient"></div>
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>

        <div className="container">
          <header className="header glass-panel">
            <h1>Travel Recommender</h1>
            <p>Welcome to the travel recommender system! To begin finding the perfect hotel for your needs, please select a recommendation algorithm strategy below.</p>
          </header>

          <div className="algorithm-choice-grid">
            <div className="choice-card glass-panel" onClick={() => setAlgorithmMode('maut')}>
              <div className="choice-icon">📊</div>
              <h2>Weighted MAUT Strategy</h2>
              <p style={{ fontWeight: '600', color: 'var(--primary)', margin: '0.5rem 0' }}>Multi-Attribute Utility Theory</p>
              <p style={{ fontSize: '0.95rem' }}>
                Rate how important Price, Location, Stars, Ratings, and Transport are on a scale of 0 to 10. The system calculates a weighted percentage match score for each hotel to rank your optimal choices.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                Select Weighted MAUT
              </button>
            </div>

            <div className="choice-card glass-panel" onClick={() => setAlgorithmMode('filter')}>
              <div className="choice-icon">🎯</div>
              <h2>Constraint-Guided Strategy</h2>
              <p style={{ fontWeight: '600', color: 'var(--secondary)', margin: '0.5rem 0' }}>Strict Rule Filtering</p>
              <p style={{ fontSize: '0.95rem' }}>
                Define absolute requirements (e.g. maximum price, minimum stars, minimum rating). The system eliminates any hotel violating a single rule, showing only those matching all constraints.
              </p>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'linear-gradient(135deg, var(--secondary), #d97706)', boxShadow: '0 4px 14px 0 rgba(217, 119, 6, 0.39)' }}>
                Select Constraint Filtering
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Background blobs for premium look */}
      <div className="bg-gradient"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <div className="container">
        <header className="header glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setAlgorithmMode(null)} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
              ← Switch Algorithm
            </button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn ${algorithmMode === 'maut' ? 'btn-active' : 'btn-secondary'}`}
                onClick={() => setAlgorithmMode('maut')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                📊 MAUT
              </button>
              <button 
                className={`btn ${algorithmMode === 'filter' ? 'btn-active' : 'btn-secondary'}`}
                onClick={() => setAlgorithmMode('filter')}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                🎯 Filtering
              </button>
            </div>
          </div>
          <h1>Travel Recommender</h1>
          <p>Choose your destination and adjust the settings below. The recommendation list updates in real-time.</p>
        </header>

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

          {algorithmMode === 'maut' ? (
            <>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '500', margin: 0 }}>
                  💡 <strong>Weight Scale (0 to 10):</strong> 0 means completely unimportant/worst weight, 10 means most important/best weight.
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                  The sliders do not need to sum to 10; they define the relative importance of each category.
                </p>
              </div>

              <div className="controls-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">💰 Price Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="10" 
                        value={weights.price} 
                        onChange={(e) => handleWeightChange('price', e.target.value)} 
                      />
                      <span className="unit">/10</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="10" value={weights.price} onChange={(e) => handleWeightChange('price', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means cheaper price is more important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">📍 Location Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="10" 
                        value={weights.location} 
                        onChange={(e) => handleWeightChange('location', e.target.value)} 
                      />
                      <span className="unit">/10</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="10" value={weights.location} onChange={(e) => handleWeightChange('location', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means closer to center is more important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">⭐ Hotel Stars Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="10" 
                        value={weights.stars} 
                        onChange={(e) => handleWeightChange('stars', e.target.value)} 
                      />
                      <span className="unit">/10</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="10" value={weights.stars} onChange={(e) => handleWeightChange('stars', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means more stars (luxury) is important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">👍 User Rating Importance</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="10" 
                        value={weights.rating} 
                        onChange={(e) => handleWeightChange('rating', e.target.value)} 
                      />
                      <span className="unit">/10</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="10" value={weights.rating} onChange={(e) => handleWeightChange('rating', e.target.value)} />
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means better guest reviews are important.</p>
                </div>
                <div className="control-group">
                  <div className="control-header">
                    <label className="control-label">🚇 Public Transport</label>
                    <div className="input-with-unit">
                      <input 
                        type="number" 
                        className="control-input" 
                        min="0" max="10" 
                        value={weights.publicTransport} 
                        onChange={(e) => handleWeightChange('publicTransport', e.target.value)} 
                      />
                      <span className="unit">/10</span>
                    </div>
                  </div>
                   <input type="range" min="0" max="10" value={weights.publicTransport} onChange={(e) => handleWeightChange('publicTransport', e.target.value)} />
                   <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means better transit access is important.</p>
                </div>
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

        {algorithmMode === 'maut' && (
          <div className="glass-panel" style={{ background: 'rgba(238, 242, 255, 0.8)', border: '1px solid #c7d2fe' }}>
            <h3>🔍 Transparency: Multi-Attribute Utility Theory (MAUT)</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#4338ca' }}>
              In accordance with the EU Digital Services Act (DSA), we believe in transparent algorithms. {showFormulas ? 'Here is the mathematical foundation of your recommendations:' : 'Here is a simple explanation of how your recommendations are calculated:'}
            </p>
            <button 
              onClick={() => setShowFormulas(!showFormulas)}
              className="math-toggle-btn math-toggle-btn-maut"
            >
              {showFormulas ? 'Hide Mathematical Details ✖' : 'Show Mathematical Details 🧮'}
            </button>
            {showFormulas && (
              <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem', color: '#3730a3', textAlign: 'left', overflowX: 'auto' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', textAlign: 'center' }}>Weighted Aggregation:</div>
                <MathFormula formula="U = \frac{\sum_{i=1}^{5} w_i \cdot u_i}{\sum_{i=1}^{5} w_i} \times 100\%" displayMode={true} />
                
                <div style={{ fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>Relative Normalization (Price & Distance):</div>
                <MathFormula formula="u(v) = \frac{v_{\max} - v}{v_{\max} - v_{\min}}" displayMode={true} />

                <div style={{ fontWeight: '600', marginTop: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>Absolute Normalization (Stars & Review/Transport):</div>
                <MathFormula formula="u_{\text{stars}}(v) = \frac{v - 1}{4} \quad \text{and} \quad u_{\text{rating/transport}}(v) = \frac{v - 1}{9}" displayMode={true} />
              </div>
            )}
            <ul style={{ fontSize: '0.85rem', color: '#4f46e5', paddingLeft: '1.5rem', marginBottom: '0' }}>
              {showFormulas ? (
                <>
                  <li><strong>Weighted Aggregation:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', listStyleType: 'circle' }}>
                      <li><MathFormula formula="U" />: The total utility (match score percentage).</li>
                      <li><MathFormula formula="w_i" />: The user given weight to the attribute <MathFormula formula="i" /> (where <MathFormula formula="w_i \in [0, 10]" />).</li>
                      <li><MathFormula formula="u_i" />: The prior calculated normalized utility score of the attribute <MathFormula formula="i" /> for the hotel.</li>
                    </ul>
                  </li>
                  <li style={{ marginTop: '0.5rem' }}><strong>Relative Normalization:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', listStyleType: 'circle' }}>
                      <li><MathFormula formula="v" />: The raw value of the hotel.</li>
                      <li><MathFormula formula="v_{\min}" /> and <MathFormula formula="v_{\max}" />: The minimum and maximum values of this attribute across all hotels in the selected city.</li>
                    </ul>
                  </li>
                  <li style={{ marginTop: '0.5rem' }}><strong>Absolute Normalization:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', listStyleType: 'circle' }}>
                      <li><MathFormula formula="v" />: The raw value of stars (1 to 5) or reviews/transport (1 to 10).</li>
                    </ul>
                  </li>
                </>
              ) : (
                <>
                  <li><strong>Normalization:</strong> We map the worst option to <strong>0</strong> and the best option to <strong>1</strong>.</li>
                  <li><strong>Weighting:</strong> The sliders represent your custom weights (from 0 to 10).</li>
                  <li><strong>Calculation:</strong> We multiply the normalized score by your weight for each category. We sum these up and divide by the total sum of weights to get your exact "Percentage Match".</li>
                </>
              )}
            </ul>
          </div>
        )}

        {algorithmMode === 'filter' && (
          <div className="glass-panel" style={{ background: 'rgba(240, 253, 244, 0.8)', border: '1px solid #bbf7d0' }}>
            <h3>🎯 Transparency: Constraint-Guided Filtering</h3>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#15803d' }}>
              In accordance with the EU Digital Services Act (DSA), we believe in transparent algorithms. {showFormulas ? 'Here is the logical foundation of your recommendations:' : 'Here is a simple explanation of how your recommendations are filtered:'}
            </p>
            <button 
              onClick={() => setShowFormulas(!showFormulas)}
              className="math-toggle-btn math-toggle-btn-filter"
            >
              {showFormulas ? 'Hide Mathematical Details ✖' : 'Show Mathematical Details 🧮'}
            </button>
            {showFormulas && (
              <div style={{ background: '#dcfce7', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.75rem', color: '#166534', textAlign: 'center', overflowX: 'auto' }}>
                <MathFormula formula="\text{Price} \le P_{\max} \ \land \ \text{Distance} \le D_{\max} \ \land \ \text{Stars} \ge S_{\min} \ \land \ \text{Rating} \ge R_{\min} \ \land \ \text{Transport} \ge T_{\min}" displayMode={true} />
              </div>
            )}
            <ul style={{ fontSize: '0.85rem', color: '#16a34a', paddingLeft: '1.5rem', marginBottom: '0' }}>
              {showFormulas ? (
                <>
                  <li><strong>Logical Conjunction:</strong>
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', listStyleType: 'circle' }}>
                      <li><MathFormula formula="P_{\max}" />: The maximum price threshold defined by the user.</li>
                      <li><MathFormula formula="D_{\max}" />: The maximum distance threshold defined by the user.</li>
                      <li><MathFormula formula="S_{\min}, R_{\min}, T_{\min}" />: The minimum stars, guest review rating, and public transport access scores thresholds defined by the user.</li>
                      <li><MathFormula formula="\text{Price}, \text{Distance}, \text{Stars}, \text{Rating}, \text{Transport}" />: The raw values of the hotel.</li>
                      <li><MathFormula formula="\land" />: The logical AND operator (all constraints must be met simultaneously).</li>
                    </ul>
                  </li>
                  <li style={{ marginTop: '0.5rem' }}><strong>Non-Compensatory Logic:</strong> Scoring highly in one category cannot compensate for a single constraint violation.</li>
                  <li style={{ marginTop: '0.5rem' }}><strong>Complete Predictability:</strong> A hotel is either included in the final results or excluded entirely based on your exact constraints.</li>
                </>
              ) : (
                <>
                  <li><strong>Non-Compensatory Logic:</strong> A hotel must satisfy <strong>all</strong> active limits simultaneously. Scoring highly in one category cannot compensate for failing another.</li>
                  <li><strong>Set Reduction:</strong> We start with the full list of hotels for your selected city and filter out any hotel that violates even one of your chosen bounds.</li>
                  <li><strong>Complete Predictability:</strong> There are no weighted matching scores or complex utility functions. A hotel is either included in the final results or excluded entirely based on your exact constraints.</li>
                </>
              )}
            </ul>
          </div>
        )}

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
                          <MathFormula formula="U = \frac{\sum_{i=1}^{5} w_i \cdot u_i}{\sum_{i=1}^{5} w_i} \times 100\%" displayMode={true} />
                        </h4>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px dashed var(--border)', paddingBottom: '0.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>
                          <span>Category</span>
                          <span>Utility <span style={{ color: '#4f46e5' }}>(u_i)</span> × Weight <span style={{ color: '#d97706' }}>(w_i)</span> = Points</span>
                        </div>

                        <div className="math-row">
                          <span>💰 Price:</span>
                          <span>
                            <span style={{ color: '#4f46e5', fontWeight: '600' }} title="Normalized Price Utility">{hotel.breakdown.normPrice}</span>
                            {" × "}
                            <span style={{ color: '#d97706', fontWeight: '600' }} title="User Price Weight">{weights.price}</span>
                            {" = "}
                            <strong>{hotel.breakdown.pricePts}</strong>
                          </span>
                        </div>
                        <div className="math-row">
                          <span>📍 Location:</span>
                          <span>
                            <span style={{ color: '#4f46e5', fontWeight: '600' }} title="Normalized Location Utility">{hotel.breakdown.normLoc}</span>
                            {" × "}
                            <span style={{ color: '#d97706', fontWeight: '600' }} title="User Location Weight">{weights.location}</span>
                            {" = "}
                            <strong>{hotel.breakdown.locPts}</strong>
                          </span>
                        </div>
                        <div className="math-row">
                          <span>⭐ Stars:</span>
                          <span>
                            <span style={{ color: '#4f46e5', fontWeight: '600' }} title="Normalized Stars Utility">{hotel.breakdown.normStars}</span>
                            {" × "}
                            <span style={{ color: '#d97706', fontWeight: '600' }} title="User Stars Weight">{weights.stars}</span>
                            {" = "}
                            <strong>{hotel.breakdown.starsPts}</strong>
                          </span>
                        </div>
                        <div className="math-row">
                          <span>👍 Rating:</span>
                          <span>
                            <span style={{ color: '#4f46e5', fontWeight: '600' }} title="Normalized Rating Utility">{hotel.breakdown.normRating}</span>
                            {" × "}
                            <span style={{ color: '#d97706', fontWeight: '600' }} title="User Rating Weight">{weights.rating}</span>
                            {" = "}
                            <strong>{hotel.breakdown.ratingPts}</strong>
                          </span>
                        </div>
                        <div className="math-row">
                          <span>🚇 Transport:</span>
                          <span>
                            <span style={{ color: '#4f46e5', fontWeight: '600' }} title="Normalized Transport Utility">{hotel.breakdown.normTransport}</span>
                            {" × "}
                            <span style={{ color: '#d97706', fontWeight: '600' }} title="User Transport Weight">{weights.publicTransport}</span>
                            {" = "}
                            <strong>{hotel.breakdown.transportPts}</strong>
                          </span>
                        </div>
                        <div className="math-total">
                          <span>Sum: {(Number(hotel.breakdown.pricePts) + Number(hotel.breakdown.locPts) + Number(hotel.breakdown.starsPts) + Number(hotel.breakdown.ratingPts) + Number(hotel.breakdown.transportPts)).toFixed(1)}</span>
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

