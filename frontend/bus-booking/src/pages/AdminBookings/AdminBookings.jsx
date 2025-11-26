import React, { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Context } from "../../context/Context";
import axios from "axios";
import "./AdminBookings.scss";
import {
  FaBus,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaClock,
  FaUser,
  FaTrash,
} from "react-icons/fa";
import { MdBookOnline } from "react-icons/md";

const AdminBookings = () => {
  const queryClient = useQueryClient();
  const { apiUrl, adminAccessToken } = useContext(Context);
  const [expandedRow, setExpandedRow] = useState(null);

  const {
    data: bookings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/admin/bookings/`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return res.data;
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (bookingId) => {
      const res = await axios.delete(
        `${apiUrl}bookings/admin/bookings/${bookingId}/`,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBookings"]);
    },
    onError: (err) => {
      console.error("error deleting booking:", err);
    },
  });
  if (isLoading)
    return (
      <div className="admin-bookings">
        <div className="admin-bookings__loading">
          <div className="admin-bookings__loading-spinner"></div>
          <p>Loading bookings...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="admin-bookings">
        <div className="admin-bookings__empty">
          <div className="admin-bookings__empty-icon">⚠️</div>
          <h3>Error Loading Bookings</h3>
          <p>Failed to fetch bookings data</p>
        </div>
      </div>
    );

  return (
    <div className="admin-bookings">
      <div className="admin-bookings__header">
        <h1>
         <MdBookOnline/> All Bookings <span>({bookings?.length || 0})</span>
        </h1>
      </div>

      {bookings?.length > 0 ? (
        <div className="admin-bookings__table-wrapper">
          <table className="admin-bookings__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Passenger</th>
                <th>Bus / Route</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const passenger = booking.passengers?.[0];
                const trip = booking.trip;
                const route = trip?.route;
                const bus = trip?.bus;
                const isExpanded = expandedRow === booking.id;

                return (
                  <React.Fragment key={booking.id}>
                    <tr
                      className={`admin-bookings__main-row ${
                        isExpanded ? "expanded" : ""
                      }`}
                    >
                      <td>#{booking.id}</td>
                      <td>
                        <FaUser className="icon" /> {passenger?.name || "N/A"}
                      </td>
                      <td>
                        <FaBus className="icon" /> {bus?.bus_name || "N/A"}
                        <br />
                        <FaMapMarkerAlt className="icon small" />{" "}
                        {route?.start_location} → {route?.end_location}
                      </td>
                      <td>
                        {booking.seats?.map((s) => s.seat_number).join(", ") ||
                          "N/A"}
                      </td>
                      <td>
                        <FaRupeeSign className="icon small" />{" "}
                        {booking.total_amount}
                      </td>
                      <td>
                        <span
                          className={`admin-bookings__badge admin-bookings__badge--${booking.status?.toLowerCase()}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td>
                        {new Date(booking.booking_date).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>
                      <td>
                        <div className="admin-bookings__actions-cell">
                          <button
                            className="toggle-details"
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : booking.id)
                            }
                          >
                            {isExpanded ? "▲ Hide" : "▼ View"} Passenger Details
                          </button>
                          <button
                            className="delete"
                            onClick={() => deleteMutation.mutate(booking.id)}
                          >
                            <FaTrash/>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="admin-bookings__expanded-row">
                        <td colSpan="8">
                          <div className="expanded-details">
                            <h4>Passenger Details</h4>
                            <table className="passenger-table">
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Age</th>
                                  <th>Gender</th>
                                  <th>Boarding</th>
                                  <th>Dropping</th>
                                  <th>Seat</th>
                                  <th>Fare</th>
                                </tr>
                              </thead>
                              <tbody>
                                {booking.passengers.map((p) => (
                                  <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.age}</td>
                                    <td>{p.gender}</td>
                                    <td>
                                      {p.boarding_location}{" "}
                                      <FaClock className="icon small" />{" "}
                                      {booking.trip.trip_stops?.find(
                                        (s) =>
                                          s.stop_name === p.boarding_location
                                      )?.arrival_time || "N/A"}
                                    </td>
                                    <td>
                                      {p.dropping_location}{" "}
                                      <FaClock className="icon small" />{" "}
                                      {booking.trip.trip_stops?.find(
                                        (s) =>
                                          s.stop_name === p.dropping_location
                                      )?.arrival_time || "N/A"}
                                    </td>
                                    <td>{p.seat_number}</td>
                                    <td>₹{p.fare}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-bookings__empty">
          <div className="admin-bookings__empty-icon">📭</div>
          <h3>No Bookings Found</h3>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
