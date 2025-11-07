import React from 'react';
import './Trips.scss';

const Trips = () => {
  const trips = [
    { id: 1, route: 'Mumbai - Pune', bus: 'Volvo Express', date: '2024-01-20', time: '08:00 AM', seats: '35/40', price: '₹450', status: 'scheduled' },
    { id: 2, route: 'Delhi - Jaipur', bus: 'Mercedes Luxury', date: '2024-01-20', time: '10:30 AM', seats: '28/45', price: '₹650', status: 'scheduled' },
    { id: 3, route: 'Bangalore - Chennai', bus: 'Scania Premium', date: '2024-01-20', time: '11:00 PM', seats: '30/36', price: '₹750', status: 'running' },
    { id: 4, route: 'Hyderabad - Vizag', bus: 'Tata Starbus', date: '2024-01-19', time: '09:00 PM', seats: '50/50', price: '₹550', status: 'completed' },
    { id: 5, route: 'Kolkata - Bhubaneswar', bus: 'Ashok Leyland', date: '2024-01-21', time: '07:00 AM', seats: '42/48', price: '₹500', status: 'scheduled' },
    { id: 6, route: 'Ahmedabad - Udaipur', bus: 'Volvo Multi-Axle', date: '2024-01-20', time: '06:30 PM', seats: '0/42', price: '₹600', status: 'cancelled' },
  ];

  return (
    <div className="trips">
      <div className="trips__header">
        <div>
          <h1 className="trips__title">Trip Management</h1>
          <p className="trips__subtitle">Schedule and manage bus trips</p>
        </div>
        <button className="trips__btn trips__btn--primary">
          ➕ Schedule New Trip
        </button>
      </div>

      <div className="trips__filters">
        <button className="trips__filter-btn trips__filter-btn--active">All Trips</button>
        <button className="trips__filter-btn">Scheduled</button>
        <button className="trips__filter-btn">Running</button>
        <button className="trips__filter-btn">Completed</button>
        <button className="trips__filter-btn">Cancelled</button>
      </div>

      <div className="trips__list">
        {trips.map((trip) => (
          <div key={trip.id} className="trips__card">
            <div className="trips__card-left">
              <div className="trips__route">
                <div className="trips__route-icon">🗺️</div>
                <div className="trips__route-info">
                  <div className="trips__route-name">{trip.route}</div>
                  <div className="trips__bus-name">{trip.bus}</div>
                </div>
              </div>
            </div>
            <div className="trips__card-center">
              <div className="trips__info-grid">
                <div className="trips__info-item">
                  <div className="trips__info-label">📅 Date</div>
                  <div className="trips__info-value">{trip.date}</div>
                </div>
                <div className="trips__info-item">
                  <div className="trips__info-label">🕐 Time</div>
                  <div className="trips__info-value">{trip.time}</div>
                </div>
                <div className="trips__info-item">
                  <div className="trips__info-label">💺 Seats</div>
                  <div className="trips__info-value">{trip.seats}</div>
                </div>
                <div className="trips__info-item">
                  <div className="trips__info-label">💰 Price</div>
                  <div className="trips__info-value">{trip.price}</div>
                </div>
              </div>
            </div>
            <div className="trips__card-right">
              <span className={`trips__status trips__status--${trip.status}`}>
                {trip.status}
              </span>
              <div className="trips__actions">
                <button className="trips__action-btn">✏️</button>
                <button className="trips__action-btn">👁️</button>
                <button className="trips__action-btn">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Trips;
