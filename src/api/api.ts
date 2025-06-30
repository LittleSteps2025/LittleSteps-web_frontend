// api.ts or wherever you call backend
import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api"; // or your deployed backend URL

export const getHello = async () => {
  const res = await axios.get(`${API_BASE_URL}/hello`);
  return res.data;
};

export const getUsers = async () => {
  const res = await axios.get(`${API_BASE_URL}/users`);
  return res.data;
};

axios.get('http://localhost:5001/api/hello').then(res => {
  console.log(res.data);
});
