import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { Context } from "../../context/Context";
import "./SeatDetail.scss";
import { toast } from "react-toastify";

export const SeatDetail = () => {
  const { apiUrl, token,navigate } = useContext(Context);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const tripid = params.get("tripid");
  console.log(token)
  const queryClient = useQueryClient();
  const [selectedSeats, setSelectedSeats] = useState([]);

  // 🔹 Fetch seats
  const {
    data: seats,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ["seats", tripid],
    queryFn: async () => {
      const res = await axios.get(`${apiUrl}bookings/trips/${tripid}/seats/`);
      return res.data;
    },
  });
  if(seats){
    console.log(seats)
  }

  // 🔹 Handle booking
  const mutation = useMutation({
    mutationFn: async (seatIds) => {
      return await axios.post(
        `${apiUrl}bookings/bookings/`,
        {
          trip_id: tripid,
          seats: seatIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: ({data}) => {
      console.log(data)
      queryClient.invalidateQueries(["seats", tripid]); // refetch seats
      const bookingId=data.booking_id
      const seatsQuery=selectedSeats.join(",")
      const totalamount=data.total_amount
      setSelectedSeats([]);
      toast.success("Seats booked successfully!");
      navigate(`/selectSeat/addpassenger?bookingId=${bookingId}&seats=${seatsQuery}&totalamount=${totalamount}`)
    },
    onError:(error)=>{
        console.log('error',error)
        

    }
  });

  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBookNow = () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat!");
      return;
    }
    mutation.mutate(selectedSeats);
  };

  if (isLoading) return <p>Loading seats...</p>;
  if (!isSuccess) return <p>Failed to load seats.</p>;

  return (
    <div className="seat-container">
      <h2>Choose Your Seats</h2>

      <div className="seat-grid">
        {seats.map((seat) => (
          <button
            key={seat.id}
            className={`seat 
              ${seat.is_booked ? "booked" : ""}
              ${selectedSeats.includes(seat.seat_number) ? "selected" : ""}
            `}
            disabled={seat.is_booked}
            onClick={() => toggleSeat(seat.seat_number)}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>

      <button
        className="book-btn"
        onClick={handleBookNow}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Booking..." : "Book Now"}
      </button>
    </div>
  );
};
