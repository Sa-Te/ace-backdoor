import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000", // Replace with your backend's URL
  // You can add more default settings here if needed
});

export default instance;
