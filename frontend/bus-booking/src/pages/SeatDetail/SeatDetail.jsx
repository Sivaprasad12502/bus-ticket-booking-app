import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Context } from "../../context/Context";
import "./SeatDetail.scss";
import { toast } from "react-toastify";
import {
  FaBus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaRupeeSign,
  FaChair,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
  FaArrowRight,
} from "react-icons/fa";
import { MdEventSeat, MdAirlineSeatReclineNormal } from "react-icons/md";
import { GiSteeringWheel } from "react-icons/gi";
import Navbar from "../../component/Navbar/Navbar";

export const SeatDetail = () => {
  const { apiUrl, token, navigate } = useContext(Context);
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const tripid = params.get("tripid");
  const date = params.get("date");
  const returnTripId = params.get("returnTripId");
  const returnDate = params.get("returnDate");
  const tripType = params.get("tripType") || "oneway";
  const tripPhase = params.get("tripPhase") || "onward";
  const onwayTripId = params.get("onwayTripId");
  const onwayDate = params.get("onwayDate");
  const onwaySeats = params.get("onwaySeats");
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Guards
  if (!tripid || !date) {
    return (
      <p>
        Please provide a trip id and date in the query string (tripid & date).
      </p>
    );
  }

  // Fetch trip details (to know total seats and price)
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ["trip", tripid],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/trips/${tripid}/`);
      return res.data;
    },
  });

  // Fetch available seats for the requested date
  const {
    data: availableSeats,
    isSuccess: seatsSuccess,
    isLoading: seatsLoading,
    error: seatsError,
  } = useQuery({
    queryKey: ["seats", tripid, date],
    queryFn: async () => {
      const res = await axios.get(
        `${apiUrl}bookings/trips/${tripid}/seats/?date=${date}`
      );
      return res.data; // API returns seats available for the date
    },
  });

  // Build a full seat map (1..total_seats) and mark available seats
  const totalSeats = trip?.bus?.total_seats || 0;
  const availableSet = new Set(
    (availableSeats || []).map((s) => String(s.seat_number))
  );
  const seatInfoMap = new Map();
  (availableSeats || []).forEach((s) => {
    seatInfoMap.set(String(s.seat_number), s);
  });
  const seatNumbers = Array.from({ length: totalSeats }, (_, i) =>
    String(i + 1)
  );
  console.log(availableSet, "avillalala");
  console.log(seatInfoMap, "seatInfomaaaap");

  const toggleSeat = (seatNumber, isAvailable) => {
    if (!isAvailable) return; // cannot toggle booked seats
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBookNow = () => {
    if (!token) {
      toast.error("Please login to book seats.");
      navigate(`/login?next=/selectSeat?tripid=${tripid}&date=${date}`);
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat!");
      return;
    }

    const seatsQuery = selectedSeats.join(",");
    //CASE 1:Onward Phase of a roundTrip
    if (tripType === "roundtrip" && tripPhase === "onward") {
      navigate(
        `/busDetails?from=${trip.route.start_location}&to=${trip.route.end_location}&date=${returnDate}&tripType=roundtrip&returnDate=${returnDate}&onwayTripId=${tripid}&onwayDate=${date}&onwaySeats=${seatsQuery}&tripPhase=return`
      );
    }
    //CASE 2: Return phase of a roundtrip
    else if (tripType === "roundtrip" && tripPhase === "return") {
      navigate(
        `/selectSeat/addpassenger?tripid=${tripid}&date=${date}&seats=${seatsQuery}&onwayTripId=${onwayTripId}&onwayDate=${onwayDate}&onwaySeats=${onwaySeats}`
      );
    }
    //CASE 3:one-way trip
    else {
      navigate(
        `/selectSeat/addpassenger?tripid=${tripid}&date=${date}&seats=${seatsQuery}`
      );
    }
  };

  if (tripLoading || seatsLoading) {
    return (
      <>
        <Navbar />
        <div className="seat-container">
          <div className="seat-container__loading">
            <FaSpinner />
            <p>Loading seat layout...</p>
          </div>
        </div>
      </>
    );
  }

  if (!seatsSuccess) {
    return (
      <>
        <Navbar />
        <div className="seat-container">
          <div className="seat-container__error">
            <FaExclamationCircle />
            <p>Failed to load seats. {seatsError?.message}</p>
          </div>
        </div>
      </>
    );
  }

  const pricePerSeat = trip?.price ? parseFloat(trip.price) : 0;
  const totalPrice = (selectedSeats.length * pricePerSeat).toFixed(2);

  // sleeper
  const busType = trip?.bus?.bus_type || "AC";
  const renderSeats = () => {
    if (busType === "Sleeper") {
      return (
        <div className="sleeper-layout">
          <div className="deck upper-deck">
            <h4>
              <MdAirlineSeatReclineNormal />
              Upper Deck
            </h4>
            <div className="deck-rows">
              {seatNumbers
                .filter((_, i) => i % 2 == 0) //example split upper/lower
                .map((num) => {
                  const seatData = seatInfoMap.get(num);
                  const genderPref = seatData?.gender_preference || "ANY";
                  const isWomenOnly = genderPref === "WOMEN_ONLY";
                  const isAvailable = availableSet.has(num);
                  const isSelected = selectedSeats.includes(num);
                  return (
                    <button
                      key={num}
                      className={`seat sleeper ${
                        !isAvailable ? "booked" : ""
                      } ${isSelected ? "selected" : ""} ${
                        isWomenOnly ? "women-only" : ""
                      }`}
                      disabled={!isAvailable}
                      onClick={() => toggleSeat(num, isAvailable)}
                      title={isWomenOnly ? "Reserved for Women" : ""}
                    >
                      {num}
                      {isWomenOnly && <span className="seat-icon">♀</span>}
                    </button>
                  );
                })}
            </div>
          </div>
          <div className="deck lower-deck">
            <h4>
              <MdAirlineSeatReclineNormal />
              Lower Deck
            </h4>
            <div className="deck-rows">
              {seatNumbers
                .filter((_, i) => i % 2 !== 0) //example split upper/lower
                .map((num) => {
                  const seatData = seatInfoMap.get(num);
                  const genderPref = seatData?.gender_preference || "ANY";
                  const isWomenOnly = genderPref === "WOMEN_ONLY";
                  const isAvailable = availableSet.has(num);
                  const isSelected = selectedSeats.includes(num);
                  return (
                    <button
                      key={num}
                      className={`seat sleeper ${
                        !isAvailable ? "booked" : ""
                      } ${isSelected ? "selected" : ""} ${
                        isWomenOnly ? "women-only" : ""
                      }`}
                      disabled={!isAvailable}
                      onClick={() => toggleSeat(num, isAvailable)}
                      title={isWomenOnly ? "Reserved for Women" : ""}
                    >
                      {num}
                      {isWomenOnly && <span className="seat-icon">♀</span>}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      );
    }
    //default 2*2 seat layout
    const perRow = 4;
    const rows = [];
    for (let i = 0; i < seatNumbers.length; i += perRow) {
      rows.push(seatNumbers.slice(i, i + perRow));
    }
    return rows.map((row, rIdx) => (
      <div className="seat-row" key={`row-${rIdx}`}>
        <div className="seat-block left">
          {row.slice(0, 2).map((num) => renderSeat(num))}
        </div>
        <div className="aisle" />
        <div className="seat-block right">
          {row.slice(2, 4).map((num) => renderSeat(num))}
        </div>
      </div>
    ));
  };
  //Helper render seat
  const renderSeat = (num) => {
    const seatData = seatInfoMap.get(num);
    const genderPref = seatData?.gender_preference || "ANY";
    const isWomenOnly = genderPref === "WOMEN_ONLY";
    const isAvailable = availableSet.has(num);
    const isSelected = selectedSeats.includes(num);
    return (
      <button
        key={num}
        className={`seat ${!isAvailable ? "booked" : ""} ${
          isSelected ? "selected" : ""
        } ${isWomenOnly ? "women-only" : ""}`}
        disabled={!isAvailable}
        onClick={() => toggleSeat(num, isAvailable)}
        title={isWomenOnly ? "Reserved for Women" : ""}
      >
        {num}
        {isWomenOnly && <span className="seat-icon">♀</span>}
      </button>
    );
  };
  return (
    <>
      {/* <Navbar /> */}
      <div className="seat-container">
        <div className="seat-container__content">
          {/* Left Section - Seat Selection */}
          <div className="seat-container__main">
            {/* Trip Info Header */}
            <div className="seat-container__header">
              <h1>
                <FaBus />
                {tripPhase === "onward"
                  ? "Select onward trip Seats"
                  : "Select Return Trip Seats"}
              </h1>
              <div className="seat-container__header-details">
                <div className="seat-container__header-details-item">
                  <FaMapMarkerAlt />
                  <span>
                    <strong>{trip?.source}</strong> →{" "}
                    <strong>{trip?.destination}</strong>
                  </span>
                </div>
                <div className="seat-container__header-details-item">
                  <FaCalendarAlt />
                  <span>
                    {new Date(date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="seat-container__header-details-item">
                  <FaClock />
                  <span>{trip?.departure_time}</span>
                </div>
                <div className="seat-container__header-details-item">
                  <FaBus />
                  <span>
                    <strong>{trip?.bus?.bus_name}</strong> (
                    {trip?.bus?.bus_type})
                  </span>
                </div>
                <div className="seat-container__header-details-item">
                  <FaRupeeSign />
                  <span>
                    <strong>₹{pricePerSeat}</strong> per seat
                  </span>
                </div>
              </div>
            </div>

            {/* Bus Visualization */}
            <div className="bus-wrapper">
              <div className="driver">
                <GiSteeringWheel />
                Driver
              </div>

              <div className="seat-grid">{renderSeats()}</div>
            </div>

            {/* Seat Legend */}
            <div className="legend">
              <h4>Seat Legend</h4>
              <div className="legend__grid">
                <div className="legend__item">
                  <div className="box box--available"></div>
                  <span>Available</span>
                </div>
                <div className="legend__item">
                  <div className="box box--selected"></div>
                  <span>Selected</span>
                </div>
                <div className="legend__item">
                  <div className="box box--booked"></div>
                  <span>Booked</span>
                </div>
                <div className="legend__item">
                  <div className="box box--women"></div>
                  <span>Women Only</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Booking Summary */}
          <div className="seat-container__sidebar">
            {/* <div className="seat-container__summary">
              <h3>
                <MdEventSeat />
                Booking Summary
              </h3>
              
              {selectedSeats.length > 0 ? (
                <>
                  <div className="seat-container__summary-item">
                    <label>Selected Seats:</label>
                    <div className="selected-seats">
                      {selectedSeats.map(seat => (
                        <span key={seat} className="seat-badge">{seat}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="seat-container__summary-item">
                    <label>Number of Seats:</label>
                    <span>{selectedSeats.length}</span>
                  </div>
                  
                  <div className="seat-container__summary-item">
                    <label>Price per Seat:</label>
                    <span>₹{pricePerSeat}</span>
                  </div>
                  
                  <div className="seat-container__summary-item">
                    <label>Total Amount:</label>
                    <span className="total">₹{totalPrice}</span>
                  </div>
                </>
              ) : (
                <p style={{ 
                  textAlign: 'center', 
                  color: '#999', 
                  padding: '20px',
                  fontSize: '14px' 
                }}>
                  No seats selected yet. Click on available seats to select.
                </p>
              )}
            </div> */}

            <button
              className="seat-container__book-btn"
              onClick={handleBookNow}
              disabled={selectedSeats.length === 0}
            >
              <FaCheckCircle />
              {tripType === "roundtrip" && tripPhase === "onward"
                ? "Proceed to Return Trip"
                : selectedSeats.length > 0
                ? `Proceed to Book (${selectedSeats.length} ${
                    selectedSeats.length === 1 ? "Seat" : "Seats"
                  })`
                : "Select Seats to Continue"}

              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
