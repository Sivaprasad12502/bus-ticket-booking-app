import { useQuery } from "@tanstack/react-query";
import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FaBus, FaClock, FaMapMarkerAlt, FaRupeeSign } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import Navbar from "../../component/Navbar/Navbar";
import "./Buscard.scss";
import { motion } from "framer-motion";

const BusCard = () => {
  const { apiUrl, navigate } = useContext(Context);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");
  const [selectedType, setSelectedType] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["buses", from, to, date],
    queryFn: async () => {
      const response = await axios.get(
        `${apiUrl}bookings/trips/?from=${from}&to=${to}&date=${date}`
      );
      return response.data;
    },
  });
  console.log(data, "buscard dataaa");
  const busType = [...new Set(data?.map((trip) => trip.bus.bus_type))];
  const filteredData = selectedType
    ? data?.filter((trip) => trip.bus.bus_type === selectedType)
    : data;
  if (isLoading) {
    return (
      <div className="bus-results-page">
        <Navbar />
        <div className="loader-container">
          <div className="loader"></div>
          <p>Finding available buses...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bus-results-page">
        <Navbar />
        <div className="error-container">
          <p>⚠️ Error loading buses. Please try again.</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bus-results-page">
      <Navbar />
      <div className="bus-results-container">
        <div className="search-info">
          <h2>Available Buses</h2>
          <p className="route-info">
            <FaMapMarkerAlt /> {from} → {to} |{" "}
            {new Date(date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="results-count">{data?.length || 0} bus(es) found</p>
          <div className="filter-box">
            <select
              name=""
              id=""
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">All bus type</option>
              {busType?.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {data?.length === 0 ? (
          <div className="no-results">
            <FaBus className="no-results-icon" />
            <h3>No buses found</h3>
            <p>
              Try adjusting your search criteria or selecting a different date
            </p>
            <button onClick={() => navigate(-1)} className="btn-search-again">
              Search Again
            </button>
          </div>
        ) : (
          <div className="bus-results">
            {filteredData?.map((trip, index) => (
              <motion.div
                key={trip.id}
                className="bus-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: false, amount: 0.2 }}
              >
                {/* <div key={trip.id} className="bus-card"> */}
                <div className="bus-card__header">
                  <div className="bus-info">
                    <h3 className="bus-name">
                      <FaBus /> {trip.bus.bus_name}
                    </h3>
                    <span
                      className={`bus-type ${
                        trip.bus.bus_type === "AC" ? "ac" : "non-ac"
                      }`}
                    >
                      {trip.bus.bus_type}
                    </span>
                  </div>
                  <div className="price-section">
                    <span className="price-label">Starting from</span>
                    <p className="price">
                      <FaRupeeSign /> {trip.price}
                    </p>
                  </div>
                </div>

                <div className="bus-card__body">
                  <div className="route-details">
                    <div className="route-point">
                      <FaMapMarkerAlt className="icon-start" />
                      <div>
                        <p className="location">{trip.route.start_location}</p>
                        <p className="time">{trip.departure_time}</p>
                      </div>
                    </div>
                    <div className="route-line">
                      <span className="distance">
                        {trip.route.distance_km} km
                      </span>
                      <motion.div
                        className="line"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        style={{ transformOrigin: "left" }}
                      >
                        {/* <div className="line"></div> */}
                      </motion.div>
                      <FaClock className="duration-icon" />
                    </div>

                    <div className="route-point">
                      <FaMapMarkerAlt className="icon-end" />
                      <div>
                        <p className="location">{trip.route.end_location}</p>
                        <p className="time">{trip.arrival_time}</p>
                      </div>
                    </div>
                  </div>

                  {trip.trip_stops && trip.trip_stops.length > 0 && (
                    <div className="stops-section">
                      <button
                        className="view-stops-btn"
                        onClick={(e) => {
                          e.currentTarget.parentElement.classList.toggle(
                            "expanded"
                          );
                        }}
                      >
                        View Stops ({trip.trip_stops.length})
                      </button>
                      <div className="stops-list">
                        {trip.trip_stops.map((stop, i) => (
                          <div key={i} className="stop-item">
                            <span className="stop-name">{stop.stop_name}</span>
                            <span className="stop-time">
                              {stop.arrival_time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bus-card__footer">
                  <button
                    className="btn-select-seat"
                    onClick={() =>
                      navigate(
                        `/busDetails/selectSeat?tripid=${trip.id}&date=${date}`
                      )
                    }
                  >
                    <MdEventSeat /> Select Seats
                  </button>
                </div>
                {/* </div> */}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusCard;
