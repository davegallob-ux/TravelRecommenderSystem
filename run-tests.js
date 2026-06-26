import assert from 'assert';
import { calculateMaut, filterConstraints, normalizeAbsolute, normalizeRelativeCost } from './src/recommenderEngine.js';

// Mock dataset for testing
const testHotels = [
  { id: 'h1', name: 'Alpha', price: 100, location: 1.0, stars: 3, rating: 8.0, publicTransport: 7.0, city: 'vienna' },
  { id: 'h2', name: 'Beta', price: 200, location: 2.0, stars: 4, rating: 9.0, publicTransport: 8.0, city: 'vienna' },
  { id: 'h3', name: 'Gamma', price: 300, location: 3.0, stars: 5, rating: 10.0, publicTransport: 9.0, city: 'vienna' },
  { id: 'h4', name: 'Delta', price: 400, location: 4.0, stars: 2, rating: 6.0, publicTransport: 5.0, city: 'vienna' },
  { id: 'h5', name: 'Epsilon', price: 500, location: 5.0, stars: 1, rating: 5.0, publicTransport: 3.0, city: 'vienna' },
];

let mautPassed = 0;
let filterPassed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    return true;
  } catch (err) {
    console.error(`  ✗ ${name} FAILED!`);
    console.error(err);
    return false;
  }
}

console.log('================================================');
console.log('RUNNING ALGORITHM TEST SUITE (60 TEST CASES)');
console.log('================================================\n');

// ==========================================
// SECTION 1: MAUT TESTS (30 CASES)
// ==========================================
console.log('--- SECTION 1: WEIGHTED MAUT LOGIC TESTS ---');

// 1. Weight boundaries
if (runTest('MAUT 1: Equal weights yield equal ranking criteria', () => {
  const weights = { price: 5, location: 5, stars: 5, rating: 5, publicTransport: 5 };
  const res = calculateMaut(testHotels, weights);
  assert.strictEqual(res.length, 5);
})) mautPassed++;

if (runTest('MAUT 2: Zero weights are clamped/handled without division by zero', () => {
  const weights = { price: 0, location: 0, stars: 0, rating: 0, publicTransport: 0 };
  const res = calculateMaut(testHotels, weights);
  assert.strictEqual(res.length, 5);
  // Total weight defaults to 1, matches should not crash
})) mautPassed++;

if (runTest('MAUT 3: Over-limit weights (>10) are clamped to 10', () => {
  const weights = { price: 20, location: 15, stars: 10, rating: 5, publicTransport: 5 };
  const resClamped = calculateMaut(testHotels, weights);
  const resNormal = calculateMaut(testHotels, { price: 10, location: 10, stars: 10, rating: 5, publicTransport: 5 });
  assert.strictEqual(resClamped[0].matchScore, resNormal[0].matchScore);
})) mautPassed++;

if (runTest('MAUT 4: Negative weights are clamped to 0', () => {
  const weights = { price: -5, location: 5, stars: 5, rating: 5, publicTransport: 5 };
  const res = calculateMaut(testHotels, weights);
  assert.strictEqual(res[0].breakdown.totalWeight, '20.0'); // 0 + 5 + 5 + 5 + 5
})) mautPassed++;

if (runTest('MAUT 5: Single active weight evaluates correctly', () => {
  const weights = { price: 10, location: 0, stars: 0, rating: 0, publicTransport: 0 };
  const res = calculateMaut(testHotels, weights);
  assert.strictEqual(res[0].id, 'h1'); // Alpha is cheapest ($100), should score 100%
  assert.strictEqual(res[0].matchScore, 100);
})) mautPassed++;

// 2. Price normalization
if (runTest('MAUT 6: Price relative cost formula: cheapest hotel has utility 1.0', () => {
  const minPrice = 100;
  const maxPrice = 500;
  const utility = normalizeRelativeCost(100, minPrice, maxPrice);
  assert.strictEqual(utility, 1);
})) mautPassed++;

if (runTest('MAUT 7: Price relative cost formula: most expensive hotel has utility 0.0', () => {
  const minPrice = 100;
  const maxPrice = 500;
  const utility = normalizeRelativeCost(500, minPrice, maxPrice);
  assert.strictEqual(utility, 0);
})) mautPassed++;

if (runTest('MAUT 8: Price relative cost formula: mid-price hotel ($300) has utility 0.5', () => {
  const minPrice = 100;
  const maxPrice = 500;
  const utility = normalizeRelativeCost(300, minPrice, maxPrice);
  assert.strictEqual(utility, 0.5);
})) mautPassed++;

