import { partialMatchKey, useQuery } from "@tanstack/react-query";
import React, { useContext } from "react";
import { Context } from "../../context/Context";
import axios from "axios";
import { useLocation } from "react-router-dom";
import './Buscard.scss'

const BusCard = () => {
  const { apiUrl,navigate } = useContext(Context);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get("from");
  const to = params.get("to");
  const date = params.get("date");
  console.log('from',from)
  console.log('to',to)
  console.log('date',date)
  const { data ,isLoading,isError} = useQuery({
    queryKey: ["buses", from, to, date],
    queryFn: async () => {
      const response = await axios.get(
        `${apiUrl}bookings/trips/?from=${from}&to=${to}`
      );
      const data = response.data;
      return data;
    },
  });
  if(data){console.log('data',data)}
  if (isLoading) return <div>Loading buses...</div>;
  if (isError) return <div>Error loading buses</div>;
  return (
   <div className="bus-results">
      {data.length === 0 && <p className="no-results">No buses found for your search.</p>}
      {data.map((trip) => (
        <div key={trip.id} className="bus-card">
          <h3>{trip.bus.bus_name.toUpperCase()}</h3>
          <p className="ac-p">{trip.bus.bus_type}</p>
          <p>
            {trip.route.start_location} → {trip.route.end_location}
          </p>
          <p>
            Departure: {new Date(trip.departure_time).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})} |
            Arrival: {new Date(trip.arrival_time).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})}
          </p>
          <p className="price">Price: ₹{trip.price}</p>
          <button onClick={()=>navigate(`/busDetails/selectSeat?tripid=${trip.id}`)}>select seat</button>
        </div>
      ))}
    </div>
  );
};

export default BusCard;
