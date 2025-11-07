import React, { useState } from 'react';
import './Buses.scss';

const Buses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const buses = [
    { id: 1, number: 'MH-12-AB-1234', name: 'Volvo Express', type: 'AC Sleeper', capacity: 40, status: 'active', operator: 'RedBus Travels' },
    { id: 2, number: 'MH-14-CD-5678', name: 'Mercedes Luxury', type: 'AC Seater', capacity: 45, status: 'active', operator: 'FastTrack Tours' },
    { id: 3, number: 'DL-01-EF-9012', name: 'Scania Premium', type: 'AC Sleeper', capacity: 36, status: 'maintenance', operator: 'SafeJourney' },
    { id: 4, number: 'KA-03-GH-3456', name: 'Tata Starbus', type: 'Non-AC Seater', capacity: 50, status: 'active', operator: 'BusWorld' },
    { id: 5, number: 'TN-07-IJ-7890', name: 'Ashok Leyland', type: 'AC Seater', capacity: 48, status: 'inactive', operator: 'QuickRide' },
    { id: 6, number: 'GJ-05-KL-2345', name: 'Volvo Multi-Axle', type: 'AC Sleeper', capacity: 42, status: 'active', operator: 'ComfortLine' },
  ];

  return (
    <div className="buses">
      <div className="buses__header">
        <div>
          <h1 className="buses__title">Bus Management</h1>
          <p className="buses__subtitle">Manage your fleet of buses</p>
        </div>
        <button className="buses__btn buses__btn--primary">
          ➕ Add New Bus
        </button>
      </div>

      <div className="buses__filters">
        <div className="buses__search">
          <span className="buses__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by bus number, name, or operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="buses__search-input"
          />
        </div>
        <div className="buses__filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="buses__select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="buses__btn buses__btn--secondary">
            📊 Export
          </button>
        </div>
      </div>

      <div className="buses__grid">
        {buses.map((bus) => (
          <div key={bus.id} className="buses__card">
            <div className="buses__card-header">
              <div className="buses__card-icon">🚌</div>
              <span className={`buses__status buses__status--${bus.status}`}>
                {bus.status}
              </span>
            </div>
            <div className="buses__card-body">
              <h3 className="buses__bus-name">{bus.name}</h3>
              <div className="buses__bus-number">{bus.number}</div>
              <div className="buses__details">
                <div className="buses__detail">
                  <span className="buses__detail-label">Type:</span>
                  <span className="buses__detail-value">{bus.type}</span>
                </div>
                <div className="buses__detail">
                  <span className="buses__detail-label">Capacity:</span>
                  <span className="buses__detail-value">{bus.capacity} seats</span>
                </div>
                <div className="buses__detail">
                  <span className="buses__detail-label">Operator:</span>
                  <span className="buses__detail-value">{bus.operator}</span>
                </div>
              </div>
            </div>
            <div className="buses__card-footer">
              <button className="buses__action-btn buses__action-btn--edit">
                ✏️ Edit
              </button>
              <button className="buses__action-btn buses__action-btn--view">
                👁️ View
              </button>
              <button className="buses__action-btn buses__action-btn--delete">
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Buses;
