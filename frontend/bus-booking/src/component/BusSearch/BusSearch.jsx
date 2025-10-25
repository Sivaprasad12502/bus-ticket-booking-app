import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import './BusSearch.scss'

export const BusSearch = () => {
  const { apiUrl, navigate } = useContext(Context);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["routes"],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}bookings/routes/`);
      return response.data;
    },
  });

  if (isLoading) return <div className="loader">Loading routes...</div>;
  if (isError) return <div className="error">Error: {error.message}</div>;

  const handleSearch = (e) => {
    if (!from || !to) {
      e.preventDefault();
      alert("Please fill all fields before searching.");
    }
    navigate(`/busDetails?from=${from}&to=${to}&date=${date}`);
  };

  return (
    <div className="bus-search-container">
      <h2 className="title">Find Your Bus</h2>
      <div className="form-group">
        <div className="form-field">
          <label htmlFor="from">From</label>
          <select
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            <option value="">Select Starting Point</option>
            {data?.map((item) => (
              <option key={item.id} value={item.start_location}>
                {item.start_location}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="to">To</label>
          <select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">Select Destination</option>
            {data?.map((item) => (
              <option key={item.id} value={item.end_location}>
                {item.end_location}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="date">Travel Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // prevent past dates
          />
        </div>

        <button
          className="search-btn"
          disabled={!from || !to ||!date}
          onClick={handleSearch}
        >
          Search Buses
        </button>
      </div>
    </div>
  );
};
