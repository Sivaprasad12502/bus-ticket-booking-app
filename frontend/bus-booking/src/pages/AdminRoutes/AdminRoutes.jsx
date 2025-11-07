import React, { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Context } from "../../context/Context";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminRoutes.scss";

const AdminRoutes = () => {
  const { apiUrl, adminAccessToken } = useContext(Context);
  const queryClient = useQueryClient();
  const { values, setValues, resetForm, handleChange } = useForm({
    start_location: "",
    end_location: "",
    distance_km: "",
  });
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  //Fetch Routes
  const {
    data: routes,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/admin/routes`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return res.data;
    },
    onSuccess: (routes) => {
      console.log("fetched routes:", routes);
    },
    onError: (error) => {
      console.log("error fetching routes:", error);
    },
  });
  if (isSuccess) {
    console.log("routes data:", routes);
  }
  //Add Route
  const addMutation = useMutation({
    mutationFn: async (route) => {
      const res = await axios.post(`${apiUrl}bookings/admin/routes/`, route, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routes"]);
      resetForm();
    },
    onError: (error) => {
      console.log("error adding route:", error);
    },
  });
  //Edit route
  const editMutation = useMutation({
    mutationFn: async (route) => {
      const res = await axios.put(
        `${apiUrl}bookings/admin/routes/${route.id}/`,
        route,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routes"]);
      setEditingRoute(null);
      resetForm();
    },
    onError: (error) => {
      console.log("error editing route:", error);
    },
  });
  //Delete route
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`${apiUrl}bookings/admin/routes/${id}/`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routes"]);
    },
    onError: (error) => {
      console.log("error deleting route:", error);
    },
  });
  // Stops management
  const { data: routeStops } = useQuery({
    queryKey: ["routeStops", selectedRoute?.id],
    queryFn: async () => {
      if (!selectedRoute) return [];
      const res = await axios.get(
        `${apiUrl}bookings/admin/routes/${selectedRoute.id}/stops/`,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    enabled: !!selectedRoute,
  });
  const addStopMutation = useMutation({
    mutationFn: async (stop) => {
      const res = await axios.post(
        `${apiUrl}bookings/admin/routes/${selectedRoute.id}/stops/`,
        stop,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routeStops", selectedRoute.id]);
      stopReset();
    },
  });
  const editStopMutation = useMutation({
    mutationFn: async (stop) => {
      const res = await axios.put(
        `${apiUrl}bookings/admin/routestops/${stop.id}/`,
        stop,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routeStops", selectedRoute.id]);
      setEditingStop(null);
      stopReset();
    },
  });
  const deleteStopMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${apiUrl}bookings/admin/routestops/${id}/`, {
        headers: { Authorization: `Bearer ${adminAccessToken}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routeStops", selectedRoute.id]);
    },
  });
  //.stops form
  const [editingStop, setEditingStop] = useState(null);
  const {
    values: stopValues,
    setValues: setStopValues,
    handleChange: stopHandleChange,
    resetForm: stopReset,
  } = useForm({
    stop_name: "",
    order: "",
    distance_from_start: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRoute) {
      editMutation.mutate({ ...editingRoute, ...values });
    } else {
      addMutation.mutate(values);
    }
    resetForm();
  };
  const handleEdit = (route) => {
    setEditingRoute(route);
    setValues({
      start_location: route.start_location,
      end_location: route.end_location,
      distance_km: route.distance_km,
    });
  };
  const handleStopSubmit = (e) => {
    e.preventDefault();
    // const stopData = {
    //   ...stopValues,
    //   route: selectedRoute.id,
    // };
    if (editingStop) {
      editStopMutation.mutate({ ...editingStop, ...stopValues });
    } else {
      addStopMutation.mutate(stopValues);
    }
  };
  const handleEditStop = (stop) => {
    setEditingStop(stop);
    setStopValues({
      stop_name: stop.stop_name,
      order: stop.order,
      distance_from_start: stop.distance_from_start,
    });
  };
  // if(routes.length===0){
  //   return <div>No routes available</div>
  // }
  return (
    <div className="admin-route-page">
      <h2>Manage Routes </h2>
      <form onSubmit={handleSubmit} className="admin-route-form">
        <input
          type="text"
          placeholder="Start Location"
          name="start_location"
          value={values.start_location}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="End Location"
          value={values.end_location}
          name="end_location"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          placeholder="Distance (km)"
          value={values.distance_km}
          name="distance_km"
          onChange={handleChange}
          required
        />
        <button type="submit">
          {editingRoute ? "Update Route" : "Add Route"}
        </button>
      </form>
      {isLoading ? (
        <p>Loading routes...</p>
      ) : (
        <ul className="admin-list">
          {routes?.map((r) => (
            <li key={r.id}>
              <strong>{r.start_location}</strong> → {r.end_location} (
              {r.distance_km} km)
              <ul>
                {r?.stops?.map((stop) => (
                  <li key={stop.id}>
                    {stop.stop_name} {stop.distance_from_start} km
                  </li>
                ))}
              </ul>
              <div className="actions">
                <button onClick={() => handleEdit(r)}>✏️ Edit</button>
                <button onClick={() => deleteMutation.mutate(r.id)}>
                  🗑️ Delete
                </button>
                <button onClick={() => setSelectedRoute(r)}>
                  Manage Stops
                </button>
              </div>
              {/* {STOPS PANEL} */}
              {selectedRoute?.id==r.id && (
                <div className="stops-panel">
                  <h3>
                    Stops for {selectedRoute.start_location} →{" "}
                    {selectedRoute.end_location}
                  </h3>
                  <form onSubmit={handleStopSubmit} className="stops-form">
                    <input
                      name="stop_name"
                      placeholder="Stop name"
                      value={stopValues.stop_name}
                      onChange={stopHandleChange}
                    />
                    <input
                      name="order"
                      placeholder="Order"
                      value={stopValues.order}
                      onChange={stopHandleChange}
                    />
                    <input
                      name="distance_from_start"
                      placeholder="Distance from start (km)"
                      value={stopValues.distance_from_start}
                      onChange={stopHandleChange}
                    />
                    <button type="submit">
                      {editingStop ? "Update Stop" : "Add Stop"}
                    </button>
                  </form>
                  <div className="stops-list">
                    {routeStops?.map((s) => (
                      <div key={s.id} className="stop-card">
                        <strong>{s.stop_name}</strong> ({s.distance_from_start}{" "}
                        km)
                        <div>
                          <button onClick={() => handleEditStop(s)}>
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => deleteStopMutation.mutate(s.id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    className="close-btn"
                    onClick={() => setSelectedRoute(null)}
                  >
                    ❌ Close Stops Panel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminRoutes;