if (runTest('MAUT 9: Division by zero avoided in price normalization when min equals max', () => {
  const utility = normalizeRelativeCost(100, 100, 100);
  assert.strictEqual(utility, 1);
})) mautPassed++;

if (runTest('MAUT 10: Clamping handles values out of price bounds', () => {
  const utility = normalizeRelativeCost(50, 100, 500); // price below min
  assert.strictEqual(utility, 1); // should clamp to max utility (1.0)
})) mautPassed++;

// 3. Distance normalization
if (runTest('MAUT 11: Distance relative cost formula: closest hotel (1.0km) has utility 1.0', () => {
  const minLoc = 1.0;
  const maxLoc = 5.0;
  const utility = normalizeRelativeCost(1.0, minLoc, maxLoc);
  assert.strictEqual(utility, 1);
})) mautPassed++;

if (runTest('MAUT 12: Distance relative cost formula: furthest hotel (5.0km) has utility 0.0', () => {
  const minLoc = 1.0;
  const maxLoc = 5.0;
  const utility = normalizeRelativeCost(5.0, minLoc, maxLoc);
  assert.strictEqual(utility, 0);
})) mautPassed++;

if (runTest('MAUT 13: Distance relative cost formula: mid-distance (3.0km) has utility 0.5', () => {
  const minLoc = 1.0;
  const maxLoc = 5.0;
  const utility = normalizeRelativeCost(3.0, minLoc, maxLoc);
  assert.strictEqual(utility, 0.5);
})) mautPassed++;

if (runTest('MAUT 14: Division by zero avoided in distance normalization when min equals max', () => {
  const utility = normalizeRelativeCost(2.5, 2.5, 2.5);
  assert.strictEqual(utility, 1);
})) mautPassed++;

if (runTest('MAUT 15: Distance out of bounds clamped safely', () => {
  const utility = normalizeRelativeCost(6.0, 1.0, 5.0); // distance above max
  assert.strictEqual(utility, 0); // should clamp to min utility (0.0)
})) mautPassed++;

// 4. Absolute benefit normalizations
if (runTest('MAUT 16: Star absolute benefit formula: 5 stars yields utility 1.0', () => {
  const utility = normalizeAbsolute(5, 1, 5);
  assert.strictEqual(utility, 1);
})) mautPassed++;

if (runTest('MAUT 17: Star absolute benefit formula: 1 star yields utility 0.0', () => {
  const utility = normalizeAbsolute(1, 1, 5);
  assert.strictEqual(utility, 0);
})) mautPassed++;

if (runTest('MAUT 18: Star absolute benefit formula: 3 stars yields utility 0.5', () => {
  const utility = normalizeAbsolute(3, 1, 5);
  assert.strictEqual(utility, 0.5);
})) mautPassed++;

if (runTest('MAUT 19: Rating absolute benefit formula: 10/10 rating yields utility 1.0', () => {
  const utility = normalizeAbsolute(10, 1, 10);
  assert.strictEqual(utility, 1);
})) mautPassed++;

if (runTest('MAUT 20: Transit absolute benefit formula: 5.5/10 transit yields utility 0.5', () => {
  const utility = normalizeAbsolute(5.5, 1, 10);
  assert.strictEqual(utility, 0.5);
})) mautPassed++;

// 5. Weight scaling comparison
if (runTest('MAUT 21: Highly weighted attribute dominates ranking', () => {
  const weights = { price: 10, location: 0, stars: 0, rating: 0, publicTransport: 0 };
  const res = calculateMaut(testHotels, weights);
  assert.strictEqual(res[0].id, 'h1'); // Alpha is cheapest ($100)
})) mautPassed++;

if (runTest('MAUT 22: Changing weight flips ranking to fit user preferences', () => {
  const weightsStars = { price: 0, location: 0, stars: 10, rating: 0, publicTransport: 0 };
  const res = calculateMaut(testHotels, weightsStars);
  assert.strictEqual(res[0].id, 'h3'); // Gamma has 5 stars, should be first
})) mautPassed++;

if (runTest('MAUT 23: Ratings weight forces high rating hotel to the top', () => {
  const weightsRating = { price: 0, location: 0, stars: 0, rating: 10, publicTransport: 0 };
  const res = calculateMaut(testHotels, weightsRating);
  assert.strictEqual(res[0].id, 'h3'); // Gamma has 10.0 review rating
})) mautPassed++;

if (runTest('MAUT 24: Transit weight forces high transit access hotel to the top', () => {
  const weightsTransit = { price: 0, location: 0, stars: 0, rating: 0, publicTransport: 10 };
  const res = calculateMaut(testHotels, weightsTransit);
  assert.strictEqual(res[0].id, 'h3'); // Gamma has 9.0 transit score
})) mautPassed++;

if (runTest('MAUT 25: Balanced weights result in overall optimal hotel scoring highest', () => {
  const weights = { price: 5, location: 5, stars: 5, rating: 5, publicTransport: 5 };
  const res = calculateMaut(testHotels, weights);
  assert.ok(res[0].matchScore > 50); // Best overall should have high utility
})) mautPassed++;

// 6. Edge cases
if (runTest('MAUT 26: Empty list of hotels handles cleanly and returns empty list', () => {
  const res = calculateMaut([], { price: 5 });
  assert.strictEqual(res.length, 0);
})) mautPassed++;

if (runTest('MAUT 27: Null dataset returns empty list safely', () => {
  const res = calculateMaut(null, { price: 5 });
  assert.strictEqual(res.length, 0);
})) mautPassed++;

if (runTest('MAUT 28: Missing weight keys default to 5 in calculation', () => {
  const resMissing = calculateMaut(testHotels, {});
  const resDefault = calculateMaut(testHotels, { price: 5, location: 5, stars: 5, rating: 5, publicTransport: 5 });
  assert.strictEqual(resMissing[0].matchScore, resDefault[0].matchScore);
})) mautPassed++;

if (runTest('MAUT 29: Sorting order: matchScore is strictly descending', () => {
  const res = calculateMaut(testHotels, { price: 8, location: 4 });
  for (let i = 0; i < res.length - 1; i++) {
    assert.ok(res[i].matchScore >= res[i + 1].matchScore);
  }
})) mautPassed++;

if (runTest('MAUT 30: Breakdown scores are correctly formatted string outputs', () => {
  const res = calculateMaut(testHotels, { price: 5 });
  assert.strictEqual(typeof res[0].breakdown.normPrice, 'string');
  assert.strictEqual(typeof res[0].breakdown.pricePts, 'string');
})) mautPassed++;


// ==========================================
// SECTION 2: FILTERING TESTS (30 CASES)
// ==========================================
console.log('\n--- SECTION 2: CONSTRAINT-GUIDED FILTERING TESTS ---');

// 1. Price filters (1-5)
if (runTest('Filter 1: Strict price limit excludes expensive hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 150, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].id, 'h1');
})) filterPassed++;

if (runTest('Filter 2: Inclusive price limit includes exactly matching price', () => {
  const res = filterConstraints(testHotels, { maxPrice: 300, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 3); // h1, h2, h3
})) filterPassed++;

if (runTest('Filter 3: Extremely tight price filter returns empty list', () => {
  const res = filterConstraints(testHotels, { maxPrice: 50, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 4: Extremely loose price filter includes all hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 1000, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 5);
})) filterPassed++;

if (runTest('Filter 5: Price constraint defaults properly if omitted', () => {
  const res = filterConstraints(testHotels, { maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 }); // maxPrice missing
  assert.strictEqual(res.length, 3); // maxPrice defaults to 300
})) filterPassed++;

// 2. Distance filters (6-10)
if (runTest('Filter 6: Location distance limit filters out far hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 2.5, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 2); // h1 (1.0km), h2 (2.0km)
})) filterPassed++;

if (runTest('Filter 7: Distance exact boundary checks work correctly', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 3.0, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 3); // h1, h2, h3
})) filterPassed++;

if (runTest('Filter 8: Tight distance filter returns empty list', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 0.5, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 9: Loose distance limit contains all hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10.0, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 5);
})) filterPassed++;

if (runTest('Filter 10: Distance constraint defaults properly if omitted', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, minStars: 1, minRating: 1, minTransport: 1 }); // maxLocation missing
  assert.strictEqual(res.length, 5); // maxLocation defaults to 10
})) filterPassed++;

// 3. Stars filters (11-15)
if (runTest('Filter 11: Minimum stars filter eliminates low star hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 4, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 2); // h2 (4 stars), h3 (5 stars)
})) filterPassed++;

if (runTest('Filter 12: Stars exact boundary checks include exact match', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 3, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 3); // h1 (3), h2 (4), h3 (5)
})) filterPassed++;

if (runTest('Filter 13: Extremely high star filter returns empty list (no 6-star hotels)', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 6, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 14: Star filter set to 1 contains all hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 });
  assert.strictEqual(res.length, 5);
})) filterPassed++;

