import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../component/AdminSidebar/AdminSidebar';
import AdminHeader from '../../component/AdminHeader/AdminHeader';
import './AdminLayout.scss';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className='admin-layout'>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="admin-layout__overlay"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      <div className={`admin-layout__sidebar ${sidebarOpen ? 'admin-layout__sidebar--open' : ''}`}>
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
        />
      </div>

      {/* Main Content Area */}
      <div className='admin-layout__main'>
        {/* Header */}
        <AdminHeader onMenuToggle={toggleSidebar} />
        
        {/* Page Content */}
        <main className="admin-layout__content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="admin-layout__footer">
          <p>&copy; {new Date().getFullYear()} BusBooking Admin. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;