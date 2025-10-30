import React, { useContext, useState } from "react";
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
  const seatNumbers = params.get("seats")?.split(",");
  const triipid = params.get("tripid");
  const travelDate = params.get("date");
  const [fareStart,setFareStart]=useState(0)
  const [fareEnd,setFareEnd]=useState(0)
  const [passengers, setPassengers] = useState(
    seatNumbers.map((seat) => ({
      seat_number: seat,
      name: "",
      age: "",
      gender: "",
      boarding_location: "",
      dropping_location: "",
    }))
  );

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip-details", triipid],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}bookings/trips/${triipid}/`);
      return response.data;
    },
  });
  console.log(trip ,'tripdataaaa')
  // const tripStopes = trip?.trip_stops || [];
  const tripStopes = trip?.trip_stops || [];
  console.log(tripStopes,'tripstopeesss from add passenger')

  const mutation = useMutation({
    mutationFn: async (data) =>
      axios.post(`${apiUrl}bookings/bookings/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: ({ data }) => {
      toast.success("Passenger details added successfully", {
        onClose: () => {
          const booking_id = data.booking_id;
          const totalamount = data.total_amount;
          navigate(
            `/payment?bookingId=${booking_id}&totalamount=${totalamount}&seats=${seatNumbers}`
          );
        },
        autoClose: 2000,
      });
    },
    onError: (error) => {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error(
          "Error adding passenger details. Please check and try again."
        );
      }
      console.log(error);
    },
  });
  const calculateFare=(boarding,dropping)=>{
    const start=tripStopes.find((s)=>s.stop_name===boarding)
    const end=tripStopes.find((s)=>s.stop_name===dropping)
    if(!start ||!end)return 0
    const fare=parseFloat(end.fare_from_start)-parseFloat(start.fare_from_start)
    return fare>0?fare:0
  }
  const handleChange = (index, field, value) => {
    const newData = [...passengers];
    newData[index][field] = value;
    //reacalculate fare if boarding or droppping changes
    if(field==="boarding_location"||field==="dropping_location"){
      const boarding=newData[index].boarding_location;
      const dropping=newData[index].dropping_location
      if (boarding&&dropping){
        newData[index].fare=calculateFare(boarding,dropping)
      }
    }
    setPassengers(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passengers.some((p) => !/^[A-Za-z\s]+$/.test(p.name.trim()))) {
      toast.error("Name should contain only letters");
      return;
    }
    if (
      passengers.some(
        (p) =>
          !p.name ||
          !p.age ||
          !p.gender ||
          !p.boarding_location ||
          !p.dropping_location
      )
    ) {
      toast.error("Please fill all passenger details");
      return;
    }
    mutation.mutate({
      trip_id: params.get("tripid"),
      booked_date: params.get("date"),
      seats: seatNumbers,
      passengers,
    });
  };

  if (isLoading) {
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

  return (
    <div className="add-passenger-page">
      {/* <Navbar /> */}
      <div className="add-passenger-container">
        <div className="page-header">
          <h2>Passenger Details</h2>
          <p className="subtitle">Fill in the details for all passengers</p>
        </div>

        {trip && (
          <div className="trip-summary">
            <div className="trip-summary__header">
              <FaBus className="icon" />
              <div>
                <h4>{trip.bus.bus_name}</h4>
                <span className="bus-type">{trip.bus.bus_type}</span>
              </div>
            </div>
            <div className="trip-summary__body">
              <div className="info-item">
                <FaMapMarkerAlt className="icon" />
                <span>
                  {trip.route.start_location} → {trip.route.end_location}
                </span>
              </div>
              <div className="info-item">
                <FaCalendar className="icon" />
                <span>
                  {new Date(travelDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="info-item">
                <MdEventSeat className="icon" />
                <span>
                  {seatNumbers.length} Seat(s): {seatNumbers.join(", ")}
                </span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="passenger-form">
          <div className="passengers-grid">
            {passengers.map((p, i) => (
              <div className="passenger-card" key={i}>
                <div className="passenger-card__header">
                  <h4>
                    <MdEventSeat /> Seat {p.seat_number}
                  </h4>
                  <span className="passenger-number">Passenger {i + 1}</span>
                </div>

                <div className="form-group">
                  <label htmlFor={`name-${i}`}>Full Name *</label>
                  <div className="input-wrapper">
                    <FaUser className="input-icon" />
                    <input
                      id={`name-${i}`}
                      type="text"
                      placeholder="Enter full name"
                      value={p.name}
                      onChange={(e) => handleChange(i, "name", e.target.value)}
                      required
                      disabled={mutation.isPending}
                    />
                  </div>
                </div>

                <div className="form-roww">
                  <div className="form-group">
                    <label htmlFor={`age-${i}`}>Age *</label>
                    <input
                      id={`age-${i}`}
                      type="number"
                      placeholder="Age"
                      value={p.age}
                      min="1"
                      max="120"
                      onChange={(e) => handleChange(i, "age", e.target.value)}
                      required
                      disabled={mutation.isPending}
                    />
                  </div>

                  <div className="form-group">
                    {/* <label htmlFor={`gender-${i}`}>Gender *</label>
                    <select
                      id={`gender-${i}`}
                      value={p.gender}
                      onChange={(e) => handleChange(i, "gender", e.target.value)}
                      required
                      disabled={mutation.isPending}
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="OTHER">Other</option>
                    </select> */}
                    <div className="gender-options">
                      <label>Gender:</label>

                      <label>
                        <input
                          type="radio"
                          name={`gender-${i}`}
                          value="M"
                          checked={p.gender === "M"}
                          onChange={(e) =>
                            handleChange(i, "gender", e.target.value)
                          }
                          required
                          disabled={mutation.isPending}
                        />
                        Male
                      </label>

                      <label>
                        <input
                          type="radio"
                          name={`gender-${i}`}
                          value="F"
                          checked={p.gender === "F"}
                          onChange={(e) =>
                            handleChange(i, "gender", e.target.value)
                          }
                          required
                          disabled={mutation.isPending}
                        />
                        Female
                      </label>

                      <label>
                        <input
                          type="radio"
                          name={`gender-${i}`}
                          value="OTHER"
                          checked={p.gender === "OTHER"}
                          onChange={(e) =>
                            handleChange(i, "gender", e.target.value)
                          }
                          required
                          disabled={mutation.isPending}
                        />
                        Other
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`boarding-${i}`}>Boarding Point *</label>
                  <div className="input-wrapper">
                    <FaMapMarkerAlt className="input-icon" />
                    <select
                      id={`boarding-${i}`}
                      value={p.boarding_location}
                      onChange={(e) =>
                        handleChange(i, "boarding_location", e.target.value)
                      }
                      required
                      disabled={mutation.isPending}
                    >
                      <option value="">Select boarding point</option>
                      {tripStopes.map((stop, index) => (
                        <option key={index} value={stop.stop_name}>
                          {/* {stop.stop_name} - {stop.arrival_time} */}
                          {stop.stop_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor={`dropping-${i}`}>Dropping Point *</label>
                  <div className="input-wrapper">
                    <FaMapMarkerAlt className="input-icon" />
                    <select
                      id={`dropping-${i}`}
                      value={p.dropping_location}
                      onChange={(e) =>
                        handleChange(i, "dropping_location", e.target.value)
                      }
                      required
                      disabled={mutation.isPending}
                    >
                      <option value="">Select dropping point</option>
                      {tripStopes.map((stop, index) => (
                        <option key={index} value={stop.stop_name}>
                          {/* {stop.stop_name} - {stop.arrival_time} */}
                          {stop.stop_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="fare-display"> Fare: ₹{p.fare ? p.fare.toFixed(2) : "--"}</div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate(-1)}
              disabled={mutation.isPending}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn-continue"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Processing..." : "Continue to Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPassenger;
