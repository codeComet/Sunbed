import React, { useState, useContext, useEffect } from "react";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { toast } from "react-toastify";
import "./WorkerManagement.css";

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWorkerId, setCurrentWorkerId] = useState(null);
  const { createWorker } = useContext(SuneasyContext);

  // Fetch workers on component mount
  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      // Updated endpoint to match the route in authRoutes.js
      const response = await fetch("http://localhost:5001/auth/get-workers", {
        method: "POST", // Changed to POST as the route is defined as POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token")
        })
      });
      const data = await response.json();
      
      if (data.success) {
        setWorkers(data.workers);
      } else {
        toast.error("Failed to fetch workers");
      }
    } catch (error) {
      console.error("Error fetching workers:", error);
      toast.error("An error occurred while fetching workers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editMode) {
      handleUpdateWorker();
    } else {
      handleCreateWorker();
    }
  };

  const handleCreateWorker = async () => {
    try {
      const result = await createWorker(formData);
      
      if (result.success) {
        toast.success("Worker created successfully!", {position: "bottom-right"});
        setWorkers([...workers, result.worker]);
        resetForm();
      } else {
        toast.error(result.message || "Failed to create worker");
      }
    } catch (error) {
      console.error("Error creating worker:", error);
      toast.error("An error occurred while creating the worker", {position: "bottom-right"});
    }
  };

  const handleUpdateWorker = async () => {
    try {
      const response = await fetch(`http://localhost:5001/auth/update-worker/${currentWorkerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
          username: formData.username,
          email: formData.email,
          password: formData.password.length > 0 ? formData.password : undefined
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("Worker updated successfully!", {position: "bottom-right"});
        // Update the workers list with the updated worker
        setWorkers(workers.map(worker => 
          worker._id === currentWorkerId ? result.worker : worker
        ));
        resetForm();
      } else {
        toast.error(result.message || "Failed to update worker");
      }
    } catch (error) {
      console.error("Error updating worker:", error);
      toast.error("An error occurred while updating the worker", {position: "bottom-right"});
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      try {
        const response = await fetch(`http://localhost:5001/auth/delete-worker/${workerId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: localStorage.getItem("token")
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          toast.success("Worker deleted successfully!", {position: "bottom-right"});
          // Remove the deleted worker from the list
          setWorkers(workers.filter(worker => worker._id !== workerId));
        } else {
          toast.error(result.message || "Failed to delete worker");
        }
      } catch (error) {
        console.error("Error deleting worker:", error);
        toast.error("An error occurred while deleting the worker", {position: "bottom-right"});
      }
    }
  };

  const handleEditClick = (worker) => {
    setFormData({
      username: worker.username,
      email: worker.email,
      password: "", // Don't populate password for security reasons
    });
    setCurrentWorkerId(worker._id);
    setEditMode(true);
    setIsFormVisible(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
    });
    setIsFormVisible(false);
    setEditMode(false);
    setCurrentWorkerId(null);
  };

  const handleCancelClick = () => {
    if (isFormVisible) {
      resetForm();
    } else {
      setIsFormVisible(true);
    }
  };

  return (
    <div className="worker-management-container">
      <div className="worker-management-header">
        <h2>Worker Management</h2>
        <button
          className="add-worker-btn"
          onClick={handleCancelClick}
        >
          {isFormVisible ? "Cancel" : "Add Worker"}
        </button>
      </div>

      {isFormVisible && (
        <div className="worker-form-container">
          <h3>{editMode ? "Edit Worker" : "Create New Worker"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Name</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
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
                value={formData.password}
                onChange={handleChange}
                required={!editMode}
                placeholder={editMode ? "Leave blank to keep current password" : ""}
              />
              {editMode && <small>Leave blank to keep current password</small>}
            </div>
            <button type="submit" className="submit-btn">
              {editMode ? "Update Worker" : "Create Worker"}
            </button>
          </form>
        </div>
      )}

      <div className="workers-list">
        <h3>Workers</h3>
        {loading ? (
          <p>Loading workers...</p>
        ) : workers.length === 0 ? (
          <p>No workers found</p>
        ) : (
          <table className="workers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker, idx) => (
                <tr key={idx}>
                  <td>{worker.username}</td>
                  <td>{worker.email}</td>
                  <td>
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEditClick(worker)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteWorker(worker._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WorkerManagement;