import axios from "axios";

const instance = axios.create({
  baseURL: "https://apijquery.com", // Replace with your backend's URL
  // You can add more default settings here if needed
});

// Add a request interceptor to include the token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(
      "Attaching Authorization header:",
      config.headers.Authorization
    );
  } else {
    console.log("No token found in localStorage.");
  }
  return config;
});

export default instance;
