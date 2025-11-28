import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Context } from "../../context/Context";
import useForm from "../../hooks/useForm/useForm";
import { MdLogout } from "react-icons/md";
import axios from "axios";
import "./OperatorTripManageMent.scss";
import { FaBus, FaRupeeSign, FaClock } from "react-icons/fa";
const OperatorTripManageMent = () => {
  const {
    apiUrl,
    operator,
    setOperator,
    operatorAccessToken,
    setOperatorAccessToken,
    operatorRefreshToken,
    setOperatorRefreshToken,
  } = useContext(Context);
  console.log("operator info in trip management", operator);
  const mutation = useMutation({
    mutationFn: async () => {
      return axios.post(
        `${apiUrl}users/operator/logout/`,
        { refresh: operatorRefreshToken },
        {
          headers: {
            Authorization: `Bearer ${operatorAccessToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      console.log("operator logged out successfully");
      setOperatorAccessToken(null);
      setOperatorRefreshToken(null);
      setOperator({});
    },
    onError: (error) => {
      console.error("Admin Logout failed:", error);
    },
  });
  ////////////////////////
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

  // Fetch all trips
  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await axios.get(
        `${apiUrl}bookings/operator/${operator.id}/trips/`,
        {
          headers: { Authorization: `Bearer ${operatorAccessToken}` },
        }
      );
      return res.data;
    },
  });
  if (trips) {
    console.log("operator trips data", trips);
  }

  const editTrip = useMutation({
    mutationFn: async (trip) => {
      console.log("trip data to be edited", trip);
      const res = await axios.put(
        `${apiUrl}bookings/operator/${operator.id}/trips/`,
        trip,
        {
          headers: { Authorization: `Bearer ${operatorAccessToken}` },
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
    mutationFn: async (trip) => {
      const res = await axios.delete(
        `${apiUrl}bookings/operator/${operator.id}/trips/`,

        {
          data: { id: trip.id },
          headers: { Authorization: `Bearer ${operatorAccessToken}` },
        }
      );
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
        `${apiUrl}bookings/operator/trips/${selectedTrip.id}/tripstops/`,
        {
          headers: { Authorization: `Bearer ${operatorAccessToken}` },
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
        `${apiUrl}bookings/operator/trips/${selectedTrip.id}/tripstops/`,
        stop,
        { headers: { Authorization: `Bearer ${operatorAccessToken}` } }
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
        `${apiUrl}bookings/operator/tripstops/${stop.id}/`,
        stop,
        { headers: { Authorization: `Bearer ${operatorAccessToken}` } }
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
        `${apiUrl}bookings/operator/tripstops/${id}/`,
        { headers: { Authorization: `Bearer ${operatorAccessToken}` } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tripStops", selectedTrip.id]);

      // resetStop();
    },
  });
  //Time conversion function
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
    if (editingTrip) editTrip.mutate({ ...editingTrip, ...values });
    console.log("trip form values", values);
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

  return (
    <div className="operator-trip">
      <nav>
        <div>
          <span>{operator?.username}</span>
        </div>
        <button onClick={() => mutation.mutate()}>
          <MdLogout />
          Logout
        </button>
      </nav>
      <div className="operator-trip-page">
        <h2>Manage Trips</h2>

        {/* Trip List */}
        {isLoading ? (
          <p>Loading trips...</p>
        ) : trips.length === 0 ? (
          <p>No trips available</p>
        ) : (
          <ul className="trip-list">
            {trips?.map((t) => (
              <li key={t.id}>
                <h2>
                  <FaBus /> {t.bus.bus_name} — {t.route.start_location} →{" "}
                  {t.route.end_location}
                </h2>
                <br />
                <span>operator: {t.operator?.username} - </span>
                <span>company_name: {t.operator?.company_name}</span>
                <br />
                <span>
                  {" "}
                  <FaClock />
                  {t.departure} → {t.arrival} <FaRupeeSign /> ₹{t.price}
                </span>
                <div className="actions">
                  <button
                    onClick={() => {
                      handleEditTrip(t),
                        setEditingTrip(editingTrip?.id === t.id ? null : t);
                    }}
                    className="btn btn--edit"
                  >
                    {editingTrip?.id === t.id ? "Cancel Edit" : "Edit"}
                  </button>
                  {/* <button onClick={() => deleteTrip.mutate(t)}>
                    🗑️ Delete
                  </button> */}
                  <button
                    onClick={() =>
                      setSelectedTrip(selectedTrip?.id === t.id ? null : t)
                    }
                    className="btn btn--managestops"
                  >
                    {selectedTrip?.id === t.id ? "Hide Stops" : "Manage Stops"}
                  </button>
                </div>
                {/* Manage trip */}
                {editingTrip?.id === t.id && (
                  <form
                    onSubmit={handleTripSubmit}
                    className="operator-trip-form"
                  >
                    <div className="form-group">
                      <label htmlFor="bus_id"></label>
                      <select
                        name="bus_id"
                        value={editingTrip.bus_id}
                        onChange={handleChange}
                        required
                      >
                        <option value={editingTrip.bus_id}>
                          {editingTrip.bus.bus_name}
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="route_id"></label>
                      <select
                        name="route_id"
                        value={values.route_id}
                        onChange={handleChange}
                        required
                      >
                        <option value={editingTrip.route_id}>
                          {editingTrip.route.start_location} →{" "}
                          {editingTrip.route.end_location}
                        </option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="operator_id"></label>
                      <select
                        name="operator_id"
                        value={values.operator_id}
                        onChange={handleChange}
                        required
                      >
                        <option value={editingTrip.operator_id}>
                          {editingTrip.operator.username} -{" "}
                          {editingTrip.operator.company_name}
                        </option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="departure">
                        Enter departure time and date
                      </label>
                      <input
                        type="datetime-local"
                        name="departure"
                        placeholder="departure"
                        value={values.departure}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="arrival">
                        Enter arrival time and date
                      </label>
                      <input
                        type="datetime-local"
                        name="arrival"
                        value={values.arrival}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="pice"></label>
                      <input
                        type="number"
                        name="price"
                        value={values.price}
                        placeholder="Price"
                        onChange={handleChange}
                      />
                    </div>

                    <button className="btn btn--primary" type="submit">
                      Update Trip
                    </button>
                  </form>
                )}
                {selectedTrip?.id === t.id && (
                  <>
                    <div className="stops-panel">
                      <h3>Trip Stops</h3>
                      <form onSubmit={handleStopSubmit} className="stops-form">
                        <div className="form-group">
                          <label htmlFor="route_stop">trip_stop</label>
                          <select
                            name="route_stop"
                            value={stopValues.route_stop}
                            onChange={handleStopchange}
                            required
                          >
                            <option value="">Select Stop</option>
                            {t.route.stops?.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.stop_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Arrival Time</label>
                          <input
                            type="time"
                            name="arrival_time"
                            value={stopValues.arrival_time}
                            onChange={handleStopchange}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="fare_from_start">
                            fare_from_start
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
                      </form>

                      <div className="stops-list">
                        {tripStopes?.map((s) => (
                          <div key={s.id} className="stop-card">
                            <span>{s.stop_name}</span> 
                            <span>₹ {s.fare_from_start}</span>
                            <p>{s.arrival_time}</p>
                            <div>
                              <button onClick={() => handleEditStop(s)} className="btn btn--edit">
                                Edit
                              </button>
                              <button onClick={() => deleteStop.mutate(s.id)} className="btn btn--delete">
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OperatorTripManageMent;
