import React from 'react';
import './Reports.scss';

const Reports = () => {
  const reportTypes = [
    { id: 1, title: 'Sales Report', description: 'Revenue and booking statistics', icon: '📊', color: 'blue' },
    { id: 2, title: 'User Analytics', description: 'User growth and engagement', icon: '👥', color: 'green' },
    { id: 3, title: 'Route Performance', description: 'Popular routes and trends', icon: '🗺️', color: 'purple' },
    { id: 4, title: 'Financial Summary', description: 'Complete financial overview', icon: '💰', color: 'orange' },
  ];

  const recentReports = [
    { id: 1, name: 'Monthly Sales Report - January 2024', date: '2024-01-31', size: '2.4 MB', format: 'PDF' },
    { id: 2, name: 'User Growth Analysis Q4 2023', date: '2024-01-15', size: '1.8 MB', format: 'Excel' },
    { id: 3, name: 'Revenue Report December 2023', date: '2024-01-05', size: '3.1 MB', format: 'PDF' },
    { id: 4, name: 'Route Performance 2023', date: '2023-12-28', size: '4.5 MB', format: 'Excel' },
  ];

  return (
    <div className="reports">
      <div className="reports__header">
        <div>
          <h1 className="reports__title">Reports & Analytics</h1>
          <p className="reports__subtitle">Generate and download business reports</p>
        </div>
      </div>

      <div className="reports__section">
        <h2 className="reports__section-title">Generate New Report</h2>
        <div className="reports__grid">
          {reportTypes.map((report) => (
            <div key={report.id} className={`reports__card reports__card--${report.color}`}>
              <div className="reports__card-icon">{report.icon}</div>
              <h3 className="reports__card-title">{report.title}</h3>
              <p className="reports__card-description">{report.description}</p>
              <div className="reports__card-form">
                <div className="reports__form-group">
                  <label className="reports__label">Date Range</label>
                  <select className="reports__select">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                    <option>Last Year</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div className="reports__form-group">
                  <label className="reports__label">Format</label>
                  <select className="reports__select">
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>
                <button className="reports__btn reports__btn--generate">
                  📥 Generate Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports__section">
        <div className="reports__section-header">
          <h2 className="reports__section-title">Recent Reports</h2>
          <button className="reports__btn reports__btn--secondary">
            📁 View All
          </button>
        </div>
        <div className="reports__list">
          {recentReports.map((report) => (
            <div key={report.id} className="reports__item">
              <div className="reports__item-icon">
                {report.format === 'PDF' ? '📄' : '📊'}
              </div>
              <div className="reports__item-content">
                <div className="reports__item-name">{report.name}</div>
                <div className="reports__item-meta">
                  Generated on {report.date} • {report.size} • {report.format}
                </div>
              </div>
              <div className="reports__item-actions">
                <button className="reports__action-btn">👁️ View</button>
                <button className="reports__action-btn">📥 Download</button>
                <button className="reports__action-btn">🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="reports__section">
        <h2 className="reports__section-title">Quick Stats</h2>
        <div className="reports__stats">
          <div className="reports__stat">
            <div className="reports__stat-icon">📈</div>
            <div className="reports__stat-content">
              <div className="reports__stat-value">+24.5%</div>
              <div className="reports__stat-label">Revenue Growth</div>
            </div>
          </div>
          <div className="reports__stat">
            <div className="reports__stat-icon">🎫</div>
            <div className="reports__stat-content">
              <div className="reports__stat-value">12,456</div>
              <div className="reports__stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="reports__stat">
            <div className="reports__stat-icon">⭐</div>
            <div className="reports__stat-content">
              <div className="reports__stat-value">4.8/5.0</div>
              <div className="reports__stat-label">Average Rating</div>
            </div>
          </div>
          <div className="reports__stat">
            <div className="reports__stat-icon">🚌</div>
            <div className="reports__stat-content">
              <div className="reports__stat-value">89%</div>
              <div className="reports__stat-label">Fleet Utilization</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
