import React, { useContext, useState } from "react";
import { Context } from "../../context/Context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useForm from "../../hooks/useForm/useForm";
import axios from "axios";
import "./AdminSeats.scss";
const AdminSeats = ({ tripId, onBack, bus }) => {
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
  // sleeper
  const generateSleeperLayout = (seatNumbers) => {
    const rows = [];
    for (let i = 0; i < seatNumbers.length; i += 3) {
      rows.push({
        left: seatNumbers[i] || null,
        right: [seatNumbers[i + 1] || null, seatNumbers[i + 2] || null],
      });
    }
    // split into upper + lower
    const mid = Math.ceil(rows.length / 2);
    return {
      upper: rows.slice(0, mid),
      lower: rows.slice(mid),
    };
  };
  const renderSeatLayout = () => {
    if (bus.bus_type === "Sleeper") {
      const layout = generateSleeperLayout(seats);
      return (
        <div className="sleeper-layout">
          {/* Upper Deck  */}
          <div className="deck upper-deck">
            <h4>upper Deck</h4>
            <div className="deck-rows">
              {layout.upper.map((row, ridx) => (
                <div className="sleeper-row" key={`upper-row ${ridx}`}>
                  {/* left single - Single Berth  */}
                  <div className="berth-block left-block">
                    <div className="berth-block left-block">
                      {row.left && renderSleeperBerth(row.left)}
                      {/* Aisle  */}
                      <div className="sleepr-aisle"></div>
                      {/* right side -Double Berths  */}
                      <div className="berth-block right-block">
                        {row.right[0] && renderSleeperBerth(row.right[0])}
                        {row.right[1] && renderSleeperBerth(row.right[1])}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* lower Deck  */}
          <div className="deck lower-deck">
            <h4>Lower Deck</h4>
            <div className="deck-rows">
              {layout.lower.map((row, ridx) => (
                <div className="sleeper-row" key={`upper-row ${ridx}`}>
                  {/* left single - Single Berth  */}
                  <div className="berth-block left-block">
                    <div className="berth-block left-block">
                      {row.left && renderSleeperBerth(row.left)}
                      {/* Aisle  */}
                      <div className="sleepr-aisle"></div>
                      {/* right side -Double Berths  */}
                      <div className="berth-block right-block">
                        {row.right[0] && renderSleeperBerth(row.right[0])}
                        {row.right[1] && renderSleeperBerth(row.right[1])}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    if (bus.layout_type === "2*3") {
      const perRow = 5;
      const rows = [];
      const total = seats.length;
      //Leave last 5 or 6 seats for back row
      const backRowSeatsCount = 5;
      const normalSeatsCount = total - backRowSeatsCount;
      //Normal rows
      for (let i = 0; i < normalSeatsCount; i += perRow) {
        rows.push(seats.slice(i, i + perRow));
      }
      // Back row
      const backRow = seats.slice(normalSeatsCount);
      return (
        <>
          {rows.map((row, ridx) => (
            <div className="seat-row" key={`row-${ridx}`}>
              <div className="seat-side left">
                {row.slice(0, 2).map((num) => renderSeat(num))}
              </div>
              <div className="aisle"></div>
              <div className="seat-side right">
                {row.slice(2, 5).map((num) => renderSeat(num))}
              </div>
            </div>
          ))}
          {/* back row  */}
          <div className="seat-row back-row">
            {backRow.map((num) => renderSeat(num))}
          </div>
        </>
      );
    }
    //default 2*2 seat layout
    const perRow = 4;
    const rows = [];
    const total = seats.length;
    //Leave last 5 or 6 seats for back row
    const backRowSeatsCount = 6;
    const normalSeatsCount = total - backRowSeatsCount;
    //Normal rows
    for (let i = 0; i < normalSeatsCount; i += perRow) {
      rows.push(seats.slice(i, i + perRow));
    }
    // Back row
    const backRow = seats.slice(normalSeatsCount);
    return (
      <>
        {rows.map((row, ridx) => (
          <div className="seat-row" key={`row-${ridx}`}>
            <div className="seat-side left">
              {row.slice(0, 2).map((num) => renderSeat(num))}
            </div>
            <div className="aisle"></div>
            <div className="seat-side right">
              {row.slice(2, 4).map((num) => renderSeat(num))}
            </div>
          </div>
        ))}
        {/* back row  */}
        <div className="seat-row back-row">
          {backRow.map((num) => renderSeat(num))}
        </div>
      </>
    );
  };
  const renderSeat = (num) => {
    return (
      <div
        key={num.id}
        className={`seat-card ${
          num.gender_preference === "WOMEN_ONLY" ? "women-only" : "any"
        }`}
        onClick={() => setSelectedSeats(num)}
      >
        {num.seat_number}
      </div>
    );
  };
  const renderSleeperBerth = (num) => {
    return (
      <div
        key={num.id}
        className={`seat-card berth ${
          num.gender_preference === "WOMEN_ONLY" ? "women-only" : "any"
        }`}
        onClick={() => setSelectedSeats(num)}
      >
        <div className="berth-content">
          <span className="berth-number"> {num.seat_number}</span>
        </div>
        <div className="berth-pillow"></div>
      </div>
    );
  };
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
        {/* <div className="driver-seat">Driver</div> */}
        {/* {rows.map((row, rowIndex) => (
          <div className="seat-row" key={rowIndex}>
            Left two seats
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
            {right two seats }
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
        ))} */}
        {renderSeatLayout()}
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
