import axios from "axios";

const API = axios.create({
  baseURL: "https://sih-student-api.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default API;
