import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://app.thebotcrm.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiClient;