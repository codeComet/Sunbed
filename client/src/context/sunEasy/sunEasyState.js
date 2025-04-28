import React, { useState, useEffect, createContext } from "react";
import axios from "axios";

export const SuneasyContext = createContext();

const SunEasyState = (props) => {
  const [restaurants, setRestaurants] = useState([]);
  const [user, setUser] = useState({});
  const [worker, setWorker] = useState({});
  const [singleRestaurant, setSingleRestaurant] = useState({});

  useEffect(() => {
    // Check if we're on the worker dashboard page
    const isWorkerDashboard = window.location.pathname.includes('/workerdashboard');
    
    // Only call these functions if not on worker dashboard
    if (!isWorkerDashboard) {
      getRestaurants();
      getUser();
    }
  }, []);

  const getUser = async () => {
    try {
      let token = localStorage.getItem(`token`);
      const response = await axios.post(`http://localhost:5001/auth/getuser`, {
        token,
      });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error getting user: ", error);
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`http://localhost:5001/auth/login`, {
        email,
        password,
      });
      const { user, token } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logoutUser = () => {
    try {
      localStorage.removeItem("token");
      setUser({});
      return true;
    } catch (error) {
      return false;
    }
  };

  const getRestaurants = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/restaurants`);
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error getting restaurants: ", error);
    }
  };

  const getRestaurantDetails = async (restaurantId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/restaurants/${restaurantId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting restaurant details:", error);
      return false;
    }
  };

  const updateRestaurantDetails = async (restaurantId, data, floorplanId) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.put(
          `http://localhost:5001/restaurants/${restaurantId}`,
          { data, token, floorplanId }
        );
        if (!response.data) {
          throw new Error("Failed to update restaurant");
        }
        return response.data;
      } catch (error) {
        console.error("Error updating restaurant:", error);
        // Handle error or return null
        return false;
      }
    } else {
      return;
    }
  };

  const getAllSunbedsByDate = async (restaurantId, date) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/restaurants/sunbeds/${restaurantId}/${date}`
      );
      return response.data;
    } catch (error) {
      console.error("Error retrieving sunbed details:", error);
      return null;
    }
  };

  const handleBooking = async (form) => {
    try {
      const response = await axios.post(`http://localhost:5001/bookings`, form);
      return response.data;
    } catch (error) {
      return false;
    }
  };

  const getBookings = async (restaurantId, sunbedId) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.post(
          `http://localhost:5001/bookings/sunbed/${sunbedId}`,
          { token }
        );
        return response.data;
      } catch (error) {
        console.error("Error getting bookings:", error);
        return [];
      }
    } else {
      return;
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      //let token = localStorage.getItem(`token`)
      const response = await axios.post(
        `http://localhost:5001/bookings/${bookingId}`
      );
      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      return false;
    }
  };

  const getreservationreport = async (minDate, maxDate) => {
    try {
      let token = localStorage.getItem(`token`);

      const response = await axios.post(
        `http://localhost:5001/bookings/reservationreport`,
        { minDate, maxDate, token }
      );
      if (!response.data) {
        throw new Error("No Reservation Found");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching reservation report: ", error);
      return false;
    }
  };
  const handlePayment = async (
    bookingId,
    newPaymentStatus,
    sunbedRandomId,
    restaurantId
  ) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.put(
          `http://localhost:5001/bookings/${bookingId}`,
          { newPaymentStatus, token, sunbedRandomId, restaurantId }
        );
        return response.data;
      } catch (error) {
        console.error("Error retrieving sunbed details:", error);
        return null;
      }
    } else {
      return;
    }
  };
  const updatesunbedprice = async (restaurantId, sunbedId, newData) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.put(
          `http://localhost:5001/restaurants/sunbed/${restaurantId}/${sunbedId}`,
          { newData, token }
        );
        if (!response.data) {
          throw new Error("Failed to update sunbed");
        }
        return response.data;
      } catch (error) {
        console.error("Error updating sunbed:", error);
        return false;
      }
    } else {
      return;
    }
  };
  const addSunbed = async (restaurantId, data, floorplanId) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.post(
          `http://localhost:5001/restaurants/sunbed/${restaurantId}`,
          { data, token, floorplanId }
        );

        if (!response.data) {
          throw new Error("Failed to add sunbed");
        }

        return response.data;
      } catch (error) {
        console.error("Error adding sunbed:", error);
        return false;
      }
    } else {
      return;
    }
  };
  const deletesunbed = async (restaurantId, sunbedId, floorplanId) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.post(
          `http://localhost:5001/restaurants/sunbed/${restaurantId}/${sunbedId}`,
          { token, floorplanId }
        );
        if (!response.data) {
          throw new Error("Failed to add sunbed");
        }
        return response.data;
      } catch (error) {
        console.error("Error adding sunbed:", error);
        return false;
      }
    } else {
      return;
    }
  };
  const deleteFloorplan = async (floorplanId, restaurantId) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.post(
          `http://localhost:5001/restaurants/deletefloorplan/${floorplanId}`,
          { token, restaurantId }
        );
        if (!response.data) {
          throw new Error("Failed to delete floorplan");
        }
        return response.data;
      } catch (error) {
        console.error("Error deleting floorplan:", error);
        return false;
      }
    } else {
      return;
    }
  };
  const addFloorplan = async (restaurantId) => {
    if (user) {
      try {
        let token = localStorage.getItem(`token`);
        const response = await axios.post(
          `http://localhost:5001/restaurants/floorplan/${restaurantId}`,
          { token }
        );
        if (!response.data) {
          throw new Error("Failed to add floorplan");
        }
        return response.data;
      } catch (error) {
        console.error("Error adding floorplan:", error);
        return false;
      }
    } else {
      return;
    }
  };

  const searchRandomId = async (code) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/bookings/search/${code}`
      );
      if (!response.data) {
        throw new Error("Failed to add sunbed");
      }
      return response.data;
    } catch (error) {
      console.error("Error adding sunbed:", error);
      return false;
    }
  };
  const getSunbedById = async (restaurantId, sunbedId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/restaurants/getrestaurantsunbed/${restaurantId}/${sunbedId}`
      );
      if (!response.data) {
        throw new Error("Failed to add sunbed");
      }
      return response.data;
    } catch (error) {
      console.error("Error adding sunbed:", error);
      return false;
    }
  };
  const closeSunbed = async (bookingId) => {
    try {
      let token = localStorage.getItem(`token`);
      const response = await axios.post(
        `http://localhost:5001/bookings/closesunbed/${bookingId}`,
        { token }
      );
      if (!response.data) {
        throw new Error("Failed to Close sunbed");
      }
      return response.data;
    } catch (error) {
      console.error("Error adding sunbed:", error);
      return false;
    }
  };

