import React, { useState } from 'react';
import './StockVolatilityCalculator.css';

const StockVolatilityCalculator = () => {
  const [prices, setPrices] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const calculateVolatility = () => {
    setError('');
    setResults(null);

    // Parse prices from input
    const priceArray = prices
      .split(/[\n,\s]+/)
      .map(p => p.trim())
      .filter(p => p !== '')
      .map(p => parseFloat(p));

    // Validation
    if (priceArray.length < 2) {
      setError('Please enter at least 2 price values');
      return;
    }

    if (priceArray.some(p => isNaN(p) || p <= 0)) {
      setError('All prices must be valid positive numbers');
      return;
    }

    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < priceArray.length; i++) {
      const dailyReturn = (priceArray[i] - priceArray[i - 1]) / priceArray[i - 1];
      returns.push(dailyReturn);
    }

    // Calculate mean return
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

    // Calculate variance
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;

    // Calculate standard deviation (volatility)
    const dailyVolatility = Math.sqrt(variance);

    // Annualize volatility (assuming 252 trading days per year)
    const annualizedVolatility = dailyVolatility * Math.sqrt(252);

    // Calculate additional metrics
    const minPrice = Math.min(...priceArray);
    const maxPrice = Math.max(...priceArray);
    const avgPrice = priceArray.reduce((sum, p) => sum + p, 0) / priceArray.length;
    const totalReturn = ((priceArray[priceArray.length - 1] - priceArray[0]) / priceArray[0]) * 100;

    setResults({
      dataPoints: priceArray.length,
      dailyVolatility: (dailyVolatility * 100).toFixed(4),
      annualizedVolatility: (annualizedVolatility * 100).toFixed(4),
      meanReturn: (meanReturn * 100).toFixed(4),
      minPrice: minPrice.toFixed(2),
      maxPrice: maxPrice.toFixed(2),
      avgPrice: avgPrice.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      priceRange: (maxPrice - minPrice).toFixed(2)
    });
  };

  const clearInputs = () => {
    setPrices('');
    setResults(null);
    setError('');
  };

  const loadSampleData = () => {
    const samplePrices = [
      100, 102, 101, 103, 105, 104, 106, 108, 107, 109,
      111, 110, 112, 114, 113, 115, 117, 116, 118, 120,
      119, 121, 123, 122, 124, 126, 125, 127, 129, 128
    ];
    setPrices(samplePrices.join('\n'));
  };

  return (
    <div className="volatility-calculator">
      <div className="calculator-header">
        <h1>Stock Volatility Calculator</h1>
        <p className="subtitle">Calculate historical volatility from stock price data</p>
      </div>

      <div className="calculator-container">
        <div className="input-section">
          <h2>Input Stock Prices</h2>
          <p className="instruction">
            Enter historical stock prices (one per line or separated by commas/spaces)
          </p>

          <textarea
            className="price-input"
            value={prices}
            onChange={(e) => setPrices(e.target.value)}
            placeholder="100&#10;102&#10;101&#10;103&#10;105&#10;..."
            rows={15}
          />

          <div className="button-group">
            <button className="btn btn-primary" onClick={calculateVolatility}>
              Calculate Volatility
            </button>
            <button className="btn btn-secondary" onClick={loadSampleData}>
              Load Sample Data
            </button>
            <button className="btn btn-tertiary" onClick={clearInputs}>
              Clear
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>

        {results && (
          <div className="results-section">
            <h2>Volatility Results</h2>

            <div className="results-grid">
              <div className="result-card highlight">
                <div className="result-label">Daily Volatility</div>
                <div className="result-value">{results.dailyVolatility}%</div>
              </div>

              <div className="result-card highlight">
                <div className="result-label">Annualized Volatility</div>
                <div className="result-value">{results.annualizedVolatility}%</div>
              </div>

              <div className="result-card">
                <div className="result-label">Mean Daily Return</div>
                <div className="result-value">{results.meanReturn}%</div>
              </div>

              <div className="result-card">
                <div className="result-label">Total Return</div>
                <div className="result-value">{results.totalReturn}%</div>
              </div>

              <div className="result-card">
                <div className="result-label">Data Points</div>
                <div className="result-value">{results.dataPoints}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Average Price</div>
                <div className="result-value">${results.avgPrice}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Min Price</div>
                <div className="result-value">${results.minPrice}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Max Price</div>
                <div className="result-value">${results.maxPrice}</div>
              </div>

              <div className="result-card">
                <div className="result-label">Price Range</div>
                <div className="result-value">${results.priceRange}</div>
              </div>
            </div>

            <div className="info-box">
              <h3>Understanding Volatility</h3>
              <ul>
                <li><strong>Daily Volatility:</strong> Standard deviation of daily returns</li>
                <li><strong>Annualized Volatility:</strong> Daily volatility scaled to annual terms (×√252)</li>
                <li><strong>Higher volatility:</strong> Greater price fluctuations and risk</li>
                <li><strong>Lower volatility:</strong> More stable price movements</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="methodology-section">
        <h3>Calculation Methodology</h3>
        <div className="methodology-content">
          <p><strong>1. Daily Returns:</strong> R<sub>t</sub> = (P<sub>t</sub> - P<sub>t-1</sub>) / P<sub>t-1</sub></p>
          <p><strong>2. Mean Return:</strong> μ = Σ R<sub>t</sub> / n</p>
          <p><strong>3. Variance:</strong> σ² = Σ (R<sub>t</sub> - μ)² / n</p>
          <p><strong>4. Daily Volatility:</strong> σ<sub>daily</sub> = √(σ²)</p>
          <p><strong>5. Annualized Volatility:</strong> σ<sub>annual</sub> = σ<sub>daily</sub> × √252</p>
        </div>
      </div>
    </div>
  );
};

export default StockVolatilityCalculator;
