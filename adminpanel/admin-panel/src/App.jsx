import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Trips from "./pages/Trips/Trips";
import Bookings from "./pages/Bookings/Bookings";
import Payments from "./pages/Payments/Payments";
import Reports from "./pages/Reports/Reports";
import Routess from "./pages/Routes/Routes";
import Buses from "./pages/Buses/Buses";
import Settings from "./pages/Settings/Settings";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="buses" element={<Buses />} />
          <Route path="routes" element={<Routess />} />
          <Route path="trips" element={<Trips />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
