import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./WorkerLogin.css";

const WorkerLogin = () => {
  const { loginWorker } = useContext(SuneasyContext);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await loginWorker(credentials.email, credentials.password);
      
      if (result.success) {
        toast.success("Logged in successfully");
        navigate("/workerdashboard"); // Fix the path to match App.js route
      } else {
        toast.error(result.message || "Invalid credentials");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="worker-login-container">
      <div className="worker-login-form-container">
        <h2>Worker Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerLogin;