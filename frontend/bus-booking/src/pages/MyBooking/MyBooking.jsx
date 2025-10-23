import React, { useContext } from "react";
import { Context } from "../../context/Context";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./MyBooking.scss";

const MyBooking = () => {
  const { apiUrl, token } = useContext(Context);

  const {
    data: bookings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}bookings/bookings/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onError: (err) => console.log(err),
  });
  if (bookings) {
    console.log(bookings);
  }
  if (isLoading) return <p>Loading your bookings...</p>;
  if (isError) return <p>Error fetching bookings!</p>;
  if (!bookings || bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div className="my-bookings">
      <h1 className="title">My Booked Tickets</h1>
      {bookings.map((booking) => (
        <div key={booking.id} className="ticket">
          <div className="ticket-header">
            <h2>Booking #{booking.id}</h2>
            <span className={`status ${booking.status.toLowerCase()}`}>
              {booking.status}
            </span>
          </div>

          <div className="ticket-info">
            <p>
              <strong>User:</strong> {booking.user}
            </p>
            <p>
              <strong>Trip:</strong> {booking.trip.bus.bus_name} (
              {booking.trip.bus.bus_type})
            </p>
            <p>
              <strong>Route:</strong> {booking.trip.route.start_location} →{" "}
              {booking.trip.route.end_location} (
              {booking.trip.route.distance_km} km)
            </p>
            <p>
              <strong>Departure:</strong>{" "}
              {new Date(booking.trip.departure_time).toLocaleString()}
            </p>
            <p>
              <strong>Arrival:</strong>{" "}
              {new Date(booking.trip.arrival_time).toLocaleString()}
            </p>
            <p>
              <strong>Seats:</strong>{" "}
              {booking.seats.map((s) => s.seat_number).join(", ")}
            </p>
            <p>
              <strong>Total Amount:</strong> ₹{booking.total_amount}
            </p>
          </div>

          {booking.passengers && booking.passengers.length > 0 && (
            <div className="passengers">
              <strong>Passengers:</strong>
              <ul>
                {booking.passengers.map((p) => (
                  <li key={p.id}>
                    <span>
                      <strong>Name:</strong> {p.name}
                    </span>{" "}
                    |
                    <span>
                      <strong>Age:</strong> {p.age}
                    </span>{" "}
                    |
                    <span>
                      <strong>Gender:</strong> {p.gender}
                    </span>{" "}
                    |
                    <span>
                      <strong>Boarding:</strong> {p.boarding_location}
                    </span>{" "}
                    |
                    <span>
                      <strong>Dropping:</strong> {p.dropping_location}
                    </span>{" "}
                    |
                    <span>
                      <strong>Seat:</strong> {p.seat_number}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyBooking;
