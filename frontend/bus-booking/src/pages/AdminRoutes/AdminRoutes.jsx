import React, { useContext, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Context } from "../../context/Context";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminRoutes.scss";
import { FaEdit, FaRoute, FaTrash } from "react-icons/fa";

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
  const formRef = useRef(null);
  const inputRef = useRef(null);
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
  useEffect(() => {
    if (editingRoute) {
      setTimeout(() => {
        formRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        inputRef.current.focus();
      }, 100);
    }
  }, [editingRoute]);
  // if(routes.length===0){
  //   return <div>No routes available</div>
  // }
  return (
    <div className="admin-route-page">
      <h2>
        <FaRoute /> Manage Routes{" "}
      </h2>
      <form onSubmit={handleSubmit} className="admin-route-form" ref={formRef}>
        <div className="form-group">
          <label htmlFor="start_location">start location</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Start Location"
            name="start_location"
            value={values.start_location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="end_location">End Location</label>
          <input
            type="text"
            placeholder="End Location"
            value={values.end_location}
            name="end_location"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="distance_km">Distance (km)</label>
          <input
            type="number"
            placeholder="Distance (km)"
            value={values.distance_km}
            name="distance_km"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn--primary">
          {editingRoute ? "Update Route" : "Add Route"}
        </button>
        {editingRoute && (
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setEditingRoute(null);
              resetForm();
            }}
          >
            Cancel
          </button>
        )}
      </form>
      {isLoading ? (
        <p>Loading routes...</p>
      ) : (
        <ul className="admin-list">
          {routes.length === 0 ? (
            <p>No routes created</p>
          ) : (
            routes?.map((r) => (
              <li key={r.id}>
                {r.start_location} → {r.end_location} ({r.distance_km} km)
                <ul>
                  {r?.stops?.map((stop) => (
                    <li key={stop.id}>
                      {stop.stop_name} {stop.distance_from_start} km
                    </li>
                  ))}
                </ul>
                <div className="actions">
                  <button
                    onClick={() => handleEdit(r)}
                    className="btn btn--edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(r.id)}
                    className="btn btn--delete"
                  >
                    <FaTrash /> Delete
                  </button>
                  <button
                    onClick={() =>
                      setSelectedRoute(selectedRoute?.id === r.id ? null : r)
                    }
                    className="btn btn--managestops"
                  >
                    {selectedRoute?.id === r.id
                      ? "Close stops "
                      : "Manage Stops"}
                  </button>
                </div>
                {/* {STOPS PANEL} */}
                {selectedRoute?.id == r.id && (
                  <div className="stops-panel">
                    <h3>
                      Stops for {selectedRoute.start_location} →{" "}
                      {selectedRoute.end_location}
                    </h3>
                    <form onSubmit={handleStopSubmit} className="stops-form">
                      <div className="form-group">
                        <label htmlFor="stop_name">Stop Name</label>
                        <input
                          name="stop_name"
                          placeholder="Stop name"
                          value={stopValues.stop_name}
                          onChange={stopHandleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="order">Stop Order</label>
                        <input
                          name="order"
                          placeholder="Order"
                          value={stopValues.order}
                          onChange={stopHandleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="distance_from_start">
                          distance from start
                        </label>
                        <input
                          name="distance_from_start"
                          placeholder="Distance from start (km)"
                          value={stopValues.distance_from_start}
                          onChange={stopHandleChange}
                        />
                      </div>
                      <button type="submit" className="btn btn--primary">
                        {editingStop ? "Update Stop" : "Add Stop"}
                      </button>
                      {editingStop && (
                        <button
                          type="button"
                          className="btn btn--secondary"
                          onClick={() => {
                            setEditingStop(null);
                            stopReset();
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </form>
                    <div className="stops-list">
                      {routeStops?.length === 0 ? (
                        <p>No Stops </p>
                      ) : (
                        routeStops?.map((s) => (
                          <div key={s.id} className="stop-card">
                            <strong>{s.stop_name}</strong> (
                            {s.distance_from_start} km)
                            <div>
                              <button
                                onClick={() => handleEditStop(s)}
                                className="btn btn--edit"
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                onClick={() => deleteStopMutation.mutate(s.id)}
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
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AdminRoutes;
