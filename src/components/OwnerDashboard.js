import React, { useState } from 'react';
import './OwnerDashboard.css';

// --- MOCK DATA ---
const SALES_DATA = {
  daily: 12500,
  dailyTrend: 15, // percentage
  monthly: 320450,
  monthlyTrend: 8,
  yearly: 2450000,
  yearlyTrend: -2,
  chart: [
    { day: 'Mon', amount: 8000 },
    { day: 'Tue', amount: 9500 },
    { day: 'Wed', amount: 11000 },
    { day: 'Thu', amount: 10500 },
    { day: 'Fri', amount: 14200 },
    { day: 'Sat', amount: 18500 },
    { day: 'Sun', amount: 12500 }
  ]
};

const FEEDBACK_DATA = [
  { id: 1, customer: 'Alice Smith', rating: 5, date: '2026-07-08', text: 'The Caramel Macchiato is the best in town! Highly recommend.' },
  { id: 2, customer: 'John Doe', rating: 4, date: '2026-07-07', text: 'Good coffee, but the avocado toast could use a bit more seasoning.' },
  { id: 3, customer: 'Maria Garcia', rating: 5, date: '2026-07-06', text: 'Amazing service and great ambiance.' },
  { id: 4, customer: 'Peter Jones', rating: 2, date: '2026-07-05', text: 'My order took way too long today, usually it is faster.' },
  { id: 5, customer: 'Sarah Connor', rating: 5, date: '2026-07-04', text: 'Blueberry muffins are to die for.' }
];

const PRODUCT_ANALYTICS = {
  best: [
    { id: 1, name: 'Caramel Macchiato', category: 'Coffee', sales: 1245 },
    { id: 2, name: 'Iced Americano', category: 'Coffee', sales: 980 },
    { id: 3, name: 'Avocado Toast', category: 'Food', sales: 850 }
  ],
  worst: [
    { id: 4, name: 'Tuna Sandwich', category: 'Food', sales: 45 },
    { id: 5, name: 'Espresso Shot', category: 'Coffee', sales: 60 },
    { id: 6, name: 'Green Tea', category: 'Tea', sales: 85 }
  ]
};
// --- END MOCK DATA ---

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

const TrendingUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);

const TrendingDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

function OwnerDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('sales'); // sales, feedback, analytics

  const renderTrend = (value) => {
    if (value > 0) {
      return <span className="metric-trend trend-up"><TrendingUpIcon /> +{value}% vs last period</span>;
    }
    return <span className="metric-trend trend-down"><TrendingDownIcon /> {value}% vs last period</span>;
  };

  const maxChartValue = Math.max(...SALES_DATA.chart.map(d => d.amount));

  return (
    <div className="owner-dashboard">
      <header className="dashboard-header">
        <h1>Owner Portal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ color: '#cbd5e1' }}>Welcome back, {user?.name || 'Owner'}</span>
          <button onClick={onLogout} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOutIcon /> Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <ChartIcon /> Sales Reports
        </button>
        <button 
          className={`nav-tab ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <StarIcon /> Customer Feedback
        </button>
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUpIcon /> Product Analytics
        </button>
        <button 
          className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          <UploadIcon /> Upload Product
        </button>
      </nav>

      {/* SALES REPORTS VIEW */}
      {activeTab === 'sales' && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">Daily Revenue</span>
              <span className="metric-value">₱{SALES_DATA.daily.toLocaleString()}</span>
              {renderTrend(SALES_DATA.dailyTrend)}
            </div>
            <div className="metric-card">
              <span className="metric-title">Monthly Revenue</span>
              <span className="metric-value">₱{SALES_DATA.monthly.toLocaleString()}</span>
              {renderTrend(SALES_DATA.monthlyTrend)}
            </div>
            <div className="metric-card">
              <span className="metric-title">Yearly Revenue</span>
              <span className="metric-value">₱{SALES_DATA.yearly.toLocaleString()}</span>
              {renderTrend(SALES_DATA.yearlyTrend)}
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">Revenue - Last 7 Days</div>
            <div className="simple-bar-chart">
              {SALES_DATA.chart.map((data, idx) => {
                const heightPercent = (data.amount / maxChartValue) * 100;
                return (
                  <div key={idx} className="bar-wrapper">
                    <div className="bar" style={{ height: `${heightPercent}%` }}>
                      <span className="bar-value">{(data.amount / 1000).toFixed(1)}k</span>
                    </div>
                    <span className="bar-label">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* CUSTOMER FEEDBACK VIEW */}
      {activeTab === 'feedback' && (
        <div className="feedback-list">
          {FEEDBACK_DATA.map(review => (
            <div key={review.id} className="feedback-card">
              <div className="feedback-header">
                <div className="customer-info">
                  <h4>{review.customer}</h4>
                  <p>{review.date}</p>
                </div>
                <div className="stars">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <div className="feedback-text">"{review.text}"</div>
            </div>
          ))}
        </div>
      )}

      {/* PRODUCT ANALYTICS VIEW */}
      {activeTab === 'analytics' && (
        <div className="analytics-grid">
          <div className="analytics-panel">
            <h2>Top 3 Best-Selling Products</h2>
            <div className="product-rank-list best">
              {PRODUCT_ANALYTICS.best.map((product, index) => (
                <div key={product.id} className="product-rank-item">
                  <div className="rank-number">#{index + 1}</div>
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <p>{product.category}</p>
                  </div>
                  <div className="sales-count">{product.sales} sold</div>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-panel">
            <h2>Top 3 Least-Selling Products</h2>
            <p style={{color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem', marginTop: '-1rem'}}>
              Items for menu review or potential replacement.
            </p>
            <div className="product-rank-list worst">
              {PRODUCT_ANALYTICS.worst.map((product, index) => (
                <div key={product.id} className="product-rank-item">
                  <div className="rank-number">#{index + 1}</div>
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <p>{product.category}</p>
                  </div>
                  <div className="sales-count">{product.sales} sold</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PRODUCT VIEW */}
      {activeTab === 'upload' && (
        <div className="upload-container">
          <h2>Upload New Product</h2>
          <form className="upload-form" onSubmit={(e) => { e.preventDefault(); alert('Product uploaded successfully!'); setActiveTab('sales'); }}>
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" placeholder="e.g. Mocha Frappuccino" required />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select required>
                <option value="">Select category...</option>
                <option value="coffee">Coffee</option>
                <option value="food">Food</option>
                <option value="tea">Tea</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (₱)</label>
              <input type="number" placeholder="e.g. 150" required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea placeholder="Describe the product..." rows="4" required></textarea>
            </div>
            <div className="form-group">
              <label>Product Image</label>
              <input type="file" accept="image/*" required />
            </div>
            <button type="submit" className="submit-product-btn">Upload Product</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
