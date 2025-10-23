import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import Register from "./pages/register/Register";
import BusCard from "./pages/BusCard/BusCard";
import { SeatDetail } from "./pages/SeatDetail/SeatDetail";
import ProtectedRoute from "./component/ProtectedRoute/ProtectedRoute";
import AddPassenger from "./pages/AddPassenger/AddPassenger";
import Payment from "./pages/payement/Payment";
import MyBooking from "./pages/MyBooking/MyBooking";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/busDetails"
          element={
            <ProtectedRoute>
              <BusCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/busDetails/selectSeat"
          element={
            <ProtectedRoute>
              <SeatDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/selectSeat/addpassenger"
          element={
            <ProtectedRoute>
              <AddPassenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBooking />
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
