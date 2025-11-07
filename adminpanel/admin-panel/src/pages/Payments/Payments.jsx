import React from 'react';
import './Payments.scss';

const Payments = () => {
  const payments = [
    { id: 'PAY001', bookingId: 'BK001', customer: 'John Doe', amount: '₹900', method: 'Credit Card', date: '2024-01-20 10:30 AM', status: 'completed' },
    { id: 'PAY002', bookingId: 'BK002', customer: 'Jane Smith', amount: '₹650', method: 'UPI', date: '2024-01-20 11:15 AM', status: 'pending' },
    { id: 'PAY003', bookingId: 'BK003', customer: 'Mike Johnson', amount: '₹2250', method: 'Debit Card', date: '2024-01-19 09:45 PM', status: 'completed' },
    { id: 'PAY004', bookingId: 'BK004', customer: 'Sarah Wilson', amount: '₹550', method: 'Net Banking', date: '2024-01-19 08:20 AM', status: 'failed' },
    { id: 'PAY005', bookingId: 'BK005', customer: 'Tom Brown', amount: '₹1000', method: 'Wallet', date: '2024-01-18 03:30 PM', status: 'completed' },
  ];

  return (
    <div className="payments">
      <div className="payments__header">
        <div>
          <h1 className="payments__title">Payment Management</h1>
          <p className="payments__subtitle">Track and manage all transactions</p>
        </div>
        <button className="payments__btn payments__btn--primary">
          📊 Download Report
        </button>
      </div>

      <div className="payments__stats">
        <div className="payments__stat payments__stat--success">
          <div className="payments__stat-icon">💰</div>
          <div className="payments__stat-content">
            <div className="payments__stat-value">₹2,45,678</div>
            <div className="payments__stat-label">Total Revenue</div>
            <div className="payments__stat-change payments__stat-change--up">
              ↑ 12.5% from last month
            </div>
          </div>
        </div>
        <div className="payments__stat payments__stat--primary">
          <div className="payments__stat-icon">✅</div>
          <div className="payments__stat-content">
            <div className="payments__stat-value">1,234</div>
            <div className="payments__stat-label">Successful</div>
            <div className="payments__stat-change payments__stat-change--up">
              ↑ 8.2% success rate
            </div>
          </div>
        </div>
        <div className="payments__stat payments__stat--warning">
          <div className="payments__stat-icon">⏳</div>
          <div className="payments__stat-content">
            <div className="payments__stat-value">45</div>
            <div className="payments__stat-label">Pending</div>
            <div className="payments__stat-change payments__stat-change--neutral">
              Requires attention
            </div>
          </div>
        </div>
        <div className="payments__stat payments__stat--danger">
          <div className="payments__stat-icon">❌</div>
          <div className="payments__stat-content">
            <div className="payments__stat-value">23</div>
            <div className="payments__stat-label">Failed</div>
            <div className="payments__stat-change payments__stat-change--down">
              ↓ 2.1% failure rate
            </div>
          </div>
        </div>
      </div>

      <div className="payments__filters">
        <div className="payments__search">
          <span className="payments__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by payment ID, booking ID, or customer..."
            className="payments__search-input"
          />
        </div>
        <select className="payments__select">
          <option>All Status</option>
          <option>Completed</option>
          <option>Pending</option>
          <option>Failed</option>
        </select>
        <select className="payments__select">
          <option>All Methods</option>
          <option>Credit Card</option>
          <option>Debit Card</option>
          <option>UPI</option>
          <option>Net Banking</option>
          <option>Wallet</option>
        </select>
      </div>

      <div className="payments__table-wrapper">
        <table className="payments__table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Booking ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="payments__table-id">{payment.id}</td>
                <td className="payments__booking-id">{payment.bookingId}</td>
                <td>{payment.customer}</td>
                <td className="payments__amount">{payment.amount}</td>
                <td>
                  <span className="payments__method">{payment.method}</span>
                </td>
                <td className="payments__date">{payment.date}</td>
                <td>
                  <span className={`payments__badge payments__badge--${payment.status}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className="payments__actions">
                    <button className="payments__action-btn" title="View Details">👁️</button>
                    <button className="payments__action-btn" title="Download Receipt">📄</button>
                    <button className="payments__action-btn" title="Refund">💸</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
