import React from "react";
import { useContext } from "react";
import { Context } from "../../context/Context";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import "./NavBar.scss";
import { NavLink, useLocation } from "react-router-dom";
import { FaUser, FaArrowAltCircleLeft ,FaSignInAlt,FaFacebook,FaTwitter,FaInstagram,FaYoutube, FaDiceTwo} from "react-icons/fa";

const Navbar = () => {
  const { user, setUser, apiUrl, token, setToken, navigate } =
    useContext(Context);
  const location = useLocation();
  console.log(location, "location");
  console.log("user", user);
  console.log("token", token);
  const mutate = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem("refresh");
      await axios.post(
        `${apiUrl}users/logout/`,
        { refresh: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    },
    onSuccess: () => {
      console.log("loging out successfully:");
      setToken(null);
      setUser({});
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      // navigate("/login");
    },
    onError: (error) => {
      console.error("logout failed:", error);
    },
  });
  const handleLogout = () => {
    mutate.mutate();
  };
  return (
    <div className="user-header">
      <div>
        <ul>
          <li>Follow us:</li>
          <li><FaFacebook/></li>
          <li><FaTwitter/></li>
          <li><FaInstagram/></li>
          <li><FaYoutube/></li>
        </ul>
        {token ? (
          <button>
            {location.pathname == "/bookings" ? (
              <NavLink to={"/"}>
                {" "}
                <FaArrowAltCircleLeft /> Home
              </NavLink>
            ) : (
              <NavLink to={"/bookings"}>MY Bookings</NavLink>
            )}
          </button>
        ) : null}
        <button>Contact Us</button>
        {token ? (
          <button className="lgout-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button>
            <FaSignInAlt/><NavLink to={"/login"}>Login</NavLink>
          </button>
        )}
        
      </div>
      <div>
        <span>
          <FaUser />
          {user?.username}
        </span>
      </div>
    </div>
  );
};

export default Navbar;
