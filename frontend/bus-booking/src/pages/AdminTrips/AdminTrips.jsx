import React, { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../../context/Context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminTrips.scss";
import AdminSeats from "../../component/AdminSeats/AdminSeats";
import {
  FaBus,
  FaChair,
  FaClock,
  FaEdit,
  FaRupeeSign,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { MdConfirmationNumber, MdEventSeat } from "react-icons/md";
import { toast } from "react-toastify";
const AdminTrips = () => {
  const { apiUrl, adminAccessToken } = useContext(Context);
  const queryClient = useQueryClient();
  const { values, setValues, handleChange, resetForm } = useForm({
    bus_id: "",
    route_id: "",
    operator_id: "",
    departure: "",
    arrival: "",
    price: "",
  });
  const [editingTrip, setEditingTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  // Fetch buses and routes for dropdowns
  const {
    data: buses,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["adminBuses"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/admin/buses/`, {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      });
      return res.data;
    },
    onSuccess: (buses) => {
      console.log("Admin Buses data:", buses);
    },
    onError: (error) => {
      console.error("Admin Buses error:", error);
    },
  });

  const { data: routes } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/admin/routes/`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return res.data;
    },
    onError: (error) => {
      console.log("fetching error in routes", error);
    },
  });
  const { data: operators } = useQuery({
    queryKey: ["operators"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}users/operators/`, {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      });
      return res.data;
    },
    onSuccess: (operators) => {
      console.log("Admin Operators data:", operators);
    },
    onError: (error) => {
      console.error("Admin Operators error:", error);
    },
  });

  // Fetch all trips
  const { data: trips, isLoading: isLoadingTrips } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/admin/trips/`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return res.data;
    },
  });
  if (trips) {
    console.log("Admin trips data", trips);
  }
  const addTrip = useMutation({
    mutationFn: async (trip) => {
      const res = await axios.post(`${apiUrl}bookings/admin/trips/`, trip, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"]);
      resetForm();
    },
    onError: (error) => {
      console.log("Error in adding trip", error);
    },
    //Edit Trip
  });
  const editTrip = useMutation({
    mutationFn: async (trip) => {
      const res = await axios.put(
        `${apiUrl}bookings/admin/trips/${trip.id}/`,
        trip,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"]);
      setEditingTrip(null);
      resetForm();
    },
  });
  const deleteTrip = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${apiUrl}bookings/admin/trips/${id}/`, {
        headers: { authorization: `Bearer ${adminAccessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["trips"]);
    },
    onError: (error) => {
      console.log("error in deleting trip", error);
    },
  });
  const { data: tripStopes } = useQuery({
    queryKey: ["tripStops", selectedTrip?.id],
    queryFn: async () => {
      if (!selectedTrip) return [];
      const res = await axios.get(
        `${apiUrl}bookings/admin/trips/${selectedTrip.id}/tripstops/`,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    enabled: !!selectedTrip,
  });
  //Trip Stop form
  const [editingStop, seEditingStop] = useState(null);
  const {
    values: stopValues,
    setValues: setStopValues,
    handleChange: handleStopchange,
    resetForm: resetStopForm,
  } = useForm({
    route_stop: "",
    arrival_time: "",
    fare_from_start: "",
  });
  const addStop = useMutation({
    mutationFn: async (stop) => {
      const res = await axios.post(
        `${apiUrl}bookings/admin/trips/${selectedTrip.id}/tripstops/`,
        stop,
        { headers: { Authorization: `Bearer ${adminAccessToken}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tripStops", selectedTrip.id]);
      resetStopForm();
    },
  });
  const editStop = useMutation({
    mutationFn: async (stop) => {
      const res = await axios.put(
        `${apiUrl}bookings/admin/tripstops/${stop.id}/`,
        stop,
        { headers: { Authorization: `Bearer ${adminAccessToken}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tripStops", selectedTrip.id]);
      seEditingStop(null);
      resetStopForm();
    },
    onError: (err) => {
      console.error("error editing stop:", err);
    },
  });
  const deleteStop = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(
        `${apiUrl}bookings/admin/tripstops/${id}/`,
        { headers: { Authorization: `Bearer ${adminAccessToken}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tripStops", selectedTrip.id]);

      // resetStop();
    },
  });
  //Time conversion function

  //Check if operator already assigned to another trip
  const isOperatorAsssigned=(operatorId,currentTripId=null)=>{
    if(!trips) return false;
    return trips.some((trip)=>{
      return trip.operator.id===operatorId && trip.id!==currentTripId
    })
  }
  const convertTo24Hour = (time12) => {
    if (!time12) return "";
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    // Convert to number
    hours = parseInt(hours);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    }
    if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };
  const handleTripSubmit = (e) => {
    e.preventDefault();
    const operatorId=Number(values.operator_id)
    // if editing allow same oparator for same trip
    const currentTripId=editingTrip?editingTrip.id:null;
    if(isOperatorAsssigned(operatorId,currentTripId)){
      toast.error("Operator already assigned to another trip")
      return
    }
    if (editingTrip) editTrip.mutate({ ...editingTrip, ...values });
    else addTrip.mutate(values);
  };
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setValues({
      bus_id: trip.bus.id,
      route_id: trip.route.id,
      operator_id: trip.operator.id,
      departure: trip.departure,
      arrival: trip.arrival,
      price: trip.price,
    });
  };
  const handleStopSubmit = (e) => {
    e.preventDefault();
    console.log("stop form values", stopValues);
    if (editingStop) editStop.mutate({ ...editingStop, ...stopValues });
    else addStop.mutate(stopValues);
  };
  const handleEditStop = (stop) => {
    seEditingStop(stop);
    setStopValues({
      route_stop: stop.route_stop,
      arrival_time: convertTo24Hour(stop.arrival_time),
      fare_from_start: stop.fare_from_start,
    });
  };
  useEffect(() => {
    if (editingTrip) {
      setTimeout(() => {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        inputRef.current.focus();
      });
    }
  }, [editingTrip]);
  if (!buses) {
    return <div>Loading...buses</div>;
  }
  if (!routes) {
    return <div>Loading ...rotes</div>;
  }
  return (
    <div className="admin-trip-page">
      <h2>
        <MdConfirmationNumber /> Manage Trips
      </h2>

      {/* Trip form */}
      <form
        onSubmit={handleTripSubmit}
        className="admin-trip-form"
        ref={formRef}
      >
        <div className="form-group">
          <label htmlFor="bus_id">
            <FaBus /> Select Bus
          </label>
          <select
            name="bus_id"
            value={values.bus_id}
            onChange={handleChange}
            required
            ref={inputRef}
          >
            <option value="">Select Bus</option>
            {buses?.map((b) => (
              <option key={b.id} value={b.id}>
                {b.bus_name} {b.bus_type} {b.layout_type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="route_id">Select Route</label>
          <select
            name="route_id"
            value={values.route_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Route</option>
            {routes?.map((r) => (
              <option key={r.id} value={r.id}>
                {r.start_location} → {r.end_location}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="operator_id">Select Operator</label>
          <select
            name="operator_id"
            value={values.operator_id}
            onChange={(e)=>{
              const operatorId=Number(e.target.value) 
              if(isOperatorAsssigned(operatorId,editingTrip?.id)){
                toast.error("This operator is already assigned to another trip")
              }
              handleChange(e)}}
            required
          >
            <option value="">Select Operator</option>
            {operators?.map((o) => (
              <option key={o.id} value={o.id}>
                {o.username} - {o.company_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="departure">Enter departure time and date</label>
          <input
            type="datetime-local"
            name="departure"
            placeholder="departure"
            value={values.departure}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="arrival">Enter arrival time and date</label>
          <input
            type="datetime-local"
            name="arrival"
            value={values.arrival}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            name="price"
            value={values.price}
            placeholder="Price"
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn--primary">
          {editingTrip ? "Update Trip" : "Add Trip"}
        </button>
        {editingTrip && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setEditingTrip(null), resetForm();
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Trip List */}
      {isLoading ? (
        <p>Loading trips...</p>
      ) : (
        <ul className="admin-list">
          {trips?.map((t) => (
            <li key={t.id}>
              <h2>
                <FaBus /> {t.bus.bus_name} — {t.route.start_location} →{" "}
                {t.route.end_location}
              </h2>
              <br />
              <span>
                operator: {t.operator?.username} - {t.operator?.company_name}
              </span>
              <br />
              <span>
                <FaClock /> {t.departure} → {t.arrival} <FaRupeeSign /> ₹
                {t.price}
              </span>
              <div className="actions">
                <button
                  className="btn btn--edit"
                  onClick={() => handleEditTrip(t)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn btn--delete"
                  onClick={() => deleteTrip.mutate(t.id)}
                >
                  <FaTrash /> Delete
                </button>
                <button
                  onClick={() =>
                    setSelectedTrip(selectedTrip?.id === t.id ? null : t)
                  }
                  className="btn btn--managestops"
                >
                  {selectedTrip?.id === t.id && selectedTrip.view !== "seats"
                    ? "Close Stops"
                    : "Manage Stops"}
                </button>
                <button
                  onClick={() => setSelectedTrip({ ...t, view: "seats" })}
                  className="btn btn--manageseats"
                >
                  <MdEventSeat /> Manage Seats
                </button>
              </div>
              {/* Manage Stops */}
              {selectedTrip?.id === t.id && (
                <>
                  {selectedTrip.view === "seats" ? (
                    <AdminSeats
                      tripId={selectedTrip.id}
                      onBack={() => setSelectedTrip(null)}
                      bus={t.bus}
                    />
                  ) : (
                    <div className="stops-panel">
                      <h3>Trip Stops for </h3>
                      <form onSubmit={handleStopSubmit} className="stops-form">
                        <div className="form-group">
                          <label htmlFor="route_stop">Stop Name</label>
                          <select
                            name="route_stop"
                            value={stopValues.route_stop}
                            onChange={handleStopchange}
                            required
                          >
                            <option value="">Select Stop</option>
                            {t.route.stops?.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.stop_name} distance from start:{" "}
                                {s.distance_from_start} (km)
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="arrival_time">Arrival Time</label>
                          <input
                            type="time"
                            name="arrival_time"
                            value={stopValues.arrival_time}
                            onChange={handleStopchange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="fare_from_start">
                            Fare from Start
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="fare_from_start"
                            placeholder="Fare (₹)"
                            value={stopValues.fare_from_start}
                            onChange={handleStopchange}
                          />
                        </div>
                        <button type="submit" className="btn btn--primary">
                          {editingStop ? "Update Stop" : "Add Stop"}
                        </button>
                        {editingStop && (
                          <button
                            className="btn btn--secondary"
                            onClick={() => {
                              seEditingStop(false);
                              resetStopForm();
                            }}
                          >
                            Cancel
                          </button>
                        )}
                      </form>

                      <div className="stops-list">
                        {tripStopes?.length == 0 ? (
                          <p>No stops added</p>
                        ) : (
                          tripStopes?.map((s) => (
                            <div key={s.id} className="stop-card">
                              <span>
                                stop name: {s.stop_name} {s.distance_from_start}{" "}
                                (km)
                              </span>
                              <span>fare from start: ₹{s.fare_from_start}</span>
                              <span>arrival time: {s.arrival_time}</span>
                              <div>
                                <button
                                  onClick={() => handleEditStop(s)}
                                  className="btn btn--edit"
                                >
                                  <FaEdit /> Edit
                                </button>
                                <button
                                  onClick={() => deleteStop.mutate(s.id)}
                                  className="btn btn--delete"
                                >
                                  <FaTrash /> Delete
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminTrips;
