import React, { useState } from "react";
import './AdminHeader.scss';
import { useMutation } from '@tanstack/react-query';
import { useContext } from "react";
import { Context } from "../../context/Context";
import axios from 'axios';
import { HiMenu } from 'react-icons/hi';
import { IoNotifications } from 'react-icons/io5';
import { MdLogout } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

const AdminHeader = ({ onMenuToggle }) => {
  const { apiUrl, adminRefreshToken, adminAccessToken, setAdminRefreshToken, setAdminAccessToken, setAdminUser, adminUser } = useContext(Context);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      return axios.post(
        `${apiUrl}users/admin/logout/`,
        { refresh: adminRefreshToken },
        {
          headers: {
            Authorization: `Bearer ${adminAccessToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      console.log("Admin logged out successfully");
      setAdminRefreshToken(null);
      setAdminAccessToken(null);
      setAdminUser({});
    },
    onError: (error) => {
      console.error("Admin Logout failed:", error);
    }
  });

  const handleLogout = () => {
    mutation.mutate();
  };

  // Get admin initials
  const getInitials = () => {
    if (adminUser?.email) {
      return adminUser.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button 
          className="admin-header__menu-toggle" 
          aria-label="Toggle menu"
          onClick={onMenuToggle}
        >
          <HiMenu />
        </button>
        <h1 className="admin-header__title">Booking Admin pannel</h1>
      </div>

      <div className="admin-header__right">
        {/* Notifications */}
        {/* <div className="admin-header__notifications">
          <button aria-label="Notifications">
            <IoNotifications />
          </button>
          <span className="admin-header__notifications-badge">3</span>
        </div> */}

        {/* User Profile */}
        <div 
          className="admin-header__user"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <div className="admin-header__user-avatar">
            {getInitials()}
          </div>
          <div className="admin-header__user-info">
            <div className="admin-header__user-name">
              {adminUser?.email?.split('@')[0] || 'Admin'}
            </div>
            <div className="admin-header__user-role">Administrator</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="admin-header__logout"
          disabled={mutation.isLoading}
          aria-label="Logout"
        >
          {mutation.isLoading ? (
            <>
              <span className="admin-header__logout-icon loading">⏳</span>
              <span className="admin-header__logout-text">Logging out...</span>
            </>
          ) : (
            <>
              <MdLogout className="admin-header__logout-icon" />
              <span className="admin-header__logout-text">Logout</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
