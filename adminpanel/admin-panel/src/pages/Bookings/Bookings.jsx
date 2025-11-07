import React from 'react';
import './Bookings.scss';

const Bookings = () => {
  const bookings = [
    { id: 'BK001', passenger: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', route: 'Mumbai - Pune', date: '2024-01-20', seats: 2, amount: '₹900', status: 'confirmed' },
    { id: 'BK002', passenger: 'Jane Smith', email: 'jane@example.com', phone: '+91 98765 43211', route: 'Delhi - Jaipur', date: '2024-01-20', seats: 1, amount: '₹650', status: 'pending' },
    { id: 'BK003', passenger: 'Mike Johnson', email: 'mike@example.com', phone: '+91 98765 43212', route: 'Bangalore - Chennai', date: '2024-01-21', seats: 3, amount: '₹2250', status: 'confirmed' },
    { id: 'BK004', passenger: 'Sarah Wilson', email: 'sarah@example.com', phone: '+91 98765 43213', route: 'Hyderabad - Vizag', date: '2024-01-19', seats: 1, amount: '₹550', status: 'cancelled' },
    { id: 'BK005', passenger: 'Tom Brown', email: 'tom@example.com', phone: '+91 98765 43214', route: 'Kolkata - Bhubaneswar', date: '2024-01-22', seats: 2, amount: '₹1000', status: 'confirmed' },
  ];

  return (
    <div className="bookings">
      <div className="bookings__header">
        <div>
          <h1 className="bookings__title">Booking Management</h1>
          <p className="bookings__subtitle">View and manage all bookings</p>
        </div>
        <div className="bookings__actions">
          <button className="bookings__btn bookings__btn--secondary">
            📊 Export Data
          </button>
          <button className="bookings__btn bookings__btn--primary">
            ➕ New Booking
          </button>
        </div>
      </div>

      <div className="bookings__filters">
        <div className="bookings__search">
          <span className="bookings__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by booking ID, passenger name, or email..."
            className="bookings__search-input"
          />
        </div>
        <select className="bookings__select">
          <option>All Status</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      <div className="bookings__table-wrapper">
        <table className="bookings__table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Passenger</th>
              <th>Contact</th>
              <th>Route</th>
              <th>Travel Date</th>
              <th>Seats</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="bookings__table-id">{booking.id}</td>
                <td>
                  <div className="bookings__passenger">
                    <div className="bookings__passenger-avatar">
                      {booking.passenger.charAt(0)}
                    </div>
                    <div className="bookings__passenger-name">{booking.passenger}</div>
                  </div>
                </td>
                <td>
                  <div className="bookings__contact">
                    <div>{booking.email}</div>
                    <div className="bookings__phone">{booking.phone}</div>
                  </div>
                </td>
                <td>{booking.route}</td>
                <td>{booking.date}</td>
                <td className="bookings__seats">{booking.seats}</td>
                <td className="bookings__amount">{booking.amount}</td>
                <td>
                  <span className={`bookings__badge bookings__badge--${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className="bookings__table-actions">
                    <button className="bookings__action-btn" title="View">👁️</button>
                    <button className="bookings__action-btn" title="Edit">✏️</button>
                    <button className="bookings__action-btn" title="Cancel">❌</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bookings__pagination">
        <button className="bookings__page-btn bookings__page-btn--disabled">← Previous</button>
        <div className="bookings__page-numbers">
          <button className="bookings__page-num bookings__page-num--active">1</button>
          <button className="bookings__page-num">2</button>
          <button className="bookings__page-num">3</button>
          <span className="bookings__page-dots">...</span>
          <button className="bookings__page-num">10</button>
        </div>
        <button className="bookings__page-btn">Next →</button>
      </div>
    </div>
  );
};

export default Bookings;
