import React, { useContext, useState } from "react";
import "./Header.scss";
import { Context } from "../../context/Context";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const Header = () => {
  const {
    apiUrl,
    accessToken,
    setAccessToken,
    refreshToken,
    setRefreshToken,
    user,
    setUser,
    navigate,
  } = useContext(Context);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    { id: 1, text: "New booking received", time: "5 min ago", unread: true },
    { id: 2, text: "Payment confirmed", time: "10 min ago", unread: true },
    { id: 3, text: "User registered", time: "1 hour ago", unread: false },
  ];
  const mutation=useMutation({
    mutationFn:async () => {
      return axios.post(`${apiUrl}users/admin/logout/`,{refresh:refreshToken},{
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      })
    },
    onSuccess:()=>{
      console.log("Admin logged out successfully")
      setRefreshToken(null)
      setAccessToken(null)
      setUser({})
    }
  })
  const handleLogout = () => {
    mutation.mutate()
  };
  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" aria-label="Toggle menu">
          <span className="header__menu-icon">☰</span>
        </button>
        <div className="header__search">
          <span className="header__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search bookings, users, trips..."
            className="header__search-input"
          />
        </div>
      </div>

      <div className="header__right">
        <div className="header__notifications">
          <button
            className="header__icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <span className="header__icon">🔔</span>
            <span className="header__badge">3</span>
          </button>

          {showNotifications && (
            <div className="header__dropdown">
              <div className="header__dropdown-header">
                <h4>Notifications</h4>
                <button className="header__mark-read">Mark all as read</button>
              </div>
              <div className="header__dropdown-body">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`header__notification ${
                      notif.unread ? "header__notification--unread" : ""
                    }`}
                  >
                    <div className="header__notification-text">
                      {notif.text}
                    </div>
                    <div className="header__notification-time">
                      {notif.time}
                    </div>
                  </div>
                ))}
              </div>
              <div className="header__dropdown-footer">
                <a href="/notifications">View all notifications</a>
              </div>
            </div>
          )}
        </div>

        <div className="header__profile">
          <button
            className="header__profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            aria-label="Profile menu"
          >
            <div className="header__avatar">A</div>
            <div className="header__profile-info">
              <div className="header__profile-name">Admin User</div>
              <div className="header__profile-role">Administrator</div>
            </div>
            <span className="header__dropdown-arrow">▼</span>
          </button>

          {showProfile && (
            <div className="header__dropdown header__dropdown--profile">
              <a href="/profile" className="header__dropdown-item">
                <span>👤</span> My Profile
              </a>
              <a href="/settings" className="header__dropdown-item">
                <span>⚙️</span> Settings
              </a>
              <hr className="header__dropdown-divider" />
              <button
                onClick={handleLogout}
                className="header__dropdown-item header__dropdown-item--danger"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
