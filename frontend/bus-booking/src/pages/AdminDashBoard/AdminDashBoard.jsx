import React, { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Context } from "../../context/Context";
import "./AdminDashBoard.scss";
import { 
  MdBookOnline, 
  MdAttachMoney, 
  MdDirectionsBus, 
  MdPeople,
  MdTrendingUp,
  MdTrendingDown,
  MdTrendingFlat,
  MdDownload,
  MdAdd,
  MdRefresh
} from 'react-icons/md';
import { FaSpinner } from 'react-icons/fa';

const AdminDashboard= () => {
  const { apiUrl, adminAccessToken } = useContext(Context);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/admin/dashboard/`, {
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      console.log("Dashboard data:", data);
    },
    onError: (error) => {
      console.error("Dashboard error:", error);
    },
  });
  if(data){
    console.log("Dashboard data ",data)
  }
  // Default stats structure
  const stats = [
    {
      id: 'total_bookings',
      label: 'Total Bookings',
      value: data?.status.total_bookings || 0,
      icon: MdBookOnline,
      trend: 'up',
      change: data?.status.bookings_growth || '+12%',
      color: 'primary'
    },
    {
      id: 'total_revenue',
      label: 'Total Revenue',
      value: `₹${data?.status.total_revenue || 0}`,
      icon: MdAttachMoney,
      trend: 'up',
      change: data?.status.revenue_growth || '+8%',
      color: 'success'
    },
    {
      id: 'active_buses',
      label: 'Active Buses',
      value: data?.status.total_buses || 0,
      icon: MdDirectionsBus,
      trend: 'neutral',
      change: data?.buses_change || '0%',
      color: 'info'
    },
    {
      id: 'total_users',
      label: 'Total Users',
      value: data?.status.total_users || 0,
      icon: MdPeople,
      trend: 'up',
      change: data?.users_growth || '+15%',
      color: 'warning'
    }
  ];

  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <div className="dashboard__spinner">
            <FaSpinner />
          </div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dashboard">
        <div className="dashboard__error">
          <div className="dashboard__error-icon">⚠️</div>
          <h2>Failed to load dashboard</h2>
          <p>{error?.message || 'Something went wrong'}</p>
          <button onClick={() => window.location.reload()}>
            <MdRefresh /> Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div className="dashboard__header-content">
          <h1 className="dashboard__title">Dashboard</h1>
          <p className="dashboard__subtitle">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        {/* <div className="dashboard__actions">
          <button className="dashboard__btn dashboard__btn--secondary">
            <MdDownload />
            <span>Download Report</span>
          </button>
          <button className="dashboard__btn dashboard__btn--primary">
            <MdAdd />
            <span>New Booking</span>
          </button>
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="dashboard__stats">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? MdTrendingUp : 
                           stat.trend === 'down' ? MdTrendingDown : 
                           MdTrendingFlat;
          
          return (
            <div key={stat.id} className={`dashboard__stat dashboard__stat--${stat.color}`}>
              <div className="dashboard__stat-icon">
                <IconComponent />
              </div>
              <div className="dashboard__stat-content">
                <div className="dashboard__stat-label">{stat.label}</div>
                <div className="dashboard__stat-value">{stat.value}</div>
                <div className={`dashboard__stat-change dashboard__stat-change--${stat.trend}`}>
                  <TrendIcon className="dashboard__stat-trend-icon" />
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard__grid">
        {/* Recent Bookings */}
        <div className="dashboard__card dashboard__card--large">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Recent Bookings</h3>
           
          </div>
          <div className="dashboard__table-wrapper">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Passenger</th>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_bookings && data.recent_bookings.length > 0 ? (
                  data.recent_bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="dashboard__table-id">#{booking.id}</td>
                      <td>{booking.passenger_name || booking.passenger || 'N/A'}</td>
                      <td>{booking.route_name || booking.route || 'N/A'}</td>
                      <td>{new Date(booking.date || booking.booking_date).toLocaleDateString()}</td>
                      <td className="dashboard__table-amount">
                        ₹{booking.total_amount || booking.amount || 0}
                      </td>
                      <td>
                        <span
                          className={`dashboard__badge dashboard__badge--${booking.status?.toLowerCase() || 'pending'}`}
                        >
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="dashboard__table-empty">
                      No recent bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Routes */}
        <div className="dashboard__card">
          <div className="dashboard__card-header">
            <h3 className="dashboard__card-title">Top Routes</h3>
          </div>
          <div className="dashboard__routes">
            {data?.top_routes && data.top_routes.length > 0 ? (
              data.top_routes.map((route, index) => (
                <div key={index} className="dashboard__route">
                  <div className="dashboard__route-rank">#{index + 1}</div>
                  <div className="dashboard__route-info">
                    <div className="dashboard__route-name">
                      {route.route_name || route.route || 'Unknown Route'}
                    </div>
                    <div className="dashboard__route-stats">
                      {route.total_bookings || route.bookings || 0} bookings •
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dashboard__routes-empty">
                No route data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
