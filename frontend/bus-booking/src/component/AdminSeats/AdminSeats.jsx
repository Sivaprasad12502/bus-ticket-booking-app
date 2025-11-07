import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminSeats.scss";
const AdminSeats = ({ tripId, onBack }) => {
  const { apiUrl, adminAccessToken } = useContext(Context);
  const queryClient = useQueryClient();
  const [selectedSeat, setSelectedSeats] = useState(null);

  //Fetch all seats for this trip
  const {
    data: seats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["adminSeats", tripId],
    queryFn: async () => {
      const res = await axios.get(
        `${apiUrl}bookings/admin/trips/${tripId}/seats/`,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      console.log("Fetched seats for trip:", seats);
    },
    onError: (err) => {
      console.error("error fetching seats:", err);
    },
  });
  // Mutation to update seat gender preference
  const updateSeat = useMutation({
    mutationFn: async (seat) => {
      const res = await axios.put(
        `${apiUrl}bookings/admin/seats/${seat.id}/`,
        seat,
        {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSeats", tripId]);
      setSelectedSeats(null);
    },
  });
  if (isLoading) return <div className="admin-seats">Loading seats...</div>;
  if (isError) return <div className="admin-seats">Failed to load seats</div>;
  const setsPerRow = 4;
  const rows = [];
  for (let i = 0; i < seats.length; i += setsPerRow) {
    rows.push(seats.slice(i, i + setsPerRow));
  }
  return (
    <div className="admin-seats">
      <div className="admin-seats__header">
        <button onClick={onBack}>← Back to Trips</button>
        <h2>Manage Seats for Trip</h2>
      </div>
      <div className="admin-seats__layout">
        <div className="driver-seat">Driver</div>
        {rows.map((row, rowIndex) => (
          <div className="seat-row" key={rowIndex}>
            {/*Left two seats */}
            <div className="seat-side">
              {row.slice(0, 2).map((seat) => (
                <div
                  key={seat.id}
                  className={`seat-card ${
                    seat.gender_preference === "WOMEN_ONLY"
                      ? "women-only"
                      : "any"
                  }`}
                  onClick={() => setSelectedSeats(seat)}
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>
            <div className="aisle-gap"></div>
            {/* {right two seats } */}
            <div className="seat-side">
              {row.slice(2, 4).map((seat) => (
                <div
                  key={seat.id}
                  className={`seat-card ${
                    seat.gender_preference === "WOMEN_ONLY"
                      ? "women-only"
                      : "any"
                  }`}
                  onClick={() => setSelectedSeats(seat)}
                >
                  {seat.seat_number}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="box any-box"></div> Any
        </div>
        <div className="legend-item">
          <div className="box women-box"></div> Women Only
        </div>
      </div>
      {selectedSeat && (
        <div className="seat-modal">
          <div className="seat-modal__content">
            <h3>Edit Seat #{selectedSeat.seat_number}</h3>
            <select
              value={selectedSeat.gender_preference}
              onChange={(e) =>
                setSelectedSeats({
                  ...selectedSeat,
                  gender_preference: e.target.value,
                })
              }
            >
              <option value="ANY">ANY</option>
              <option value="WOMEN_ONLY">WOMEN ONLY</option>
            </select>
            <div className="seat-modal__actions">
              <button onClick={() => updateSeat.mutate(selectedSeat)}>
                Save
              </button>
              <button onClick={() => setSelectedSeats(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeats;