const createWorker = async (workerData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/auth/register-worker",
        {
          ...workerData,
          token,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating worker:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create worker",
      };
    }
  };

const loginWorker = async (email, password) => {
  try {
    const response = await axios.post(`http://localhost:5001/auth/worker-login`, {
      email,
      password,
    });
    
    if (response.data.success) {
      localStorage.setItem("token", response.data.token);
      console.log("Worker data:", response.data.worker); // Add this line to log worker data
      setWorker(response.data.worker); // Set worker state instead of user state
      return { success: true };
    } else {
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error logging in worker:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Login failed" 
    };
  }
};

const getWorker = async () => {
  try {
    let token = localStorage.getItem(`token`);
    const response = await axios.post(`http://localhost:5001/auth/get-worker`, {
      token,
    });
    setWorker(response.data.user); // Set worker state instead of user state
  } catch (error) {
    console.error("Error getting worker: ", error);
  }
}

    
  const contextValue = {
    user,
    worker, // Add worker to context
    getRestaurants,
    getUser,
    restaurants,
    singleRestaurant,
    setSingleRestaurant,
    loginUser,
    logoutUser,
    getRestaurantDetails,
    handleBooking,
    getAllSunbedsByDate,
    getBookings,
    deleteBooking,
    getreservationreport,
    handlePayment,
    updateRestaurantDetails,
    addSunbed,
    updatesunbedprice,
    deletesunbed,
    searchRandomId,
    getSunbedById,
    closeSunbed,
    addFloorplan,
    deleteFloorplan,
    createWorker,
    loginWorker,
    getWorker,
  };

  return (
    <SuneasyContext.Provider value={contextValue}>
      {props.children}
    </SuneasyContext.Provider>
  );
};

export default SunEasyState;
