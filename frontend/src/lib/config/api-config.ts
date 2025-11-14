const isDocker = window.location.hostname !== "localhost";

export const API_BASE_URL = isDocker
  ? "http://backend:5000"
  : "http://localhost:5000";