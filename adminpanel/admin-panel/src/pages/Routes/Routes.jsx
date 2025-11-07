import React from 'react';
import './Routes.scss';

const Routess = () => {
  const routes = [
    { id: 1, from: 'Mumbai', to: 'Pune', distance: '150 km', duration: '3h 30m', buses: 12, status: 'active' },
    { id: 2, from: 'Delhi', to: 'Jaipur', distance: '280 km', duration: '5h 15m', buses: 8, status: 'active' },
    { id: 3, from: 'Bangalore', to: 'Chennai', distance: '350 km', duration: '6h 45m', buses: 15, status: 'active' },
    { id: 4, from: 'Hyderabad', to: 'Vizag', distance: '620 km', duration: '10h 30m', buses: 6, status: 'active' },
    { id: 5, from: 'Kolkata', to: 'Bhubaneswar', distance: '450 km', duration: '8h 20m', buses: 4, status: 'inactive' },
    { id: 6, from: 'Ahmedabad', to: 'Udaipur', distance: '260 km', duration: '5h 0m', buses: 10, status: 'active' },
  ];

  return (
    <div className="routes">
      <div className="routes__header">
        <div>
          <h1 className="routes__title">Route Management</h1>
          <p className="routes__subtitle">Manage bus routes and schedules</p>
        </div>
        <button className="routes__btn routes__btn--primary">
          ➕ Add New Route
        </button>
      </div>

      <div className="routes__grid">
        {routes.map((route) => (
          <div key={route.id} className="routes__card">
            <div className="routes__card-header">
              <span className={`routes__status routes__status--${route.status}`}>
                {route.status}
              </span>
            </div>
            <div className="routes__route-visual">
              <div className="routes__location">
                <div className="routes__location-icon">📍</div>
                <div className="routes__location-name">{route.from}</div>
              </div>
              <div className="routes__arrow">
                <div className="routes__line"></div>
                <div className="routes__arrow-icon">→</div>
              </div>
              <div className="routes__location">
                <div className="routes__location-icon">📍</div>
                <div className="routes__location-name">{route.to}</div>
              </div>
            </div>
            <div className="routes__info">
              <div className="routes__info-item">
                <div className="routes__info-icon">📏</div>
                <div className="routes__info-content">
                  <div className="routes__info-label">Distance</div>
                  <div className="routes__info-value">{route.distance}</div>
                </div>
              </div>
              <div className="routes__info-item">
                <div className="routes__info-icon">⏱️</div>
                <div className="routes__info-content">
                  <div className="routes__info-label">Duration</div>
                  <div className="routes__info-value">{route.duration}</div>
                </div>
              </div>
              <div className="routes__info-item">
                <div className="routes__info-icon">🚌</div>
                <div className="routes__info-content">
                  <div className="routes__info-label">Buses</div>
                  <div className="routes__info-value">{route.buses}</div>
                </div>
              </div>
            </div>
            <div className="routes__actions">
              <button className="routes__action-btn routes__action-btn--edit">
                ✏️ Edit
              </button>
              <button className="routes__action-btn routes__action-btn--delete">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Routess;