if (runTest('Filter 15: Stars constraint defaults properly if omitted', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minRating: 1, minTransport: 1 }); // minStars missing
  assert.strictEqual(res.length, 3); // minStars defaults to 3 (h1, h2, h3)
})) filterPassed++;

// 4. Rating filters (16-20)
if (runTest('Filter 16: Minimum rating filter eliminates lower rating hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 8.5, minTransport: 1 });
  assert.strictEqual(res.length, 2); // h2 (9.0), h3 (10.0)
})) filterPassed++;

if (runTest('Filter 17: Rating exact boundary checks work correctly', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 8.0, minTransport: 1 });
  assert.strictEqual(res.length, 3); // h1 (8), h2 (9), h3 (10)
})) filterPassed++;

if (runTest('Filter 18: Rating constraint set to 10.0 filter isolates best hotel only', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 10.0, minTransport: 1 });
  assert.strictEqual(res.length, 1);
  assert.strictEqual(res[0].id, 'h3');
})) filterPassed++;

if (runTest('Filter 19: Extremely high rating limit (11/10) yields empty list', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 11.0, minTransport: 1 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 20: Rating constraint defaults properly if omitted', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minTransport: 1 }); // minRating missing
  assert.strictEqual(res.length, 3); // minRating defaults to 7 (h1, h2, h3)
})) filterPassed++;

// 5. Public Transport filters (21-25)
if (runTest('Filter 21: Minimum transport filter eliminates poorly connected hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 7.5 });
  assert.strictEqual(res.length, 2); // h2 (8.0), h3 (9.0)
})) filterPassed++;

if (runTest('Filter 22: Transport exact boundary checks work correctly', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 7.0 });
  assert.strictEqual(res.length, 3); // h1 (7.0), h2 (8.0), h3 (9.0)
})) filterPassed++;

if (runTest('Filter 23: Highly restrictive transport filter (9.5/10) yields empty list', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 9.5 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 24: Low transport filter (3.0) includes all hotels', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 3.0 });
  assert.strictEqual(res.length, 5);
})) filterPassed++;

if (runTest('Filter 25: Public Transport constraint defaults properly if omitted', () => {
  const res = filterConstraints(testHotels, { maxPrice: 600, maxLocation: 10, minStars: 1, minRating: 1 }); // minTransport missing
  assert.strictEqual(res.length, 4); // minTransport defaults to 5 (h1, h2, h3, h4)
})) filterPassed++;

// 6. Conjunction combinations & edge cases (26-30)
if (runTest('Filter 26: Combined constraints work conjunctively (non-compensatory)', () => {
  const res = filterConstraints(testHotels, { maxPrice: 250, maxLocation: 2.5, minStars: 3, minRating: 8.0, minTransport: 6.0 });
  assert.strictEqual(res.length, 2); // h1, h2 satisfy all
})) filterPassed++;

if (runTest('Filter 27: Compensatory failure: high rating cannot compensate for price boundary violation', () => {
  // h3 has stars=5, rating=10, transport=9 (perfect!), but price is $300 (above $250 limit)
  const res = filterConstraints(testHotels, { maxPrice: 250, maxLocation: 10, minStars: 1, minRating: 1, minTransport: 1 });
  const h3InResults = res.some(h => h.id === 'h3');
  assert.strictEqual(h3InResults, false); // should be filtered out
})) filterPassed++;

if (runTest('Filter 28: Empty hotel list returns empty list', () => {
  const res = filterConstraints([], { maxPrice: 600 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 29: Null hotel list returns empty list', () => {
  const res = filterConstraints(null, { maxPrice: 600 });
  assert.strictEqual(res.length, 0);
})) filterPassed++;

if (runTest('Filter 30: Empty constraint object defaults all properties', () => {
  const res = filterConstraints(testHotels, {});
  assert.strictEqual(res.length, 3); // h1, h2, h3 satisfy all default thresholds
})) filterPassed++;

console.log('\n================================================');
console.log(`TEST EXECUTION SUMMARY:`);
console.log(`  Weighted MAUT:          ${mautPassed} / 30 passed`);
console.log(`  Constraint Filtering:   ${filterPassed} / 30 passed`);
console.log(`  Total Passed:           ${mautPassed + filterPassed} / 60`);
console.log('================================================');

if (mautPassed === 30 && filterPassed === 30) {
  console.log('\n🌟 ALL 60 TEST CASES PASSED SUCCESSFULLY! 🌟\n');
  process.exit(0);
} else {
  console.error('\n❌ SOME TEST CASES FAILED! ❌\n');
  process.exit(1);
}
