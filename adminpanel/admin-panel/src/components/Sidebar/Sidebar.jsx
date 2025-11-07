import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      badge: null
    },
    {
      path: '/buses',
      icon: '🚌',
      label: 'Buses',
      badge: null
    },
    {
      path: '/routes',
      icon: '🗺️',
      label: 'Routes',
      badge: null
    },
    {
      path: '/trips',
      icon: '🎫',
      label: 'Trips',
      badge: null
    },
    {
      path: '/bookings',
      icon: '📝',
      label: 'Bookings',
      badge: '12'
    },
    {
      path: '/users',
      icon: '👥',
      label: 'Users',
      badge: null
    },
    {
      path: '/payments',
      icon: '💳',
      label: 'Payments',
      badge: '3'
    },
    {
      path: '/reports',
      icon: '📈',
      label: 'Reports',
      badge: null
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Settings',
      badge: null
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🚌</span>
          {!collapsed && <span className="sidebar__logo-text">BusBooking</span>}
        </div>
        <button 
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar__menu-item">
              <Link
                to={item.path}
                className={`sidebar__link ${
                  location.pathname === item.path ? 'sidebar__link--active' : ''
                }`}
              >
                <span className="sidebar__icon">{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="sidebar__label">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar__badge">{item.badge}</span>
                    )}
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">A</div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">Admin User</div>
              <div className="sidebar__user-role">Administrator</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
