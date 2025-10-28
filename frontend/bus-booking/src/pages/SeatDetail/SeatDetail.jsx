import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Context } from "../../context/Context";
import "./SeatDetail.scss";
import { toast } from "react-toastify";

export const SeatDetail = () => {
  const { apiUrl, token, navigate } = useContext(Context);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tripid = params.get("tripid");
  const date = params.get("date");
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState([]);

  // Guards
  if (!tripid || !date) {
    return (
      <p>
        Please provide a trip id and date in the query string (tripid & date).
      </p>
    );
  }

  // Fetch trip details (to know total seats and price)
  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ["trip", tripid],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/trips/${tripid}/`);
      return res.data;
    },
  });

  // Fetch available seats for the requested date
  const {
    data: availableSeats,
    isSuccess: seatsSuccess,
    isLoading: seatsLoading,
    error: seatsError,
  } = useQuery({
    queryKey: ["seats", tripid, date],
    queryFn: async () => {
      const res = await axios.get(
        `${apiUrl}bookings/trips/${tripid}/seats/?date=${date}`
      );
      return res.data; // API returns seats available for the date
    },
  });

  // Build a full seat map (1..total_seats) and mark available seats
  const totalSeats = trip?.bus?.total_seats || 0;
  const availableSet = new Set(
    (availableSeats || []).map((s) => String(s.seat_number))
  );
  const seatNumbers = Array.from({ length: totalSeats }, (_, i) =>
    String(i + 1)
  );

  // const mutation = useMutation({
  //   mutationFn: async (seatIds) => {
  //     if (!token) throw new Error("Authentication required");
  //     return await axios.post(
  //       `${apiUrl}bookings/bookings/`,
  //       {
  //         trip_id: tripid,
  //         seats: seatIds,
  //         booked_date: date,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //   },
  //   onSuccess: ({ data }) => {
  //     queryClient.invalidateQueries(["seats", tripid, date]);
  //     const bookingId = data.booking_id;
  //     const seatsQuery = selectedSeats.join(",");
  //     const totalamount = data.total_amount;
  //     setSelectedSeats([]);
  //     toast.success("Seats booked successfully!");
  //     navigate(`/selectSeat/addpassenger?bookingId=${bookingId}&seats=${seatsQuery}&totalamount=${totalamount}`);
  //   },
  //   onError: (error) => {
  //     const msg = error?.response?.data?.error || error.message || "Booking failed";
  //     toast.error(msg);
  //   },
  // });

  const toggleSeat = (seatNumber, isAvailable) => {
    if (!isAvailable) return; // cannot toggle booked seats
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleBookNow = () => {
    if (!token) {
      toast.error("Please login to book seats.");
      navigate(`/login?next=/selectSeat?tripid=${tripid}&date=${date}`);
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat!");
      return;
    }
    // mutation.mutate(selectedSeats);
    const seatsQuery = selectedSeats.join(",");
    navigate(
      `/selectSeat/addpassenger?tripid=${tripid}&date=${date}&seats=${seatsQuery}`
    );
  };

  if (tripLoading || seatsLoading) return <p>Loading seats...</p>;
  if (!seatsSuccess) return <p>Failed to load seats. {seatsError?.message}</p>;

  const pricePerSeat = trip?.price ? parseFloat(trip.price) : 0;
  const totalPrice = (selectedSeats.length * pricePerSeat).toFixed(2);

  // sleeper
  const busType = trip?.bus?.bus_type || "AC";
  const renderSeats = () => {
    if (busType === "Sleeper") {
      return (
        <div className="sleeper-layout">
          <div className="deck upper-deck">
            <h4>Uppder Deck</h4>
            <div className="deck-rows">
              {seatNumbers
                .filter((_, i) => i % 2 == 0) //exmaple split upper/lower
                .map((num) => {
                  const isAvailable = availableSet.has(num);
                  const isSelected = selectedSeats.includes(num);
                  return (
                    <button
                      key={num}
                      className={`seat sleeper ${!isAvailable ? "booked" : ""}${
                        isSelected ? "selected" : ""
                      }`}
                      disabled={!isAvailable}
                      onClick={() => toggleSeat(num, isAvailable)}
                    >
                      {num}
                    </button>
                  );
                })}
            </div>
          </div>
          <div className="deck lower-deck">
            <h4>lower Deck</h4>
            <div className="deck-rows">
              {seatNumbers
                .filter((_, i) => i % 2 !== 0) //exmaple split upper/lower
                .map((num) => {
                  const isAvailable = availableSet.has(num);
                  const isSelected = selectedSeats.includes(num);
                  return (
                    <button
                      key={num}
                      className={`seat sleeper ${!isAvailable ? "booked" : ""}${
                        isSelected ? "selected" : ""
                      }`}
                      disabled={!isAvailable}
                      onClick={() => toggleSeat(num, isAvailable)}
                    >
                      {num}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      );
    }
    //default 2*2 seat layout
    const perRow=4;
    const rows=[];
    for(let i=0;i<seatNumbers.length;i+=perRow){
      rows.push(seatNumbers.slice(i,i+perRow))
    }
    return rows.map((row,rIdx)=>(
      <div className="seat-row" key={`row-${rIdx}`}>
        <div className="seat-block left">
          {row.slice(0,2).map((num)=>renderSeat(num))}
        </div>
        <div className="aisle"/>
        <div className="seat-block right">
          {row.slice(2,4).map((num)=>renderSeat(num))}
        </div>
      </div>
    ))
  };
  //Helper render seat
  const renderSeat=(num)=>{
    const isAvailable=availableSet.has(num);
    const isSelected=selectedSeats.includes(num);
    return(
      <button 
      key={num}
      className={`seat ${!isAvailable?"booked":""} ${isSelected?"selected":""}`}
      disabled={!isAvailable}
      onClick={()=>toggleSeat(num,isAvailable)}>
        {num}
      </button>
    )
  }
  return (
    <div className="seat-container">
      <h2>Choose Your Seats</h2>

      <div className="seat-grid">
        {/* Driver / front indicator */}
        <div className="driver">Driver</div>
         {renderSeats()}
        
      </div>

      <div className="seat-summary">
        <p>Selected seats: {selectedSeats.join(", ") || "None"}</p>
        <p>Seats selected: {selectedSeats.length}</p>
        <p>Total: ₹{totalPrice}</p>
      </div>

      <button
        className="book-btn"
        onClick={handleBookNow}
        disabled={selectedSeats.length === 0}
      >
        {/* {mutation.isLoading ? "Booking..." : "Book Now"} */}
        book now
      </button>
    </div>
  );
};
