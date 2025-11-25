import React, { useEffect, useRef } from "react";
import { useContext } from "react";
import { Context } from "../../context/Context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import useForm from "../../hooks/useForm/useForm";
import "./AdminBuses.scss";
import { useState } from "react";
import { FaBus, FaChair, FaEdit, FaSnowflake, FaTrash } from "react-icons/fa";
import { MdAirlineSeatFlat } from "react-icons/md";
const AdminBuses = () => {
  const queryClient = useQueryClient();
  const { apiUrl, adminAccessToken } = useContext(Context);
  const { values, setValues, handleChange, resetForm } = useForm({
    bus_name: "",
    total_seats: "",
    bus_type: "AC",
    layout_type: "2*2",
  });
  const [editingBus, setEditingBus] = useState(null);
  const formRef = useRef(null);
  const inputRef = useRef(null);
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
  //Add Bus Mutation
  const addBusMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${apiUrl}bookings/admin/buses/`, values, {
        headers: {
          authorization: `Bearer ${adminAccessToken}`,
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBuses"]);
      resetForm();
    },
    onError: (error) => {
      console.error("Add bus Error:", error);
    },
  });
  //Edit Bus Mutation
  const editBusMutation = useMutation({
    mutationFn: async (bus) => {
      console.log("Editing bus:", bus);
      const res = await axios.put(
        `${apiUrl}bookings/admin/buses/${bus.id}/`,
        bus,
        {
          headers: {
            Authorization: `Bearer ${adminAccessToken}`,
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBuses"]);
      setEditingBus(null);
      resetForm();
    },
    onError: (error) => {
      console.error("edit bus error:", error);
    },
  });
  //Delete Bus Mutation
  const deleteBusMutation = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${apiUrl}bookings/admin/buses/${id}/`, {
        headers: {
          Authorization: `Bearer ${adminAccessToken}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminBuses"]);
    },
    onError: (error) => {
      console.error("Delete bus error:", error);
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingBus) {
      editBusMutation.mutate({ ...editingBus, ...values });
    } else {
      addBusMutation.mutate();
    }
  };
  const handleEditClick = (bus) => {
    console.log("Editingggg bus:", bus);
    setEditingBus(bus);
    setValues({
      bus_name: bus.bus_name,
      total_seats: bus.total_seats,
      bus_type: bus.bus_type,
      operator_name: bus.operator_name,
      layout_type: bus.layout_type,
      operator_mobile: bus.operator_mobile,
    });
  };
  useEffect(() => {
    if (editingBus) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        inputRef.current?.focus();
      }, 100);
    }
  }, [editingBus]);

  return (
    <div className="admin-buses">
      <h2 className="admin-buses__title">
        <FaBus /> Manage Buses <span>({buses?.length || 0})</span>
      </h2>

      {/* Add/Edit Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="admin-buses__form">
        {/* <div> */}
        <div className="form-group">
          <label htmlFor="bus_name">
            <FaBus /> Bus Name
          </label>

          <input
            ref={inputRef}
            type="text"
            name="bus_name"
            placeholder="Enter bus Name"
            value={values.bus_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="total_seats"> Total Seats</label>
          <input
            type="number"
            name="total_seats"
            placeholder="Total Seats"
            value={values.total_seats}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="bus_type">Bus Type</label>
          <select
            name="bus_type"
            value={values.bus_type}
            onChange={handleChange}
            required
          >
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="layout_type"> Layout Type</label>
          <select
            name="layout_type"
            value={values.layout_type}
            onChange={handleChange}
            required
          >
            <option value="2*2">2*2</option>
            <option value="2*3">2*3</option>
            <option value="Sleeper">Sleeper</option>
          </select>
        </div>
        {/* </div> */}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={addBusMutation.isLoading || editBusMutation.isLoading}
        >
          {editingBus
            ? editBusMutation.isLoading
              ? "Updating..."
              : "Update Bus"
            : addBusMutation.isLoading
            ? "Adding..."
            : "Add Bus"}
        </button>
        {editingBus && (
          <button
            type="button"
            onClick={() => {
              setEditingBus(null);
              resetForm();
            }}
            className="btn btn--secondary"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Bus List */}
      <div className="admin-buses__list">
        {isLoading && <p>Loading buses...</p>}
        {isError && <p className="error">Error: {error?.message}</p>}

        {buses?.length === 0 ? (
          <><p>No buses created yet. Create your first bus!</p></>
        ) : (
          <>
            {" "}
            {buses?.map((bus) => (
              <div key={bus.id} className="bus-card">
                <h3>{bus.bus_name}</h3>
                <p>
                  Type: <strong>{bus.bus_type}</strong>
                </p>
                <p>Seats: {bus.total_seats}</p>
                <p>Layout: {bus.layout_type}</p>
                <div className="bus-card__actions">
                  <button
                    onClick={() => handleEditClick(bus)}
                    className="btn btn--edit"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => deleteBusMutation.mutate(bus.id)}
                    className="btn btn--delete"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBuses;
