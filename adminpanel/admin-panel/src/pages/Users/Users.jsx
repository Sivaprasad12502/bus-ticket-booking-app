import React from 'react';
import './Users.scss';

const Users = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', bookings: 12, joined: '2023-01-15', status: 'active', role: 'customer' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+91 98765 43211', bookings: 8, joined: '2023-02-20', status: 'active', role: 'customer' },
    { id: 3, name: 'Admin User', email: 'admin@busbooking.com', phone: '+91 98765 00000', bookings: 0, joined: '2022-12-01', status: 'active', role: 'admin' },
    { id: 4, name: 'Mike Johnson', email: 'mike@example.com', phone: '+91 98765 43212', bookings: 5, joined: '2023-03-10', status: 'inactive', role: 'customer' },
    { id: 5, name: 'Sarah Wilson', email: 'sarah@example.com', phone: '+91 98765 43213', bookings: 15, joined: '2022-11-25', status: 'active', role: 'customer' },
  ];

  return (
    <div className="users">
      <div className="users__header">
        <div>
          <h1 className="users__title">User Management</h1>
          <p className="users__subtitle">Manage users and administrators</p>
        </div>
        <button className="users__btn users__btn--primary">
          ➕ Add New User
        </button>
      </div>

      <div className="users__stats">
        <div className="users__stat users__stat--primary">
          <div className="users__stat-icon">👥</div>
          <div className="users__stat-content">
            <div className="users__stat-value">5,678</div>
            <div className="users__stat-label">Total Users</div>
          </div>
        </div>
        <div className="users__stat users__stat--success">
          <div className="users__stat-icon">✅</div>
          <div className="users__stat-content">
            <div className="users__stat-value">5,234</div>
            <div className="users__stat-label">Active Users</div>
          </div>
        </div>
        <div className="users__stat users__stat--warning">
          <div className="users__stat-icon">⭐</div>
          <div className="users__stat-content">
            <div className="users__stat-value">234</div>
            <div className="users__stat-label">VIP Users</div>
          </div>
        </div>
        <div className="users__stat users__stat--info">
          <div className="users__stat-icon">📅</div>
          <div className="users__stat-content">
            <div className="users__stat-value">+127</div>
            <div className="users__stat-label">New This Month</div>
          </div>
        </div>
      </div>

      <div className="users__filters">
        <div className="users__search">
          <span className="users__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="users__search-input"
          />
        </div>
        <select className="users__select">
          <option>All Roles</option>
          <option>Admin</option>
          <option>Customer</option>
        </select>
        <select className="users__select">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="users__table-wrapper">
        <table className="users__table">
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Bookings</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="users__user">
                    <div className="users__avatar">{user.name.charAt(0)}</div>
                    <div className="users__user-info">
                      <div className="users__name">{user.name}</div>
                      <div className="users__email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="users__phone">{user.phone}</td>
                <td>
                  <span className={`users__role users__role--${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td className="users__bookings">{user.bookings}</td>
                <td>{user.joined}</td>
                <td>
                  <span className={`users__status users__status--${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="users__actions">
                    <button className="users__action-btn" title="View">👁️</button>
                    <button className="users__action-btn" title="Edit">✏️</button>
                    <button className="users__action-btn" title="Delete">🗑️</button>
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

export default Users;
