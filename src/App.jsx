import { useState, useMemo } from 'react';
import { hotels } from './data';
import './index.css';

function App() {
  const [city, setCity] = useState('vienna');
  
  // Weights (0 to 100)
  const [weights, setWeights] = useState({
    price: 50,
    location: 50,
    stars: 50,
    rating: 50,
    publicTransport: 50,
  });

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

      // Calculate weighted score
      // NOTE: Using fixed weights (50% each) for now as requested
      const fixedWeights = { price: 50, location: 50, stars: 50, rating: 50, publicTransport: 50 };
      
      const totalWeight = fixedWeights.price + fixedWeights.location + fixedWeights.stars + fixedWeights.rating + fixedWeights.publicTransport || 1; 
      
      const rawScore = 
        (fixedWeights.price * normPrice) + 
        (fixedWeights.location * normLoc) + 
        (fixedWeights.stars * normStars) + 
        (fixedWeights.rating * normRating) +
        (fixedWeights.publicTransport * normTransport);
        
      const percentageScore = (rawScore / totalWeight) * 100;

      return {
        ...hotel,
        matchScore: Math.round(percentageScore)
      };
    });

    // Sort by match score descending
    return scored.sort((a, b) => b.matchScore - a.matchScore);

  }, [city, weights]);

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

{/* Transparency panel hidden for now */}
{/* 
        <div className="glass-panel" style={{ background: 'rgba(238, 242, 255, 0.8)', border: '1px solid #c7d2fe' }}>
          <h3>🔍 Transparency: How is your score calculated?</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#4338ca' }}>
            In accordance with the EU Digital Services Act (DSA), we believe in transparent algorithms. Here's exactly how the system works behind the scenes:
          </p>
          <ul style={{ fontSize: '0.85rem', color: '#4f46e5', paddingLeft: '1.5rem', marginBottom: '0' }}>
            <li><strong>Normalization:</strong> For each metric (Price, Location, etc.), we look at all available hotels in the chosen city. We mathematically map the worst option to a score of <strong>0</strong> and the best option to <strong>1</strong>.</li>
            <li><strong>Weighting:</strong> The sliders you move below represent the "Weights". If you set Price to 100% and Stars to 0%, the algorithm ignores the star rating entirely.</li>
            <li><strong>Calculation:</strong> For every hotel, we multiply its normalized score (0-1) by your chosen weight for that category. We sum these values up, and then divide by the total sum of all your weights.</li>
            <li><strong>Result:</strong> This outputs a final "Percentage Match" that directly reflects your stated priorities, allowing you total control over the recommendation algorithm!</li>
          </ul>
        </div>
*/}

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

          <div className="controls-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            <div className="control-group">
              <div className="control-header">
                <label className="control-label">💰 Price Importance</label>
                <span className="control-value">{weights.price}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weights.price} 
                onChange={(e) => handleWeightChange('price', e.target.value)} 
              />
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means cheaper price is more important.</p>
            </div>

            <div className="control-group">
              <div className="control-header">
                <label className="control-label">📍 Location Importance</label>
                <span className="control-value">{weights.location}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weights.location} 
                onChange={(e) => handleWeightChange('location', e.target.value)} 
              />
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means closer to center is more important.</p>
            </div>

            <div className="control-group">
              <div className="control-header">
                <label className="control-label">⭐ Hotel Stars Importance</label>
                <span className="control-value">{weights.stars}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weights.stars} 
                onChange={(e) => handleWeightChange('stars', e.target.value)} 
              />
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means more stars (luxury) is important.</p>
            </div>

            <div className="control-group">
              <div className="control-header">
                <label className="control-label">👍 User Rating Importance</label>
                <span className="control-value">{weights.rating}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weights.rating} 
                onChange={(e) => handleWeightChange('rating', e.target.value)} 
              />
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Higher means better guest reviews are important.</p>
            </div>

            <div className="control-group">
              <div className="control-header">
                <label className="control-label">🚇 Public Transport</label>
                <span className="control-value">{weights.publicTransport}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weights.publicTransport} 
                onChange={(e) => handleWeightChange('publicTransport', e.target.value)} 
              />
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
        </div>

        <h2>Recommended Hotels</h2>
        
        <div className="results-grid">
          {recommendedHotels.map((hotel, index) => (
            <div key={hotel.id} className="hotel-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="hotel-score">
                🎯 {hotel.matchScore}% Match
              </div>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
