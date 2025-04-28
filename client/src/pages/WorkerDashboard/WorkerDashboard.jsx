import React, { useContext, useEffect, useState } from "react";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./WorkerDashboard.css";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/BookingModal/Modal";
import { toast } from "react-toastify";
import blueCircle from "../../pages/src/circle1.png";
import blueSquare from "../../pages/src/quareum1.jpg";
import blueVip from "../../pages/src/umbrella8.jpg";

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png"
});

// Create custom icons for different sunbed types
const createSunbedIcon = (type) => {
  let iconUrl;

  switch (type?.toLowerCase()) {
    case "circle":
      iconUrl = blueCircle;
      break;
    case "square":
      iconUrl = blueSquare;
      break;
    case "squarev":
      iconUrl = blueVip;
      break;
    default:
      iconUrl = "https://cdn-icons-png.flaticon.com/512/2163/2163350.png"; // Default beach chair icon
  }

  return L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const WorkerDashboard = () => {
  const { worker, user, logoutUser } = useContext(SuneasyContext);
  const [sunbeds, setSunbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSunbed, setSelectedSunbed] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description: "",
    payment: "false"
  });
  const [randomId, setRandomId] = useState("");

  useEffect(() => {
    // Check if token exists, if not redirect to login
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/workerlogin");
      return;
    }
    
    const fetchWorkerSunbeds = async () => {
      try {
        const apiUrl = `http://localhost:5001/auth/worker-sunbeds`;
        
        // Check if token exists
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          navigate("/workerlogin");
          return;
        }
        
        // Fetch the worker's data including assigned sunbeds
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token
          })
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
    
        const data = await response.json();
        if (data.success && data.sunbeds) {
          console.log("Successfully fetched sunbeds:", data.sunbeds.length);
          setSunbeds(data.sunbeds);
        } else {
          console.error("Failed to fetch sunbeds:", data.message);
          if (data.message === "Invalid token" || data.message === "Token expired") {
            // Handle invalid token by redirecting to login
            localStorage.removeItem("token");
            navigate("/workerlogin");
          }
        }
      } catch (error) {
        console.error("Error fetching worker's sunbeds:", error);
        // Add more detailed error logging
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
          console.error("Network error: Backend server might be down or unreachable");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerSunbeds();
  }, [worker, navigate]);

  const handleLogout = () => {
    // Remove token from local storage
    localStorage.removeItem("token");
    // Navigate to login page instead of reloading
    navigate("/workerlogin");
  };

  // Calculate center position based on sunbeds or use default
  const calculateMapCenter = () => {
    if (sunbeds.length > 0) {
      // Find average of all sunbed coordinates
      const totalLat = sunbeds.reduce((sum, sunbed) => sum + (sunbed.latitude || 0), 0);
      const totalLng = sunbeds.reduce((sum, sunbed) => sum + (sunbed.longitude || 0), 0);
      return [totalLat / sunbeds.length, totalLng / sunbeds.length];
    }
    return [41.9028, 12.4964]; // Default: Rome, Italy
  };

  const mapCenter = calculateMapCenter();

  // Generate a random ID for the booking
  const generateRandomId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  // Handle opening the booking modal
  const handleOpenBookingModal = (sunbed) => {
    setSelectedSunbed(sunbed);
    setRandomId(generateRandomId());
    setIsBookingModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm({
      ...bookingForm,
      [name]: value
    });
  };

  // Handle booking submission
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone) {
      toast.error("Please fill all required fields");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5001/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: bookingForm.name,
          email: bookingForm.email,
          phone: bookingForm.phone,
          date: bookingForm.date,
          time: bookingForm.time,
          description: bookingForm.description,
          payment: bookingForm.payment,
          sunbedId: selectedSunbed._id,
          sunbedPrice: selectedSunbed.price,
          randomId: randomId,
          createdBy: "worker"
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Booking created successfully!");
        setIsBookingModalOpen(false);
        // Reset form
        setBookingForm({
          name: "",
          email: "",
          phone: "",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: "",
          payment: "false"
        });
      } else {
        toast.error(data.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("An error occurred while creating the booking");
    }
  };

  return (
    <div className="worker-dashboard-container">
      <div className="worker-dashboard-header">
        <h1>Worker Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {worker?.username || "Worker"}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="map-container">
        {loading ? (
          <div className="loading">Loading your assigned sunbeds...</div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {sunbeds.map((sunbed) => (
              <Marker
                key={sunbed._id}
                position={[sunbed.latitude || 0, sunbed.longitude || 0]}
                icon={createSunbedIcon(sunbed.type)}
              >
                <Popup>
                  <div>
                    <h3>Sunbed #{sunbed.number}</h3>
                    <p>Type: {sunbed.type}</p>
                    <p>Price: {sunbed.price}</p>
                    <p>Status: {sunbed.disabled === "true" ? "Disabled" : "Active"}</p>
                    <button 
                      onClick={() => handleOpenBookingModal(sunbed)}
                      className="bg-[#73D0D7] text-white rounded-md px-2 py-1 mt-2 w-full"
                    >
                      Create Booking
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && selectedSunbed && (
        <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Create Booking for Sunbed #{selectedSunbed.number}</h2>
            <form onSubmit={handleSubmitBooking} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium">Customer Name*</label>
                <input
                  type="text"
                  name="name"
                  value={bookingForm.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={bookingForm.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium">Phone*</label>
                <input
                  type="tel"
                  name="phone"
                  value={bookingForm.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={bookingForm.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium">Time</label>
                <input
                  type="time"
                  name="time"
                  value={bookingForm.time}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={bookingForm.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Payment Status</label>
                <select
                  name="payment"
                  value={bookingForm.payment}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="false">Unpaid</option>
                  <option value="true">Paid</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium">Booking ID</label>
                <input
                  type="text"
                  value={randomId}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium">Price</label>
                <input
                  type="text"
                  value={`${selectedSunbed.price} ALL`}
                  className="w-full p-2 border rounded bg-gray-100"
                  readOnly
                />
              </div>
              
              <button
                type="submit"
                className="bg-[#73D0D7] text-white py-2 px-4 rounded hover:bg-[#5bb8bf] mt-2"
              >
                Create Booking
              </button>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default WorkerDashboard;