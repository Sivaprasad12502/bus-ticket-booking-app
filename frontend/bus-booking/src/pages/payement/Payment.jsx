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
import { FaRupeeSign, FaCreditCard, FaCheckCircle, FaUser } from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import Navbar from "../../component/Navbar/Navbar";
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
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        await axios.post(
          `${apiUrl}bookings/bookings/${booking_Id}/confirm-payment/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Payment successful", result.paymentIntent);
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  useEffect(() => {
    if (success) {
      toast.success("Payment successful! Redirecting...", {
        onClose: () => {
          navigate("/bookings");
        },
        autoClose: 2000,
      });
    }
  }, [success, navigate]);

  return (
    <div className="checkout-form-wrapper">
      <form onSubmit={handleSubmit} className="stripe-form">
        <div className="card-element-wrapper">
          <FaCreditCard className="card-icon" />
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            <FaCheckCircle /> Payment Successful!
          </div>
        )}
        <button type="submit" disabled={!stripe || loading || success} className="btn-pay">
          {loading ? (
            <>
              <span className="spinner"></span> Processing...
            </>
          ) : success ? (
            <>
              <FaCheckCircle /> Payment Complete
            </>
          ) : (
            <>
              <FaCreditCard /> Pay Now
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const Payment = () => {
  const { apiUrl, token, navigate } = useContext(Context);
  const params = new URLSearchParams(useLocation().search);
  const booking_Id = params.get("bookingId");
  const totalAmount = params.get("totalamount");

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

  const bookedTickets = bookings?.find((b) => b.id == Number(booking_Id));

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log("Creating payment intent for booking:", booking_Id);
        const res = await axios.post(
          `${apiUrl}bookings/bookings/${booking_Id}/create-payment-intent/`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(res.data.clientSecret);
        console.log("Payment Intent Response:", res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize payment. Please try again.");
      }
    };

    if (booking_Id) createPaymentIntent();
  }, [booking_Id, apiUrl, token]);

  if (isLoading || !clientSecret) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="loader-container">
          <div className="loader"></div>
          <p>Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="payment-page">
        <Navbar />
        <div className="error-container">
          <p>⚠️ Error loading payment information. Please try again.</p>
          <button onClick={() => navigate("/bookings")} className="btn-home">
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <div className="payment-header">
          <h2>Complete Your Payment</h2>
          <p className="booking-id">Booking #{booking_Id}</p>
        </div>

        <div className="payment-content">
          <div className="booking-summary">
            <h3>Booking Summary</h3>

            {bookedTickets && (
              <>
                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="amount">
                    <FaRupeeSign /> {totalAmount}
                  </span>
                </div>

                <div className="passengers-list">
                  <h4>Passenger Details</h4>
                  {bookedTickets.passengers?.map((item, index) => (
                    <div key={item.id} className="passenger-item">
                      <div className="passenger-header">
                        <span className="passenger-name">
                          <FaUser /> {item.name}
                        </span>
                        <span className="seat-badge">
                          <MdEventSeat /> {item.seat_number}
                        </span>
                      </div>
                      <div className="passenger-details">
                        <p className="journey">
                          {item.boarding_location} → {item.dropping_location}
                        </p>
                        <p className="fare">
                          Fare: <FaRupeeSign /> {item.fare}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="payment-form-section">
            <h3>Payment Information</h3>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                booking_Id={booking_Id}
                clientSecret={clientSecret}
                token={token}
                apiUrl={apiUrl}
                navigate={navigate}
              />
            </Elements>
            <div className="security-note">
              <p>🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

