import React, { useContext, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Context } from "../../context/Context";
import "./AddPassenger.scss";
const AddPassenger = () => {
  const { apiUrl, token } = useContext(Context);
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const booking_id = params.get("bookingId");
  console.log(booking_id);
  const totalamount = params.get("totalamount") || 0;
  const seatNumbers = params.get("seats")?.split(",");
  console.log(seatNumbers);
  const [passengers, setPassengers] = useState(
    seatNumbers.map((seat) => ({
      seat_number: seat,
      name: "",
      age: "",
      gender: "",
      boarding_location: "",
      dropping_location: "",
    }))
  );

  const mutation = useMutation({
    mutationFn: async (data) =>
      axios.post(`${apiUrl}bookings/bookings/${booking_id}/passengers/`, data, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onSuccess: ({ data }) => {
      console.log(data)
      console.log('booking-id in addpassenger',booking_id)
      console.log('  totalamount in add',totalamount)
      console.log('seatnumber in addpassenger',seatNumbers)
      navigate(`/payment?bookingId=${booking_id}&totalamount=${totalamount}&seats=${seatNumbers}`)
    },
    onError: (error) => console.log(error),
  });

  const handleChange = (index, field, value) => {
    const newData = [...passengers];
    newData[index][field] = value;
    setPassengers(newData);
  };

  //   const addPassengerField = () => {
  //     setPassengers([
  //       ...passengers,
  //       {
  //         name: "",
  //         age: "",
  //         gender: "",
  //         seat_number: "",
  //         boarding_location: "",
  //         dropping_location: "",
  //       },
  //     ]);
  //   };

  const handleSubmit = () => {
    mutation.mutate({ passengers });
  };
  return (
    <div className="add-passenger-container">
      <h2>Add Passengers</h2>
      {passengers.map((p, i) => (
        <div className="passenger-card" key={i}>
          <h4>Seat {p.seat_number || i + 1}</h4>
          <input
            placeholder="Name"
            value={p.name}
            onChange={(e) => handleChange(i, "name", e.target.value)}
          />
          <input
            placeholder="Age"
            value={p.age}
            onChange={(e) => handleChange(i, "age", e.target.value)}
          />
          <select
            value={p.gender}
            onChange={(e) => handleChange(i, "gender", e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="OTHER">OTHER</option>
          </select>
          <input
            placeholder="Seat"
            value={p.seat_number}
            onChange={(e) => handleChange(i, "seat_number", e.target.value)}
          />
          <input
            placeholder="Boarding"
            value={p.boarding_location}
            onChange={(e) =>
              handleChange(i, "boarding_location", e.target.value)
            }
          />
          <input
            placeholder="Dropping"
            value={p.dropping_location}
            onChange={(e) =>
              handleChange(i, "dropping_location", e.target.value)
            }
          />
        </div>
      ))}

      <div className="btn-group">
        {/* <button className="add-passenger-btn" onClick={addPassengerField}>
          Add Passenger
        </button> */}
        <div>
          <span>{totalamount}</span>
        </div>
        <button className="continue-btn" onClick={handleSubmit}>
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default AddPassenger;
