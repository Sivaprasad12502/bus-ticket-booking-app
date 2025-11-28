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
  FaClock,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaShare,
  FaDownload
} from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import { toast } from "react-toastify";
import Navbar from "../../component/Navbar/Navbar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
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
  const { data: cancelData } = mutation;
  if (cancelData) {
    console.log("canceledData in booking page", cancelData);
  }
  const handlePayNow = (bookingId, total_amount) => {
    console.log("handle pay now clicked", bookingId, total_amount);
    navigate(`/payment?onwardId=${bookingId}&totalamount=${total_amount}`);
  };
  const formattedDateTime = (datetime) => {
    if (!datetime) return "";
    // Format Date
    const date = new Date(datetime.replace(" ", "T"));
    const formattedDate = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    //Format time
    const time = date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${time}`;
  };

  const handleShare = async (booking) => {
    const generateTicketText = (booking) => {
      console.log("Formatted:", formattedDateTime(booking.trip.departure));

      let passengerList = booking.passengers
        .map(
          (p, index) =>
            `${index + 1}. ${p.name} (${p.gender}, ${p.age})  
Seat: ${p.seat_number}  
Boarding: ${p.boarding_location}  
Dropping: ${p.dropping_location}
fare:${p.fare}`
        )
        .join("\n\n");

      return `
🚌 *Bus Ticket*

*Booking ID:* ${booking.id}
*Status:* ${booking.status}

🔹 *Bus Details*
${booking.trip.bus.bus_name} (${booking.trip.bus.bus_type})
Operator: ${booking.trip.operator.username}
Phone: ${booking.trip.operator.phone}

🔹 *Route*
From: ${booking.trip.route.start_location}
To: ${booking.trip.route.end_location}

🔹 *Journey Time*

Departure: ${formattedDateTime(booking.trip.departure)}
Arrival: ${formattedDateTime(booking.trip.arrival)}

🔹 *Seat number*
${booking.seats.map((s) => s.seat_number).join(", ")}

🔹 *Passengers*
${passengerList}

💵 *Total Amount:* ₹${booking.total_amount}
  `;
    };
    const message = generateTicketText(booking);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking #${booking.id} Confirmation`,
          text: message,
        });
      } catch (error) {
        console.log("Error sharing booking:", error);
      }
    } else {
      toast.info("Share feature is not supported in this browser.");
    }
  };
  const downloadTicket = async (booking) => {
    const printArea = document.getElementById("print-area");
    printArea.style.display = "flex";
    printArea.style.flexDirection = "column";
    printArea.innerHTML = `
  <div style="width:550px;padding:20px;border:2px solid #2b3760;border-radius:10px;font-family:Arial;">

    <h3 style="border-bottom:1px solid #2b3760;padding-bottom:6px;">Booking Information</h3>
    <p><strong>Booking ID:</strong> ${booking.id}</p>
    <p><strong>Booked Date:</strong> ${new Date(
      booking.booked_date
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}</p>
    <p><strong>Status:</strong> ${booking.status.replace("_", " ")}</p>
    ${
      booking.payments
        ? `<p><strong>Payment:</strong> ${booking.payments.payment_status}</p>`
        : ""
    }

    <h3 style="border-bottom:1px solid #2b3760;padding-bottom:6px;">Bus Details</h3>
    <p><strong>Bus Name:</strong> ${booking.trip.bus.bus_name}</p>
    <p><strong>Type:</strong> ${booking.trip.bus.bus_type}</p>
    <p><strong>Operator:</strong> ${booking.trip.operator.username}</p>
    <p><strong>Operator Phone:</strong> ${booking.trip.operator.phone}</p>

    <h3 style="border-bottom:1px solid #2b3760;padding-bottom:6px;">Journey Details</h3>
    <p><strong>From:</strong> ${booking.trip.route.start_location}</p>
    <p><strong>To:</strong> ${booking.trip.route.end_location}</p>
    <p><strong>Departure:</strong> ${formattedDateTime(
      booking.trip.departure
    )}</p>
    <p><strong>Arrival:</strong> ${formattedDateTime(booking.trip.arrival)}</p>
    <p><strong>Distance:</strong> ${booking.trip.route.distance_km} km</p>

    <h3 style="border-bottom:1px solid #2b3760;padding-bottom:6px;">Selected Seats</h3>
    <p><strong>Seat number:</strong> ${booking.seats
      .map((s) => s.seat_number)
      .join(", ")}</p>

    <h3 style="border-bottom:1px solid #2b3760;padding-bottom:6px;">Passenger Details</h3>
    ${booking.passengers
      .map((p) => {
        const boardingStop = booking.trip.trip_stops?.find(
          (stop) => stop.stop_name === p.boarding_location
        );
        const droppingStop = booking.trip.trip_stops?.find(
          (stop) => stop.stop_name === p.dropping_location
        );

        return `
        <div style="border:1px dashed #2b3760;padding:10px;margin-bottom:10px;border-radius:5px;">
          <p><strong>${p.name}</strong> (${p.gender}, ${p.age} yrs)</p>
          <p><strong>Seat:</strong> ${p.seat_number}</p>

          <p><strong>Boarding:</strong> ${p.boarding_location}</p>
          <p><strong>Boarding Time:</strong> ${
            boardingStop?.arrival_time || "N/A"
          }</p>

          <p><strong>Dropping:</strong> ${p.dropping_location}</p>
          <p><strong>Dropping Time:</strong> ${
            droppingStop?.arrival_time || "N/A"
          }</p>

          <p><strong>Fare:</strong> ₹${p.fare}</p>
        </div>
      `;
      })
      .join("")}

    <h3 style="border-top:2px solid #2b3760;padding-top:10px;">Total Amount</h3>
    <h2 style="color:#2b3760;">₹${booking.total_amount}</h2>

    <p style="text-align:center;font-size:12px;margin-top:10px;border-top:1px dashed #2b3760;padding-top:10px;">
      * Please carry valid ID proof during the journey.
    </p>
  </div>
`;

    // 3️⃣ Capture with controlled size

    const canvas = await html2canvas(printArea, {
      scale: 1.5, // ↓ LOW SCALE = SMALL PDF

      backgroundColor: "#ffffff",
      useCORS: true,
    });

    // 4️⃣ Restore styles

    // 5️⃣ Generate PDF with correct aspect ratio
    const img = canvas.toDataURL("image/jpeg", 0.7); // ↓ JPEG + 0.7 = small file
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(img, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ticket-${booking.id}.pdf`);
    printArea.style.display = "none";
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
            {filteredBookings?.map((booking, index) => (
              <motion.div
                key={booking.id}
                className="ticket-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  // delay: index * 0.1,
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
                     Booking status: {booking.status.replace("_", " ")}
                    </span>
                    {booking.payments && (
                      <span
                        className={`badge badge--payment ${booking.payments.payment_status.toLowerCase()}`}
                      >
                        payment status: {booking.payments.payment_status}
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
                            booking.trip.bus.bus_type === "AC" ? "ac" : "non-ac"
                          }`}
                        >
                          {booking.trip.bus.bus_type} {booking.trip.bus.layout_type}
                        </span>
                        <div className="operator-details">
                          <span>
                            Operator Name{" "}
                            <strong>{booking.trip.operator.username}</strong>
                          </span>
                          <span>
                            Mobile No:{" "}
                            <strong>{booking.trip.operator.phone}</strong>
                          </span>
                        </div>
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
                            {formattedDateTime(booking.trip.departure)}
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
                          <p className="time">
                            {formattedDateTime(booking.trip.arrival)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="booking-meta">
                      <div className="meta-item">
                        <MdEventSeat className="icon" />
                        <span>
                          Seat number:{" "}
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
                        {booking.passengers.map((p) => {
                          // Find boarding and dropping stop times from trip_stops
                          const boardingStop = booking.trip.trip_stops?.find(
                            (stop) => stop.stop_name === p.boarding_location
                          );
                          const droppingStop = booking.trip.trip_stops?.find(
                            (stop) => stop.stop_name === p.dropping_location
                          );

                          return (
                            <div key={p.id} className="passenger-card">
                              <div className="passenger-header">
                                <span className="name">{p.name}</span>
                                <span className="seat-badge">
                                  Seat {p.seat_number}
                                </span>
                              </div>
                              <div className="passenger-details">
                                <span>
                                  {p.age} yrs,{" "}
                                  {p.gender === "M"
                                    ? "Male"
                                    : p.gender === "F"
                                    ? "Female"
                                    : "Other"}
                                </span>
                              </div>
                              <div className="passenger-journey">
                                <div className="journey-stop boarding-stop">
                                  <span className="location">
                                    Boarding: {p.boarding_location}
                                  </span>
                                  {boardingStop?.arrival_time ? (
                                    <span className="time">
                                      <FaClock
                                        style={{
                                          fontSize: "12px",
                                          marginRight: "4px",
                                        }}
                                      />
                                      {boardingStop.arrival_time}
                                    </span>
                                  ) : (
                                    <span
                                      className="time"
                                      style={{
                                        background: "#f0f0f0",
                                        color: "#999",
                                      }}
                                    >
                                      <FaClock
                                        style={{
                                          fontSize: "12px",
                                          marginRight: "4px",
                                        }}
                                      />
                                      Time N/A
                                    </span>
                                  )}
                                </div>
                                <span className="arrow">→</span>
                                <div className="journey-stop dropping-stop">
                                  <span className="location">
                                    Dropping: {p.dropping_location}
                                  </span>
                                  {droppingStop?.arrival_time ? (
                                    <span className="time">
                                      <FaClock
                                        style={{
                                          fontSize: "12px",
                                          marginRight: "4px",
                                        }}
                                      />
                                      {droppingStop.arrival_time}
                                    </span>
                                  ) : (
                                    <span
                                      className="time"
                                      style={{
                                        background: "#f0f0f0",
                                        color: "#999",
                                      }}
                                    >
                                      <FaClock
                                        style={{
                                          fontSize: "12px",
                                          marginRight: "4px",
                                        }}
                                      />
                                      Time N/A
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="passenger-fare">
                                Fare: ₹{p.fare}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {/* //share and download ticket// */}
                <div className="ticket-share">
                  <div
                    id="print-area"
                    style={{
                      width: "fit-content",
                      padding: "20px",
                      display: "none",
                      height: "auto",
                    }}
                  ></div>

                  {booking.status == "CONFIRMED" &&
                    (
                      <>
                        <button
                          type="button"
                          onClick={() => handleShare(booking)}
                        >
                          <FaShare/>
                         
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadTicket(booking)}
                        >
                          {" "}
                          <FaDownload/> 
                        </button>
                      </>
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
