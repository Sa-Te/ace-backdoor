// src/components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import dashboardIcon from "../public/assets/icons/dashIcon.svg";
import rightArrow from "../public/assets/icons/right-arrowIcon.svg";
import settingIcon from "../public/assets/icons/settingIcon.svg";
import logoutIcon from "../public/assets/icons/logOut.svg";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove JWT token
    navigate("/login"); // Redirect to login page
  };

  // Determine if we're on the settings page
  const isOnSettingsPage = location.pathname.startsWith("/settings");

  return (
    <div className="bg-primaryColor text-white min-h-screen w-64 border-r-[1px] border-[#142860]">
      <nav className="flex flex-col h-full">
        <ul className="flex flex-col flex-1">
          {/* Dashboard Link */}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-5 font-GilroysemiBold text-base w-full px-4 py-3 ${
                  isActive
                    ? "bg-accentColor text-[#CFDBFF]"
                    : "hover:bg-accentColor hover:text-[#CFDBFF]"
                }`
              }
            >
              <img src={dashboardIcon} alt="Dashboard icon" />
              Dashboard
              <img src={rightArrow} alt="Right Arrow" className="ml-auto" />
            </NavLink>
          </li>

          {/* Conditionally render Settings Link */}
          {isOnSettingsPage && (
            <li>
              <NavLink
                to={location.pathname} // Keep the same settings URL
                className={({ isActive }) =>
                  `flex items-center gap-5 font-GilroysemiBold text-base w-full px-4 py-3 ${
                    isActive
                      ? "bg-accentColor text-[#CFDBFF]"
                      : "hover:bg-accentColor hover:text-[#CFDBFF]"
                  }`
                }
              >
                <img src={settingIcon} alt="Settings icon" />
                Settings
                <img src={rightArrow} alt="Right Arrow" className="ml-auto" />
              </NavLink>
            </li>
          )}
        </ul>
        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 font-GilroysemiBold text-lg w-full px-10 py-3 hover:bg-accentColor hover:text-white border-[1px] border-[#142860]"
          >
            <img src={logoutIcon} alt="Logout icon" />
            Logout
            <img src={rightArrow} alt="Right Arrow" className="ml-auto" />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
