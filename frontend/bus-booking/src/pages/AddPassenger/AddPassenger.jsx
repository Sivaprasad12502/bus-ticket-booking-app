import React, { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Context } from "../../context/Context";
import { toast } from "react-toastify";
import { FaUser, FaCalendar, FaMapMarkerAlt, FaBus } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import Navbar from "../../component/Navbar/Navbar";
import "./AddPassenger.scss";

const AddPassenger = () => {
  const { apiUrl, token } = useContext(Context);
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);

  //---Trip info ---
  const tripId = params.get("tripid"); //Return trip id(current page)
  const date = params.get("date");
  const seats = params.get("seats")?.split(",") || [];
  //--onward trip info(for previous) ---
  const onwayTripId = params.get("onwayTripId");
  const onwayDate = params.get("onwayDate");
  const onwaySeats = params.get("onwaySeats")?.split(",") || [];

  const isRoundTrip = !!onwayTripId;

  //--- State for ONWARD passengers ---
  const [onwardPassengers, setOnwardPassengers] = useState(
    (isRoundTrip ? onwaySeats : seats).map((seat) => ({
      seat_number: seat,
      name: "",
      age: "",
      gender: "",
      boarding_location: "",
      dropping_location: "",
      fare: 0,
    }))
  );
  // State for RETURN passengers (only for round trip)
  const [returnPassengers, setReturnPassengers] = useState(
    isRoundTrip
      ? seats.map((seat) => ({
          seat_number: seat,
          name: "",
          age: "",
          gender: "",
          boarding_location: "",
          dropping_location: "",
          fare: 0,
        }))
      : []
  );
  // --- Fetch Onward Trip ---
  const { data: onwayTrip, isLoading: isLoadingOnWay } = useQuery({
    queryKey: ["onway-trip", onwayTripId || tripId],
    enabled: !!(onwayTripId || tripId),
    queryFn: async () => {
      const id = onwayTripId || tripId;
      const response = await axios.get(`${apiUrl}bookings/trips/${id}/`);
      return response.data;
    },
  });

  //--- Fetch Return Trip ---
  const { data: returnTrip, isLoading: isLoadingReturn } = useQuery({
    queryKey: ["return-trip", tripId],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/trips/${tripId}/`);
      return res.data;
    },
    enabled: isRoundTrip && !!tripId,
  });
  const onwardTripStops = onwayTrip?.trip_stops || [];
  const returnTripStops = returnTrip?.trip_stops || [];

  // Calculate total fare for onward trip
  const onwardTotalFare = useMemo(() => {
    return onwardPassengers.reduce((sum, p) => sum + (p.fare || 0), 0);
  }, [onwardPassengers]);
  // calculate total fare for return trip
  const returnTotalFare = useMemo(() => {
    return returnPassengers.reduce((sum, p) => sum + (p.fare || 0), 0);
  }, [returnPassengers]);
  // Grand total
  const grandTotal = onwardTotalFare + returnTotalFare;
  const bookingMutation = useMutation({
    mutationFn: async (data) =>
      axios.post(`${apiUrl}bookings/bookings/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  });
  // calculate fare based on boarding and dropping points
  const calculateFare = (stopes, boarding, dropping) => {
    const start = stopes.find((s) => s.stop_name === boarding);
    const end = stopes.find((s) => s.stop_name === dropping);
    if (!start || !end) return 0;
    const startFare = parseFloat(start.fare_from_start) || 0;
    const endFare = parseFloat(end.fare_from_start) || 0;
    const fare = endFare - startFare;
    return fare >= 0 ? fare : 0;
  };

  // handle passenger field changes for ONWARD trip
  const handleOnwardChange = (index, field, value) => {
    const updated = [...onwardPassengers];
    updated[index][field] = value;
    // Recalculate fare if boarding or dropping location changes
    if (field === "boarding_location" || field === "dropping_location") {
      const { boarding_location, dropping_location } = updated[index];
      if (boarding_location && dropping_location) {
        const boardingIndex = onwardTripStops.findIndex(
          (s) => s.stop_name === boarding_location
        );
        const droppingIndex = onwardTripStops.findIndex(
          (s) => s.stop_name === dropping_location
        );
        if (droppingIndex <= boardingIndex) {
          toast.warning("Dropping point must be after boarding poing");
          updated[index].dropping_location = "";
          updated[index].fare = 0;
        } else {
          updated[index].fare = calculateFare(
            onwardTripStops,
            boarding_location,
            dropping_location
          );
        }
      } else {
        updated[index].fare = 0;
      }
    }
    setOnwardPassengers(updated);
  };
  // handle passenger field changes for RETURN trip
  const handleReturnChange = (index, field, value) => {
    const updated = [...returnPassengers];
    updated[index][field] = value;
    // Recalculate fare if boarding or dropping location changes
    if (field === "boarding_location" || field === "dropping_location") {
      const { boarding_location, dropping_location } = updated[index];
      if (boarding_location && dropping_location) {
        const boardingIndex = returnTripStops.findIndex(
          (s) => s.stop_name === boarding_location
        );
        const droppingIndex = returnTripStops.findIndex(
          (s) => s.stop_name === dropping_location
        );
        if (droppingIndex <= boardingIndex) {
          toast.warning("Dropping point must be after boarding poing");
          updated[index].dropping_location = "";
          updated[index].fare = 0;
        } else {
          updated[index].fare = calculateFare(
            returnTripStops,
            boarding_location,
            dropping_location
          );
        }
      } else {
        updated[index].fare = 0;
      }
    }
    setReturnPassengers(updated);
  };
  // Validate passenger data
  const validatePassengers = (passengers, tripName) => {
    //check if all fields are filled
    for (const p of passengers) {
      if (
        !p.name ||
        !p.age ||
        !p.gender ||
        !p.boarding_location ||
        !p.dropping_location
      ) {
        toast.error(`Please fill all passenger details for ${tripName}`);
        return false;
      }
    }
    // Validate names (only letters and spaces)
    if (passengers.some((p) => !/^[A-Za-z\s]+$/.test(p.name.trim()))) {
      toast.error(`Name should contain only letters and spaces (${tripName})`);
      return false;
    }
    // Validate fare
    if (passengers.some((p) => !p.fare || p.fare <= 0)) {
      toast.error(
        `Please select valid boarding and dropping points for all passengers (${tripName})`
      );
      return false;
    }
    return true;
  };
  //--- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // validate passenger details before submission
    if (
      !validatePassengers(
        onwardPassengers,
        isRoundTrip ? "onward Trip" : "Trip"
      )
    ) {
      return;
    }
    if (isRoundTrip && !validatePassengers(returnPassengers, "Return Trip")) {
      return;
    }
    const payload={
      onward_trip_id:isRoundTrip?onwayTripId:tripId,
      onward_date:isRoundTrip?onwayDate:date,
      onward_seats:isRoundTrip?onwaySeats:seats,
      onward_passengers:onwardPassengers,
    }
    // Add ruturn trip date if round trip
    if(isRoundTrip){
      payload.return_trip_id=tripId;
      payload.return_date=date;
      payload.return_seats=seats;
      payload.return_passengers=returnPassengers;
    }
    try {
      toast.info("Processing booking...")
      const res=await axios.post(`${apiUrl}bookings/bookings/`,payload,{
        headers:{Authorization:`Bearer ${token}`}
      })
      //Backend reutrns multiple bookings if round trip
      const {bookings,total_amount}=res.data;
      toast.success("booking successful!,",{
        onClose:()=>{
          if(isRoundTrip&&bookings.length===2){
            navigate(`/payment?onwardId=${bookings[0].booking_id}&returnId=${bookings[1].booking_id}&totalamount=${total_amount}`)
          }else if (bookings?.length===1){
            navigate(`/payment?onwardId=${bookings[0].booking_id}&totalamount=${total_amount}`)
          }
        },
        autoClose:1500
      })
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "booking failed. Please try again";
      toast.error(errorMessage);
    }
  };
  //Loading state
  if (isLoadingOnWay || (isRoundTrip && isLoadingReturn)) {
    return (
      <div className="add-passenger-page">
        {/* <Navbar /> */}
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading trip details...</p>
        </div>
      </div>
    );
  }
  // Error state - no trip data
  if (!onwayTrip || (isRoundTrip && !returnTrip)) {
    return (
      <div className="add-passenger-page">
        <div className="error-container">
          <p>Unable to load trip details. Please try again.</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-passenger-page">
      {/* <Navbar /> */}
      <div className="add-passenger-container">
        <div className="page-header">
          <h2>Passenger Details</h2>
          <p className="subtitle">
            {isRoundTrip
              ? "Onward + Return Trip passenger Details"
              : "Enter details for your journey"}
          </p>
        </div>

        {/* ONWARD TRIP */}
        <div className="trip-section">
          <div
            className={`trip-summary ${
              isRoundTrip ? "trip-summary--onward" : ""
            }`}
          >
            {isRoundTrip && <div className="trip-badge">Onward Journey</div>}
            <div className="trip-summary__header">
              <FaBus className="icon" />
              <div>
                <h4>{onwayTrip.bus.bus_name}</h4>
                <span className="bus-type">{onwayTrip.bus.bus_type} {onwayTrip.bus.layout_type}</span>
              </div>
            </div>
            <div className="trip-summary__body">
              <div className="info-item">
                <FaMapMarkerAlt className="icon" />
                <span>
                  {onwayTrip.route.start_location} →{" "}
                  {onwayTrip.route.end_location}
                </span>
              </div>
              <div className="info-item">
                <FaCalendar className="icon" />
                <span>
                  {new Date(isRoundTrip ? onwayDate : date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
              <div className="info-item">
                <MdEventSeat className="icon" />
                <span>
                  {(isRoundTrip ? onwaySeats : seats).length} Seat(s):{" "}
                  {(isRoundTrip ? onwaySeats : seats).join(", ")}
                </span>
              </div>
            </div>
          </div>

          <form className="passenger-form">
            <div className="passengers-grid">
              {onwardPassengers.map((p, i) => (
                <div className="passenger-card" key={i}>
                  <div className="passenger-card__header">
                    <h4>
                      <MdEventSeat /> Seat {p.seat_number}
                    </h4>
                    <span className="passenger-number">Passenger {i + 1}</span>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`onward-name-${i}`}>Full Name *</label>
                    <div className="input-wrapper">
                      <FaUser className="input-icon" />
                      <input
                        id={`onward-name-${i}`}
                        type="text"
                        placeholder="Enter full name"
                        value={p.name}
                        onChange={(e) =>
                          handleOnwardChange(i, "name", e.target.value)
                        }
                        required
                        disabled={bookingMutation.isPending}
                      />
                    </div>
                  </div>

                  <div className="form-roww">
                    <div className="form-group">
                      <label htmlFor={`onward-age-${i}`}>Age *</label>
                      <input
                        id={`onward-age-${i}`}
                        type="number"
                        placeholder="Age"
                        value={p.age}
                        min="1"
                        max="120"
                        onChange={(e) =>
                          handleOnwardChange(i, "age", e.target.value)
                        }
                        required
                        disabled={bookingMutation.isPending}
                      />
                    </div>

                    <div className="form-group">
                      <div className="gender-options">
                        <label>Gender *</label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`onward-gender-${i}`}
                            value="M"
                            checked={p.gender === "M"}
                            onChange={(e) =>
                              handleOnwardChange(i, "gender", e.target.value)
                            }
                            required
                            disabled={bookingMutation.isPending}
                          />
                          Male
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`onward-gender-${i}`}
                            value="F"
                            checked={p.gender === "F"}
                            onChange={(e) =>
                              handleOnwardChange(i, "gender", e.target.value)
                            }
                            required
                            disabled={bookingMutation.isPending}
                          />
                          Female
                        </label>
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`onward-gender-${i}`}
                            value="OTHER"
                            checked={p.gender === "OTHER"}
                            onChange={(e) =>
                              handleOnwardChange(i, "gender", e.target.value)
                            }
                            required
                            disabled={bookingMutation.isPending}
                          />
                          Other
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`onward-boarding-${i}`}>
                      Boarding Point *
                    </label>
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <select
                        id={`onward-boarding-${i}`}
                        value={p.boarding_location}
                        onChange={(e) =>
                          handleOnwardChange(
                            i,
                            "boarding_location",
                            e.target.value
                          )
                        }
                        required
                        disabled={bookingMutation.isPending}
                      >
                        <option value="">Select boarding point</option>
                        {onwardTripStops.map((stop, index) => (
                          <option key={index} value={stop.stop_name}>
                            {stop.stop_name}
                            {stop.arrival_time && ` - ${stop.arrival_time}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`onward-dropping-${i}`}>
                      Dropping Point *
                    </label>
                    <div className="input-wrapper">
                      <FaMapMarkerAlt className="input-icon" />
                      <select
                        id={`onward-dropping-${i}`}
                        value={p.dropping_location}
                        onChange={(e) =>
                          handleOnwardChange(
                            i,
                            "dropping_location",
                            e.target.value
                          )
                        }
                        required
                        disabled={bookingMutation.isPending}
                      >
                        <option value="">Select dropping point</option>
                        {onwardTripStops.map((stop, index) => (
                          <option key={index} value={stop.stop_name}>
                            {stop.stop_name}
                            {stop.arrival_time && ` - ${stop.arrival_time}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="fare-display">
                    Fare: ₹{p.fare ? p.fare.toFixed(2) : "0.00"}
                  </div>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* RETURN TRIP */}
        {isRoundTrip && returnTrip && (
          <div className="trip-section">
            <div className={`trip-summary  trip-summary--return`}>
              <div className="trip-badge">Return Journey</div>
              <div className="trip-summary__header">
                <FaBus className="icon" />
                <div>
                  <h4>{returnTrip.bus.bus_name}</h4>
                  <span className="bus-type">{returnTrip.bus.bus_type}  {returnTrip.bus.layout_type}</span>
                </div>
              </div>
              <div className="trip-summary__body">
                <div className="info-item">
                  <FaMapMarkerAlt className="icon" />
                  <span>
                    {returnTrip.route.start_location} →{" "}
                    {returnTrip.route.end_location}
                  </span>
                </div>
                <div className="info-item">
                  <FaCalendar className="icon" />
                  <span>
                    {new Date(date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="info-item">
                  <MdEventSeat className="icon" />
                  <span>
                    {seats.length} Seat(s):{seats.join(",")}
                  </span>
                </div>
              </div>
            </div>

            <form className="passenger-form">
              <div className="passengers-grid">
                {returnPassengers.map((p, i) => (
                  <div className="passenger-card" key={i}>
                    <div className="passenger-card__header">
                      <h4>
                        <MdEventSeat /> Seat {p.seat_number}
                      </h4>
                      <span className="passenger-number">
                        Passenger {i + 1}
                      </span>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`return-name-${i}`}>Full Name *</label>
                      <div className="input-wrapper">
                        <FaUser className="input-icon" />
                        <input
                          id={`return-name-${i}`}
                          type="text"
                          placeholder="Enter full name"
                          value={p.name}
                          onChange={(e) =>
                            handleReturnChange(i, "name", e.target.value)
                          }
                          required
                          disabled={bookingMutation.isPending}
                        />
                      </div>
                    </div>

                    <div className="form-roww">
                      <div className="form-group">
                        <label htmlFor={`return-age-${i}`}>Age *</label>
                        <input
                          id={`return-age-${i}`}
                          type="number"
                          placeholder="Age"
                          value={p.age}
                          min="1"
                          max="120"
                          onChange={(e) =>
                            handleReturnChange(i, "age", e.target.value)
                          }
                          required
                          disabled={bookingMutation.isPending}
                        />
                      </div>

                      <div className="form-group">
                        <div className="gender-options">
                          <label>Gender *</label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name={`return-gender-${i}`}
                              value="M"
                              checked={p.gender === "M"}
                              onChange={(e) =>
                                handleReturnChange(i, "gender", e.target.value)
                              }
                              required
                              disabled={bookingMutation.isPending}
                            />
                            Male
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name={`return-gender-${i}`}
                              value="F"
                              checked={p.gender === "F"}
                              onChange={(e) =>
                                handleReturnChange(i, "gender", e.target.value)
                              }
                              required
                              disabled={bookingMutation.isPending}
                            />
                            Female
                          </label>
                          <label className="radio-label">
                            <input
                              type="radio"
                              name={`return-gender-${i}`}
                              value="OTHER"
                              checked={p.gender === "OTHER"}
                              onChange={(e) =>
                                handleReturnChange(i, "gender", e.target.value)
                              }
                              required
                              disabled={bookingMutation.isPending}
                            />
                            Other
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`return-boarding-${i}`}>
                        Boarding Point *
                      </label>
                      <div className="input-wrapper">
                        <FaMapMarkerAlt className="input-icon" />
                        <select
                          id={`return-boarding-${i}`}
                          value={p.boarding_location}
                          onChange={(e) =>
                            handleReturnChange(
                              i,
                              "boarding_location",
                              e.target.value
                            )
                          }
                          required
                          disabled={bookingMutation.isPending}
                        >
                          <option value="">Select boarding point</option>
                          {returnTripStops.map((stop, index) => (
                            <option key={index} value={stop.stop_name}>
                              {stop.stop_name}
                              {stop.arrival_time && ` - ${stop.arrival_time}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`return-dropping-${i}`}>
                        Dropping Point *
                      </label>
                      <div className="input-wrapper">
                        <FaMapMarkerAlt className="input-icon" />
                        <select
                          id={`return-dropping-${i}`}
                          value={p.dropping_location}
                          onChange={(e) =>
                            handleReturnChange(
                              i,
                              "dropping_location",
                              e.target.value
                            )
                          }
                          required
                          disabled={bookingMutation.isPending}
                        >
                          <option value="">Select dropping point</option>
                          {returnTripStops.map((stop, index) => (
                            <option key={index} value={stop.stop_name}>
                              {stop.stop_name}
                              {stop.arrival_time && ` - ${stop.arrival_time}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="fare-display">
                      Fare: ₹{p.fare ? p.fare.toFixed(2) : "0.00"}
                    </div>
                  </div>
                ))}
              </div>
            </form>
          </div>
        )}

        {/**TOTAL FARE SECTION */}
        <div className="total-fare-section">
          {isRoundTrip ? (
            <>
              <div className="fare-breakdown">
                <div className="fare-item">
                  <span>Onward Trip Fare:</span>
                  <span className="amount">₹{onwardTotalFare.toFixed(2)}</span>
                </div>
                <div className="fare-item">
                  <span>Return Trip Fare:</span>
                  <span className="amount">₹{returnTotalFare.toFixed(2)}</span>
                </div>
              </div>
              <div className="grand-total">
                <span>Grand Total:</span>
                <span className="amount">₹{grandTotal.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="total-fare">
              <span>Total Fare:</span>
              <span className="amount">₹{onwardTotalFare.toFixed(2)}</span>
            </div>
          )}
        </div>
        {/**Form ACTIONS */}
        <div className="form-actions">
          <button
            
            className="btn-back"
            onClick={() => navigate(-1)}
            disabled={bookingMutation.isPending}
          >
            Back
          </button>
          <button  className="btn-continue" onClick={handleSubmit}>
            {bookingMutation.isPending ? (
              <span className="spinner">Processing</span>
            ) : (
              "continue to payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPassenger;
