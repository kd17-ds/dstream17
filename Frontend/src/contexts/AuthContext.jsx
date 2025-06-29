import { createContext, useState } from "react";
import axios from "axios";
import httpStatus from "http-status";
import { BASE_URL } from "../constants/constants";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${BASE_URL}`,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (name, username, password, email) => {
    try {
      const res = await client.post("/signup", {
        name,
        username,
        password,
        email,
      });

      if (res.status === httpStatus.CREATED) {
        return res.data.message;
      }
    } catch (err) {
      throw err;
    }
  };


  const handleLogin = async (email, password) => {
    try {
      const res = await client.post("/login", {
        email,
        password,
      });

      if (res.status === httpStatus.OK) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        return res.data.message;
      }
    } catch (err) {
      throw err;
    }
  };

  const data = {
    user,
    setUser,
    handleRegister,
    handleLogin,
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
