import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.scss';
import { 
  MdDashboard, 
  MdDirectionsBus, 
  MdRoute, 
  MdConfirmationNumber,
  MdBookOnline,
  MdChevronLeft,
  MdChevronRight,
  MdPerson,
} from 'react-icons/md';
import { FaBus } from 'react-icons/fa';
const AdminSidebar = ({ isOpen, onClose, isMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: MdDashboard,
      label: 'Dashboard',
      badge: null
    },
    {
      path: '/admin/buses',
      icon: MdDirectionsBus,
      label: 'Buses',
      badge: null
    },
    {
      path: '/admin/routes',
      icon: MdRoute,
      label: 'Routes',
      badge: null
    },
    {
      path: '/admin/trips',
      icon: MdConfirmationNumber,
      label: 'Trips',
      badge: null
    },
    {
      path: '/admin/bookings',
      icon: MdBookOnline,
      label: 'Bookings',
      badge: null
    },
    {
      path: '/admin/operators',
      icon: MdPerson,
      label: 'Operators',
      badge: null
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">
            <FaBus />
          </span>
          {!collapsed && <span className="sidebar__logo-text">BusBooking</span>}
        </div>
        <button 
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.path} className="sidebar__menu-item">
                <Link
                  to={item.path}
                  className={`sidebar__link ${
                    location.pathname === item.path ? 'sidebar__link--active' : ''
                  }`}
                  title={collapsed ? item.label : ''}
                  onClick={() => isMobile && onClose && onClose()}
                >
                  <span className="sidebar__icon">
                    <IconComponent />
                  </span>
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
            );
          })}
        </ul>
      </nav>

      {/* <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">A</div>
          {!collapsed && (
            <div className="sidebar__user-info">
              <div className="sidebar__user-name">Admin User</div>
              <div className="sidebar__user-role">Administrator</div>
            </div>
          )}
        </div>
      </div> */}
    </aside>
  );
}

export default AdminSidebar