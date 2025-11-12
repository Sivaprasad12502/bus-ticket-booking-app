import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import "./BusSearch.scss";

export const BusSearch = () => {
  const { apiUrl, navigate } = useContext(Context);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [returnDate, setRuturnDate] = useState("");
  const [tripType, setTripType] = useState("oneway");

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
    if (!from || !to || !data) {
      e.preventDefault();
      alert("Please fill all fields before searching.");
    }
    const params=new URLSearchParams({
      from:from.trim(),
      to:to.trim(),
      date:date,
      tripType,

    })
    if(tripType==="roundtrip"&&returnDate){
      params.append("returnDate",returnDate)
    }
    navigate(`/busDetails?${params.toString()}`)
  };

  return (
    <div className="bus-search-container">
      <h2 className="title">Find Your Bus</h2>

      <div className="form-group">
        <div className="trip-type-toggle">
          <button
            type="button"
            className={tripType === "oneway" ? "active" : ""}
            onClick={() => setTripType("oneway")}
          >
            ONE WAY
          </button>
          <button
            type="button"
            className={tripType === "roundtrip" ? "active" : ""}
            onClick={() => setTripType("roundtrip")}
          >
            ROUND TRIP
          </button>
        </div>
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
        {tripType==="roundtrip"&&(
          <div className="form-field">
          <label htmlFor="returndate">Return Date</label>
          <input
            type="date"
            id="returndate"
            value={returnDate}
            onChange={(e) => setRuturnDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]} // prevent past dates
            disabled={tripType === "oneway"}
          />
        </div>
        )}

        <button
          className="search-btn"
          disabled={!from || !to || !date}
          onClick={handleSearch}
        >
          Search Buses
        </button>
      </div>
    </div>
  );
};
