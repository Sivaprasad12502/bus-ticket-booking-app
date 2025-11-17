import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminTrips.scss";
import AdminSeats from "../../component/AdminSeats/AdminSeats";
const AdminTrips = () => {
  const { apiUrl, adminAccessToken } = useContext(Context);
  const queryClient = useQueryClient();
  const { values, setValues, handleChange, resetForm } = useForm({
    bus_id: "",
    route_id: "",
    departure_time: "",
    arrival_time: "",
    price: "",
  });
  const [editingTrip, setEditingTrip] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
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
  if (buses) {
    console.log("Admin buses data", buses);
  }
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
  const handleTripSubmit = (e) => {
    console.log("form values", values);
    e.preventDefault();
    if (editingTrip) editTrip.mutate({ ...editingTrip, ...values });
    else addTrip.mutate(values);
  };
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setValues({
      bus_id: trip.bus.id,
      route_id: trip.route.id,
      departure_time: trip.departure_time?.slice(0, 5),
      arrival_time: trip.arrival_time?.slice(0, 5),
      price: trip.price,
    });
  };
  const handleStopSubmit = (e) => {
    e.preventDefault();
    console.log("stop form values",stopValues)
    if (editingStop) editStop.mutate({ ...editingStop, ...stopValues });
    else addStop.mutate(stopValues);
  };
  const handleEditStop = (stop) => {
    seEditingStop(stop);
    setStopValues({
      route_stop: stop.route_stop,
      arrival_time: stop.arrival_time?.slice(0, 5),
      fare_from_start: stop.fare_from_start,
    });
  };
  if (!buses) {
    return <div>Loading...buses</div>;
  }
  if (!routes) {
    return <div>Loading ...rotes</div>;
  }
  return (
    <div className="admin-trip-page">
      <h2>Manage Trips</h2>

      {/* Trip form */}
      <form onSubmit={handleTripSubmit} className="admin-trip-form">
        <select
          name="bus_id"
          value={values.bus_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Bus</option>
          {buses?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bus_name}
            </option>
          ))}
        </select>

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
        <label htmlFor="">
          Enter departure_time
          <input
            type="time"
            name="departure_time"
            placeholder="departure_time"
            value={values.departure_time}
            onChange={handleChange}
          />
        </label>
        <label>
          Enter arrival_time
          <input
            type="time"
            name="arrival_time"
            value={values.arrival_time}
            onChange={handleChange}
          />
        </label>
        <input
          type="number"
          name="price"
          value={values.price}
          placeholder="Price"
          onChange={handleChange}
        />

        <button type="submit">
          {editingTrip ? "Update Trip" : "Add Trip"}
        </button>
      </form>

      {/* Trip List */}
      {isLoading ? (
        <p>Loading trips...</p>
      ) : (
        <ul className="admin-list">
          {trips?.map((t) => (
            <li key={t.id}>
              🚌 {t.bus.bus_name} — {t.route.start_location} →{" "}
              {t.route.end_location}
              <br />⏰ {t.departure_time} → {t.arrival_time} 💰 ₹{t.price}
              <div className="actions">
                <button onClick={() => handleEditTrip(t)}>✏️ Edit</button>
                <button onClick={() => deleteTrip.mutate(t.id)}>
                  🗑️ Delete
                </button>
                <button
                  onClick={() =>
                    setSelectedTrip(selectedTrip?.id === t.id ? null : t)
                  }
                >
                  {selectedTrip?.id === t.id && selectedTrip.view !== "seats"
                    ? "Hide Stops"
                    : "Manage Stops"}
                </button>
                <button
                  onClick={() => setSelectedTrip({ ...t, view: "seats" })}
                >
                  🪑 Manage Seats
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
                      <h3>Trip Stops</h3>
                      <form onSubmit={handleStopSubmit} className="stops-form">
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
                        <label>
                          Arrival Time
                          <input
                            type="time"
                            name="arrival_time"
                            value={stopValues.arrival_time}
                            onChange={handleStopchange}
                          />
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="fare_from_start"
                          placeholder="Fare (₹)"
                          value={stopValues.fare_from_start}
                          onChange={handleStopchange}
                        />
                        <button type="submit">
                          {editingStop ? "Update Stop" : "Add Stop"}
                        </button>
                      </form>

                      <div className="stops-list">
                        {tripStopes?.map((s) => (
                          <div key={s.id} className="stop-card">
                            <strong>{s.stop_name}</strong> — ₹
                            {s.fare_from_start}
                            <p>{s.arrival_time}</p>
                            <div>
                              <button onClick={() => handleEditStop(s)}>
                                ✏️
                              </button>
                              <button onClick={() => deleteStop.mutate(s.id)}>
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
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
