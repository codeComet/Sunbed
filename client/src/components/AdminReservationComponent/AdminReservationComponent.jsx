import React, { useContext, useEffect, useState, useRef } from "react";
import Modal from "../../components/BookingModal/Modal";
import { MdDelete } from "react-icons/md";
import cir from "../../assets/circle.png";
import cir1 from "../../assets/circle1.png";
import vip from "../../assets/umbrella8.jpg";
import sqr from "../../assets/quareum.jpg";
import sqr1 from "../../assets/quareum1.jpg";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const AdminReservationComponent = ({ restaurantdata, ownerrestaurants }) => {
  const {
    getBookings,
    deleteBooking,
    getAllSunbedsByDate,
    handlePayment,
    user,
    closeSunbed,
    handleBooking,
  } = useContext(SuneasyContext);
  const [IsSelected, setIsSelected] = useState();
  const [sunbedbookings, setsunbedbookings] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedSunbed, setSelectedSunbed] = useState(null);
  const [restaurant, setRestaurant] = useState({});
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const [selectedTime, setSelectedTime] = useState(formattedTime);
  const [selectedDate, setSelectedDate] = useState(formattedDate);
  const [restaurantid, setrestaurantid] = useState("");
  const [sunbeds, setsunbeds] = useState([]);
  const [activeFloorplan, setactiveFloorplan] = useState();
  const [Floorplan, setFloorplan] = useState(sunbeds);
  const [filteredSunbeds, setfilteredSunbeds] = useState();

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sunbedPrice, setSunbedPrice] = useState("");
  const [sunbedId, setSunbedID] = useState("");
  const [randomId, setRandomId] = useState("");

  useEffect(() => {
    setRestaurant(restaurantdata);
    setFloorplan(restaurantdata?.floorplans);

    // Set the active floorplan to the first floorplan when component loads
    if (restaurantdata?.floorplans && restaurantdata.floorplans.length > 0) {
      setactiveFloorplan(restaurantdata.floorplans[0]._id);
      setfilteredSunbeds(restaurantdata.floorplans[0].sunbeds);
    }
  }, [restaurantdata]);

  // Add this near the top of your component, after the imports
  useEffect(() => {
    // Add CSS for reserved and available sunbeds
    const style = document.createElement("style");
    style.textContent = `
      .reserved-sunbed {
        filter: hue-rotate(320deg) saturate(1.5) brightness(0.8);
        opacity: 0.9;
        transform: scale(1.1);
        z-index: 1000 !important;
      }
      .available-sunbed {
        filter: hue-rotate(120deg) saturate(1.2) brightness(1.1); /* Greenish tint */
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);


  // Create custom icons for different sunbed types and reservation status
  const createSunbedIcon = (type, isReserved) => {
    let iconUrl;

    if (type === "Circle") {
      iconUrl = isReserved ? cir : cir1;
    } else if (type === "Square") {
      iconUrl = isReserved ? sqr : sqr1;
    } else if (type === "SquareV") {
      iconUrl = vip;
    } else {
      iconUrl = cir; // Default
    }

    return L.icon({
      iconUrl,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
      className: isReserved ? "reserved-sunbed" : "available-sunbed",
    });
  };

  const updatedetails = async (updatedrestaurant) => {
    setRestaurant(updatedrestaurant);
    let floorplan = updatedrestaurant?.floorplans?.find(
      (f) => f._id === activeFloorplan
    );
    if (floorplan) {
      setfilteredSunbeds(floorplan?.sunbeds);
    }
  };

  const getallsunbedsbookingsbydate = async (restaurantId, date) => {
    try {
      const allSunbedsDetails = await getAllSunbedsByDate(restaurantId, date);
      if (allSunbedsDetails) {
        let floorplan = allSunbedsDetails?.find(
          (f) => f._id === activeFloorplan
        );
        if (floorplan) {
          setfilteredSunbeds(floorplan?.sunbeds);
        }
        return allSunbedsDetails;
      } else {
        setsunbeds([]);
        return [];
      }
    } catch (error) {
      return null; // Return null if an error occurs
    }
  };

  const fetchData = async () => {
    if (restaurant._id) {
      await getallsunbedsbookingsbydate(restaurant._id, selectedDate);
    }
  };

  useEffect(() => {
    if (restaurant._id) {
      fetchData();
    }
  }, [restaurant._id, selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (restaurant._id) {
        fetchData();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [restaurant._id, selectedDate]);

  const handleclick = async (restaurandId, sunbedId) => {
    try {
      let data = await getBookings(restaurandId, sunbedId);
      const bookingsForSelectedDate = data.filter(
        (booking) => booking.date === selectedDate
      );
      const isclosed = bookingsForSelectedDate.some(
        (booking) =>
          !booking.isClosed &&
          (booking.payment === "true" || booking.payment === "Cash")
      );
      if (bookingsForSelectedDate.length > 0 && isclosed) {
        setsunbedbookings(bookingsForSelectedDate);
        setSelectedRestaurant(restaurandId);
        setSelectedSunbed(sunbedId);
        setIsSelected(true);
      } else {
        const selectedSunbed = filteredSunbeds.find(
          (sunbed) => sunbed._id === sunbedId
        );
        const sunbedPrice = selectedSunbed ? selectedSunbed.price : null;
        setsunbedbookings([]);
        setSelectedRestaurant(restaurandId);
        setSelectedSunbed(sunbedId);
        setIsSelected(true);
        setSunbedID(sunbedId);
        setSunbedPrice(sunbedPrice);
        const newRandomId = generateRandomId();
        setRandomId(newRandomId);
      }
    } catch (error) {
      toast.error("Something Went Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const handleclicked = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const restaurantId = formData.get("restaurantId");
    if (!restaurantId && !selectedDate) {
      return;
    }
    await getallsunbedsbookingsbydate(restaurantId, selectedDate);
  };

  const closeModal = () => {
    setIsSelected(false);
    setSelectedRestaurant(null);
    setSelectedSunbed(null);
  };

  const handledelete = async (bookingid, restaurantId) => {
    let success = await deleteBooking(bookingid);
    if (success) {
      toast.success("Booking Deleted Successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      getallsunbedsbookingsbydate(restaurantId, selectedDate);

      closeModal();
    } else {
      toast.error("Something Went Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const handlePaidPayment = async (
    bookingId,
    restaurantId,
    payment,
    sunbedRandomId
  ) => {
    const newPaymentStatus = payment === "true" ? "false" : "true";
    let success = await handlePayment(
      bookingId,
      newPaymentStatus,
      sunbedRandomId,
      restaurantdata?._id
    );
    if (success) {
      updatedetails(success);
      getallsunbedsbookingsbydate(restaurantId, selectedDate);
      toast.success("Payment Successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      closeModal();
    } else {
      toast.error("Something Went Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const closebooking = async (bookingId, restaurantId) => {
    let success = await closeSunbed(bookingId);
    if (success) {
      getallsunbedsbookingsbydate(restaurantId, selectedDate);
      toast.success("Closed Successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      closeModal();
    } else {
      toast.error("Something Went Wrong", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  const generateRandomId = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomId = "";
    for (let i = 0; i < 10; i++) {
      randomId += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return randomId;
  };

  const bookingForm = async (e) => {
    e.preventDefault();

    try {
      const form = {
        name:
          !name && user && user?.restaurantId.includes(restaurant?._id)
            ? user?.role == "admin"
              ? "admin"
              : "manager"
            : name,
        email:
          !user && !user?.restaurantId.includes(restaurant?._id)
            ? email
            : user?.email,
        phone,
        payment: "Cash",
        randomId: randomId,
        time: selectedTime,
        price: sunbedPrice,
        date: selectedDate,
        sunbedId: sunbedId,
        restaurantId: restaurant?._id,
        description: !description.length > 0 ? "no description" : description,
        isAdmin:
          user &&
          user?.restaurantId?.includes(restaurant?._id) &&
          user?.role == "admin"
            ? true
            : false,
        isManager:
          user &&
          user?.restaurantId?.includes(restaurant?._id) &&
          user?.role == "manager"
            ? true
            : false,
      };

      const isBooked = await handleBooking(form);
      if (isBooked) {
        toast.success("Form Submitted Successfully", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        getallsunbedsbookingsbydate(restaurant._id, selectedDate);
        setRestaurant(isBooked);
        setName("");
        setEmail("");
        setPhone("");
        setIsSelected(null);
      } else if (isBooked == null) {
        throw new Error("Sunbed Already Reserved At This Date");
      } else {
        throw new Error("Booking Unsuccessful");
      }
    } catch (error) {
      toast.error(error.message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  // Check if a sunbed has a reservation for the selected date
  const isSunbedReserved = (sunbed) => {
    return (
      sunbed.dates &&
      sunbed.dates.some(
        (date) =>
          date.date === selectedDate && date.payment === true && !date.isClosed
      )
    );
  };

  return (
    <>
      <div className="content py-10 px-4">
        <section>
          <div className="bg-[#fffc6ea8] overflow-hidden border rounded-3xl shadow-lg">
            <div className="grid py-2 grid-cols-2 px-2 bg-[#73D0D7]">
              <label className="py-2 text-lg font-semibold text-white">
                Date:
              </label>
              <input
                className="cursor-pointer rounded-md text-sm md:text-md py-2 outline-none px-4 bg-[#046E72] text-white"
                type="date"
                required
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (restaurant._id) {
                    getallsunbedsbookingsbydate(restaurant._id, e.target.value);
                  }
                }}
              />
            </div>

            {/* Map view for sunbeds */}
            <div className="w-full my-8" style={{ height: "400px" }}>
              <MapContainer
                center={[
                  restaurantdata.location.lat,
                  restaurantdata.location.lng,
                ]}
                zoom={17}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Render sunbeds as markers on the map */}
                {filteredSunbeds?.map((sunbed, idx) =>
                  sunbed.latitude && sunbed.longitude ? (
                    <Marker
                      key={idx}
                      position={[sunbed.latitude, sunbed.longitude]}
                      icon={createSunbedIcon(
                        sunbed.type,
                        isSunbedReserved(sunbed)
                      )}
                      eventHandlers={{
                        click: () => {
                          handleclick(restaurant._id, sunbed._id);
                        },
                      }}
                    >
                      <Popup>
                        <div>
                          <div className="mb-2">
                            <strong>Nr:</strong> {sunbed.number}
                            <br />
                            <strong>Type:</strong> {sunbed.type}
                            <br />
                            <strong>Price:</strong> {sunbed.price} ALL
                            <br />
                            <strong>Status:</strong>{" "}
                            <span 
                              style={{ 
                                color: isSunbedReserved(sunbed) ? '#d32f2f' : '#2e7d32',
                                fontWeight: 'bold'
                              }}
                            >
                              {isSunbedReserved(sunbed) ? "Reserved" : "Available"}
                            </span>
                          </div>
                          <button
                            className={`p-1 ${isSunbedReserved(sunbed) ? 'bg-blue-500' : 'bg-green-500'} text-white rounded flex items-center gap-1 w-full justify-center`}
                            onClick={() => handleclick(restaurant._id, sunbed._id)}
                          >
                            {isSunbedReserved(sunbed) ? "View Booking" : "Book Now"}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ) : null
                )}
              </MapContainer>
            </div>

            {/* Booking Modal */}
            <Modal isOpen={IsSelected} onClose={closeModal}>
              {sunbedbookings.length > 0 ? (
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Booking Details</h2>
                  {sunbedbookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="border p-4 rounded-lg mb-4 bg-gray-50"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          <strong>Name:</strong> {booking.name}
                        </p>
                        <p>
                          <strong>Email:</strong> {booking.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {booking.phone}
                        </p>
                        <p>
                          <strong>Date:</strong> {booking.date}
                        </p>
                        <p>
                          <strong>Time:</strong> {booking.time}
                        </p>
                        <p>
                          <strong>Price:</strong> {booking.price} ALL
                        </p>
                        <p>
                          <strong>Payment:</strong>{" "}
                          {booking.payment === "true" ? "Paid" : "Not Paid"}
                        </p>
                        <p>
                          <strong>Description:</strong> {booking.description}
                        </p>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() =>
                            handlePaidPayment(
                              booking._id,
                              booking.restaurantId,
                              booking.payment,
                              booking.sunbedRandomId
                            )
                          }
                          className={`px-4 py-2 rounded ${
                            booking.payment === "true"
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white"
                          }`}
                        >
                          {booking.payment === "true"
                            ? "Mark as Unpaid"
                            : "Mark as Paid"}
                        </button>
                        <button
                          onClick={() =>
                            closebooking(booking._id, booking.restaurantId)
                          }
                          className="px-4 py-2 bg-yellow-500 text-white rounded"
                        >
                          Close Booking
                        </button>
                        <button
                          onClick={() =>
                            handledelete(booking._id, booking.restaurantId)
                          }
                          className="px-4 py-2 bg-red-500 text-white rounded flex items-center gap-1"
                        >
                          <MdDelete /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-4">Create New Booking</h2>
                  <form onSubmit={bookingForm} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter phone"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Time
                        </label>
                        <input
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          placeholder="Enter description"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-500 text-white rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                      >
                        Book Now
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </Modal>
          </div>
        </section>
      </div>
    </>
  );
};

export default AdminReservationComponent;
