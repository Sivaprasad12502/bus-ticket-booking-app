import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import './TicketCancellation.scss'
const cancellationPolicy = [
  {
    time_before_trip_start: "Before 72 HRS",
    cancellation_slab: "0",
    refund_slab: "Full Refund",
  },
  {
    time_before_trip_start: "48 HRS - 72 HRS",
    cancellation_slab: "10%",
    refund_slab: "90%",
  },
  {
    time_before_trip_start: "24 HRS - 48 HRS",
    cancellation_slab: "25%",
    refund_slab: "75%",
  },
  {
    time_before_trip_start: "12 HRS - 24 HRS",
    cancellation_slab: "40%",
    refund_slab: "60%",
  },
  {
    time_before_trip_start: "2 HRS - 12 HRS",
    cancellation_slab: "50%",
    refund_slab: "50%",
  },
  {
    time_before_trip_start: "Within 2 HRS",
    cancellation_slab: "No Refund",
    refund_slab: "0",
  },
];
const TicketCancellation = () => {
  const [showTable, setShowTable] = useState(false);
  return (
    <div className="cancellation-container">
      <h4
        className={showTable ? "rotate" : ""}
        onClick={() => setShowTable(!showTable)}
      >
        Cancellation Policies <FaChevronDown />
      </h4>

      {showTable && (
        <table className="cancellation-table">
          <thead>
            <tr>
              <th>Time Before Trip Start</th>
              <th>Cancellation Slab</th>
              <th>Refund Slab</th>
            </tr>
          </thead>

          <tbody>
            {cancellationPolicy.map((item, index) => (
              <tr key={index}>
                <td>{item.time_before_trip_start}</td>
                <td>{item.cancellation_slab}</td>
                <td>{item.refund_slab}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TicketCancellation;
