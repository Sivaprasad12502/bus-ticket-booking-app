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
import {
  FaRupeeSign,
  FaCreditCard,
  FaCheckCircle,
  FaUser,
} from "react-icons/fa";
import { MdEventSeat } from "react-icons/md";
import Navbar from "../../component/Navbar/Navbar";
import "./payment.scss";
import { useQuery } from "@tanstack/react-query";
const stripePromise = loadStripe(
  "pk_test_51SL3Ra2MbjQATJw5jJdivM5nUnL4OIElPyPU82FF2YPa9b6N9BXR4cG0ZTvEVRXPeoumM94yVzqRTtiJxuZld1gT00MjmH6nGB"
);

const CheckoutForm = ({
  onwardBookingId,
  returnBookingId,
  clientSecret,
  returnClientSecret,
  isRoundTrip,
  token,
  apiUrl,
  navigate,
  totalAmount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentStep,setPaymentStep]=useState("");//Track which payment is processing

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result1 = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result1.error) throw new Error(result1.error.message);
      await axios.post(
        `${apiUrl}bookings/bookings/confirm-payment/`,
        { booking_ids: [Number(onwardBookingId)] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Return payment if round trip
      if (isRoundTrip && returnClientSecret) {
        const result2 = await stripe.confirmCardPayment(returnClientSecret, {
          payment_method: { card: elements.getElement(CardElement) },
        });
        if (result2.error) throw new Error(result2.error.message);
        await axios.post(
          `${apiUrl}bookings/bookings/confirm-payment/`,
          { booking_ids: [Number(returnBookingId)] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success("payment Successful");
      navigate("/bookings");
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <div className="checkout-form-wrapper">
      <form onSubmit={handleSubmit} className="stripe-form">
        <div className="card-element-wrapper">
          <FaCreditCard className="card-icon" />
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
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
        <button
          type="submit"
          disabled={!stripe || loading || success}
          className="btn-pay"
        >
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
  const onwardBookingId = params.get("onwardId");
  const returnBookingId = params.get("returnId"); //may be null
  const totalAmount = params.get("totalamount");
  const isRoundTrip = !!returnBookingId;
  const [clientSecret, setClientSecret] = useState("");
  const [returnClientSecret, setReturnClientSecret] = useState("");
  console.log("onwardBookingId:", onwardBookingId);
  console.log("returnBookingId:", returnBookingId);
  console.log("token:", token);
  const {
    data: allbookings,
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

  const onwardBooking = allbookings?.find(
    (b) => b.id == Number(onwardBookingId)
  );
  const returnBooking = allbookings?.find(
    (b) => b.id == Number(returnBookingId)
  );
  if(onwardBooking){

    console.log("onwardBooking: in pyament page", onwardBooking)
  }
  if(returnBooking){
    console.log("returnBooking: in payment page",returnBooking)
  }
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const onwardRes = await axios.post(
          `${apiUrl}bookings/bookings/create-payment-intent/`,
          { booking_ids: [Number(onwardBookingId)] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClientSecret(onwardRes.data.clientSecret);
        console.log("Payment Intent Reponse", onwardRes.data);
        console.log("Payment Intent Response:", onwardRes.data);
        if (isRoundTrip) {
          const returnRes = await axios.post(
            `${apiUrl}bookings/bookings/create-payment-intent/`,
            { booking_ids: [Number(returnBookingId)] },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setReturnClientSecret(returnRes.data.clientSecret);
          console.log("return payment intent response:", returnRes.data);
        }
      } catch (err) {
        console.error(err);
        //dbbbbbb lockkk
        // toast.error("Failed to initialize payment. Please try again.");
      }
    };

    if (onwardBookingId) createPaymentIntent();
  }, [onwardBookingId, returnBookingId, isRoundTrip]);

  if (isLoading || !clientSecret || (isRoundTrip && !returnClientSecret)) {
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
          <p className="trip-type-badge">
            {isRoundTrip ? "Round Trip Booking":"One Way Booking"}
          </p>
        </div>

        <div className="payment-content">
          <div className="booking-summary">
            {/* <h3 className="summary-title">Onward Trip</h3> */}

            {onwardBooking && (
              <>
                <div className="summary-total">
                  <span>Total Amount</span>
                  <span className="amount">
                    <FaRupeeSign /> {totalAmount}
                  </span>
                </div>

                <div className="passengers-list">
                  <h3>Onward Trip</h3>
                  <h4>Passenger Details</h4>
                  {onwardBooking.passengers?.map((item, index) => (
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
                  {isRoundTrip && returnBooking && (
                    <>
                      <h3>Return Trip</h3>
                      <h4>Passenger Details</h4>
                      {returnBooking.passengers?.map((item, index) => (
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
                              {item.boarding_location} →{" "}
                              {item.dropping_location}
                            </p>
                            <p className="fare">
                              Fare: <FaRupeeSign /> {item.fare}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="payment-form-section">
            <h3>Payment Information</h3>

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  onwardBookingId={onwardBookingId}
                  returnBookingId={returnBookingId}
                  clientSecret={clientSecret}
                  returnClientSecret={returnClientSecret}
                  isRoundTrip={isRoundTrip}
                  token={token}
                  apiUrl={apiUrl}
                  navigate={navigate}
                />
              </Elements>
            )}

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
