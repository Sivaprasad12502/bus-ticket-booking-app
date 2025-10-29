import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import "./MyBooking.scss";
import { NavLink } from "react-router-dom";
import {
  FaArrowAltCircleLeft,
  FaBus,
  FaCalendar,
  FaMapMarkerAlt,
  FaRupeeSign,
} from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import { toast } from "react-toastify";
import Navbar from "../../component/Navbar/Navbar";
import {motion} from "framer-motion"
const MyBooking = () => {
  const query = useQueryClient();
  const { apiUrl, token, navigate } = useContext(Context);
  const [searchDate, setSearchDate] = useState("");
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
  console.log(bookings, "my bookings data");
  const booked_dates = [
    ...new Set(bookings?.map((booking) => booking.booked_date)),
  ];
  console.log(searchDate, "search Date");
  const filteredBookings = searchDate
    ? bookings?.filter((bookings) => bookings.booked_date == searchDate)
    : bookings;
  const mutation = useMutation({
    mutationFn: async (booking_Id) => {
      const response = await axios.post(
        `${apiUrl}bookings/bookings/${booking_Id}/cancel/`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      query.invalidateQueries({
        queryKey: ["bookings"],
      });
      toast.success("Ticket Cancelled");
    },
    onError: (er) => console.log(er),
  });

  const handlePayNow = (bookingId, total_amount) => {
    console.log("handle pay now clicked", bookingId, total_amount);
    navigate(`/payment?bookingId=${bookingId}&totalamount=${total_amount}`);
  };

  if (isLoading) {
    return (
      <div className="my-bookings-page">
        {/* <Navbar /> */}
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="my-bookings-page">
        <Navbar />
        <div className="error-container">
          <p>⚠️ Error fetching bookings. Please try again.</p>
          <button onClick={() => navigate("/")} className="btn-home">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <Navbar />
      <div className="my-bookings">
        <div className="bookings-header">
          {/* <button className="btn-back" onClick={() => navigate("/")}>
            <FaArrowAltCircleLeft /> Back to Home
          </button> */}
          <h1>My Booked Tickets</h1>
          <p className="subtitle">{bookings?.length || 0} booking(s) found</p>
          <div className="filter-box">
            <select
              name=""
              id=""
              onChange={(e) => setSearchDate(e.target.value)}
            >
              <option value="">All Dates</option>
              {booked_dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {bookings && bookings.length === 0 ? (
          <div className="no-bookings">
            <FaBus className="no-bookings-icon" />
            <h3>No bookings yet</h3>
            <p>Book your first bus ticket to see it here</p>
            <button onClick={() => navigate("/")} className="btn-search">
              Search Buses
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings?.map((booking,index) => (
              <motion.div
                key={booking.id}
                className="ticket-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: false, amount: 0.2 }}
              >
                {/* <div key={booking.id} className="ticket-card"> */}
                  <div className="ticket-card__header">
                    <div className="booking-info">
                      <h3>Booking #{booking.id}</h3>
                      <p className="booked-date">
                        <FaCalendar /> Booked for:{" "}
                        {new Date(booking.booked_date).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </p>
                    </div>
                    <div className="status-badges">
                      <span
                        className={`badge badge--status ${booking.status.toLowerCase()}`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                      {booking.payments && (
                        <span
                          className={`badge badge--payment ${booking.payments.payment_status.toLowerCase()}`}
                        >
                          {booking.payments.payment_status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="ticket-card__body">
                    <div className="trip-section">
                      <div className="bus-details">
                        <FaBus className="icon" />
                        <div>
                          <h4>{booking.trip.bus.bus_name}</h4>
                          <span
                            className={`bus-type ${
                              booking.trip.bus.bus_type === "AC"
                                ? "ac"
                                : "non-ac"
                            }`}
                          >
                            {booking.trip.bus.bus_type}
                          </span>
                        </div>
                      </div>

                      <div className="route-section">
                        <div className="route-point">
                          <FaMapMarkerAlt className="icon-start" />
                          <div>
                            <p className="location">
                              {booking.trip.route.start_location}
                            </p>
                            <p className="time">
                              {booking.trip.departure_time}
                            </p>
                          </div>
                        </div>
                        <div className="route-line">
                          <div className="line"></div>
                          <span className="distance">
                            {booking.trip.route.distance_km} km
                          </span>
                        </div>
                        <div className="route-point">
                          <FaMapMarkerAlt className="icon-end" />
                          <div>
                            <p className="location">
                              {booking.trip.route.end_location}
                            </p>
                            <p className="time">{booking.trip.arrival_time}</p>
                          </div>
                        </div>
                      </div>

                      <div className="booking-meta">
                        <div className="meta-item">
                          <MdEventSeat className="icon" />
                          <span>
                            Seats:{" "}
                            {booking.seats.map((s) => s.seat_number).join(", ")}
                          </span>
                        </div>
                        <div className="meta-item price">
                          <FaRupeeSign className="icon" />
                          <span>Total: ₹{booking.total_amount}</span>
                        </div>
                      </div>
                    </div>

                    {booking.passengers && booking.passengers.length > 0 && (
                      <div className="passengers-section">
                        <h5>Passenger Details:</h5>
                        <div className="passengers-grid">
                          {booking.passengers.map((p) => (
                            <div key={p.id} className="passenger-card">
                              <div className="passenger-header">
                                <span className="name">{p.name}</span>
                                <span className="seat-badge">
                                  Seat {p.seat_number}
                                </span>
                              </div>
                              <div className="passenger-details">
                                <span>
                                  {p.age} yrs, {p.gender}
                                </span>
                              </div>
                              <div className="passenger-journey">
                                <span className="boarding">
                                  📍 {p.boarding_location}
                                </span>
                                <span className="arrow">→</span>
                                <span className="dropping">
                                  📍 {p.dropping_location}
                                </span>
                              </div>
                              <div className="passenger-fare">
                                Fare: ₹{p.fare}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ticket-card__footer">
                    {booking.status === "PENDING_PAYMENT" && (
                      <button
                        className="btn btn-pay"
                        onClick={() =>
                          handlePayNow(booking.id, booking.total_amount)
                        }
                      >
                        💳 Pay Now
                      </button>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <button className="btn btn-confirmed" disabled>
                        ✅ Confirmed
                      </button>
                    )}
                    {booking.status !== "CANCELLED" && (
                      <button
                        className="btn btn-cancel"
                        onClick={() => mutation.mutate(booking.id)}
                        disabled={mutation.isPending}
                      >
                        ❌ {mutation.isPending ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                {/* </div> */}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;
