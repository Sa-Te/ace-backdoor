// src/components/Layout.jsx (for example)
import React from "react";
import Sidebar from "./Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Layout = ({ children }) => {
  return (
    <>
      <div className="flex gap-8 items-center px-10 py-4 bg-primaryColor border-b border-[#142860] ">
        <h2 className="text-3xl text-[#3D67DE] font-GilroyBold">AceBackdoor</h2>
        <p className="text-bold mt-2 text-[#3D67DE] font-GilroysemiBold">
          /adminpanel
        </p>
      </div>

      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 bg-primaryColor">{children}</div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        pauseOnFocusLoss={false}
      />
    </>
  );
};

export default Layout;
