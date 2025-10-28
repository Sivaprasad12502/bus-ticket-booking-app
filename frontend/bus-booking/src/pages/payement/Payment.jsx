import React, { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Context } from "../../context/Context";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import "./payment.scss";
import { useQuery } from "@tanstack/react-query";

const CheckoutForm = ({
  booking_Id,
  clientSecret,
  token,
  apiUrl,
  navigate,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else if (result.paymentIntent.status === "succeeded") {
        // Call backend to mark payment SUCCESS
        await axios.post(
          `${apiUrl}bookings/bookings/${booking_Id}/confirm-payment/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Payment successfull", result.paymentIntent);
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      toast.success("Payment is successful", {
        onClose: () => {
          navigate("/bookings");
        },
        autoClose: 2000,
      });
    }
  }, [success, navigate]);

  return (
    <form onSubmit={handleSubmit} className="stripe-form">
      <CardElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
};

const Payment = () => {
  const { apiUrl, token, navigate } = useContext(Context);
  const params = new URLSearchParams(useLocation().search);
  const booking_Id = params.get("bookingId");
  const totalAmount = params.get("totalamount");
  const seats = params.get("seats")?.split(",") || [];

  const [clientSecret, setClientSecret] = useState("");
  const stripePromise = loadStripe(
    "pk_test_51SL3Ra2MbjQATJw5jJdivM5nUnL4OIElPyPU82FF2YPa9b6N9BXR4cG0ZTvEVRXPeoumM94yVzqRTtiJxuZld1gT00MjmH6nGB"
  );
  const {
    data: bookings,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await axios.get(`${apiUrl}bookings/bookings/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onError: (err) => console.log(err),
  });
  console.log(bookings, "boooookings in payment page");
  const bookedTickets = bookings?.find((b) => b.id == Number(booking_Id));
  console.log(bookedTickets, "bookedTickets in payment page");
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log("creating payment intent fo booking:", booking_Id);
        const res = await axios.post(
          `${apiUrl}bookings/bookings/${booking_Id}/create-payment-intent/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(res.data.clientSecret);
        console.log("Payment Intent Response:", res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (booking_Id) createPaymentIntent();
  }, [booking_Id, apiUrl, token]);

  if (!clientSecret)
    // return <p>Loading payment information for booking {booking_Id}...</p>;
    return (
      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading payment information for booking ...
      </div>
    );

  console.log("booking-id", booking_Id);
  return (
    <div className="payment-container">
      <div className="checkout-header">
        <h2>Complete Your Payment</h2>
        {/* <p>Booking #{booking_Id}</p> */}
      </div>

      <div className="checkout-summary">
        <p>
          Total Amount: <span>₹{totalAmount}</span>
        </p>
        <div>
          {bookedTickets?.passengers?.map((item) => (
            <div key={item.id}>
              <p>Passenger: {item.name}</p>
              <p>Seat Number: {item.seat_number}</p>
              <p>Fare: ₹{item.fare}</p>
              <p>
                Boarding: {item.boarding_location} → Dropping:{" "}
                {item.dropping_location}
              </p>
            </div>
          ))}
        </div>
        {/* <p className="seats">Seats: {seats.join(", ")}</p> */}
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <CheckoutForm
          booking_Id={booking_Id}
          clientSecret={clientSecret}
          token={token}
          apiUrl={apiUrl}
          navigate={navigate}
        />
      </Elements>
    </div>
  );
};

export default Payment;
