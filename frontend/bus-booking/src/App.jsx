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
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import AdminDashBoard from "./pages/AdminDashBoard/AdminDashBoard";
import AdminLayout from "./Layout/AdminLayout/AdminLayout";
import AdminBuses from "./pages/AdminBuses/AdminBuses";
import AdminRoutes from "./pages/AdminRoutes/AdminRoutes";
import AdminTrips from "./pages/AdminTrips/AdminTrips";
import AdminBookings from "./pages/AdminBookings/AdminBookings";
import AdminProtectedRoute from "./component/AdminProtectRoute/AdminProtectedRoute";

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

        {/* ========== for admin ========== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
          <Route index element={<AdminDashBoard />} />
          <Route path="dashboard" element={<AdminDashBoard />} />
          <Route path="buses" element={<AdminBuses />} />
          <Route path="routes" element={<AdminRoutes/>} />
          <Route path="trips" element={<AdminTrips/>} />
          <Route path="bookings" element={<AdminBookings/>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
