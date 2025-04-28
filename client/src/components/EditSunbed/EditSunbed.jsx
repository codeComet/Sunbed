import React, { useContext, useEffect, useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";
import EditUmbrella from "../../components/EditUmbrella/EditUmbrella";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { useNavigate, useParams } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";

import Modal from "../BookingModal/Modal";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // <-- Add this import
import blueCircle from "../../pages/src/circle1.png";
import blueSquare from "../../pages/src/quareum1.jpg";
import blueVip from "../../pages/src/umbrella8.jpg";


const AddSunbedMarker = ({ onAdd }) => {
  useMapEvents({
    click(e) {
      onAdd(e.latlng);
    },
  });
  return null;
};

const EditSunbed = ({ sunbeds }) => {
  const {
    getRestaurantDetails,
    updateRestaurantDetails,
    updatesunbedprice,
    deletesunbed,
    addSunbed,
    deleteFloorplan,
    addFloorplan,
    singleRestaurant
  } = useContext(SuneasyContext);
  const [editrestaurant, seteditrestaurant] = useState({});
  const [isedit, setisedit] = useState(false);
  const [isadd, setisadd] = useState(false);
  const [addprice, setaddprice] = useState("");
  const [nrBed, setnrBed] = useState("");
  const [addtype, setaddtype] = useState("");
  const [adddisabled, setadddisabled] = useState("");
  const [adddisappear, setadddisappear] = useState("false");
  const [editprice, seteditprice] = useState("");
  const [edittype, setedittype] = useState("");
  const [editnrbed, seteditnrbed] = useState("");
  const [editdisabled, seteditdisabled] = useState("");
  const [editdisappear, seteditdisappear] = useState("false");
  const [editindex, seteditindex] = useState(null);
  const [editsunbedid, seteditsunbedid] = useState("");
  const [columns, setcolumns] = useState("");
  const [rows, setrows] = useState("");
  const [activeFloorplan, setactiveFloorplan] = useState();
  const [Floorplan, setFloorplan] = useState(sunbeds);
  const [filteredSunbeds, setfilteredSunbeds] = useState();
  const [floorplanindex, setfloorplanindex] = useState(0);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [newMarker, setNewMarker] = useState(null);
  const [newSunbedDetails, setNewSunbedDetails] = useState({
    price: "",
    type: "",
    number: "",
    disabled: "",
    disappear: "false",
    workerId: "", // Add workerId field for new sunbeds
  });
  const [editworkerId, seteditworkerId] = useState(""); // Add state for worker assignment in edit mode
  const [workers, setWorkers] = useState([]); // Add state to store workers list
  const navigate = useNavigate();
  const params = useParams();

  const closeModal = () => {
    setConfirmOpen(false)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getRestaurantDetails(params.id);
        if (data) {
          seteditrestaurant(data);
          setFloorplan(data?.floorplans)
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
        navigate("/");
      }
    };

    fetchData();
  }, [params.id, getRestaurantDetails, navigate]);

  // Add useEffect to fetch workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await fetch("http://localhost:5001/auth/get-workers", {
          method: "POST",
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
      }
    };

    fetchWorkers();
  }, []);

  useEffect(() => {
    if (Floorplan) {
      setactiveFloorplan(Floorplan[0]?._id)
      setfilteredSunbeds(Floorplan[0]?.sunbeds)
      setcolumns(Floorplan[0]?.floorplancolumns)
      setrows(Floorplan[0]?.floorplanrows)
    }
  }, [Floorplan])


  const toastMessage = (success, message) => {
    const toastType = success ? toast.success : toast.error;
    toastType(message, {
      position: "bottom-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editsunbedid || !editprice || !edittype || !editnrbed || !editdisabled || !editdisappear) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const data = {
        price: editprice,
        type: edittype,
        number: editnrbed,
        disabled: editdisabled,
        disappear: editdisappear.toString(),
        workerId: editworkerId || null, // Include worker assignment
      };
      const restaurantdetails = await updatesunbedprice(
        editrestaurant?._id,
        editsunbedid, data
      );

      const message = restaurantdetails ? "Updated Successfully" : "Some Error Occurred";
      toastMessage(restaurantdetails, message);

      if (restaurantdetails) {
        updatedetails(restaurantdetails);
        seteditprice("");
        seteditworkerId(""); // Reset worker selection
        setisedit(false);
      }
    } catch (error) {
      toast.error("Some Error Occurred");
      console.error("Error updating sunbed price:", error);
    }
  };

  const deleteSunbed = async (sunbedid) => {
    try {
      const updatedRestaurant = await deletesunbed(editrestaurant?._id, sunbedid, activeFloorplan);
      const message = updatedRestaurant ? "Sunbed Deleted Successfully" : "Some Error Occurred";
      toastMessage(updatedRestaurant, message);
      if (updatedRestaurant) {
        updatedetails(updatedRestaurant)
      }
    } catch (error) {
      toast.error("Some Error Occurred");
      console.error("Error deleting sunbed:", error);
    }
  };

  // New: Add sunbed with coordinates from map marker
  const handleAddSunbedWithCoords = async (e) => {
    e.preventDefault();
    if (!newMarker) return;
    if (!newSunbedDetails.price || !newSunbedDetails.type || !newSunbedDetails.number || !newSunbedDetails.disabled) {
      toast.error("Please provide all required information for adding a sunbed");
      return;
    }
    try {
      const form = {
        ...newSunbedDetails,
        latitude: newMarker.lat,
        longitude: newMarker.lng,
      };
      const data = await addSunbed(editrestaurant?._id, form, activeFloorplan);
      const message = data ? "Sunbed Added Successfully" : "Some Error Occurred";
      toastMessage(data, message);
      if (data) {
        updatedetails(data, activeFloorplan);
        setNewMarker(null);
        setNewSunbedDetails({ 
          price: "", 
          type: "", 
          number: "", 
          disabled: "", 
          disappear: "false",
          workerId: "" 
        });
      }
    } catch (error) {
      toast.error("Some Error Occurred");
      console.error("Error adding sunbed:", error);
    }
  };


  const updatedetails = async (updatedrestaurant) => {
    seteditrestaurant(updatedrestaurant)
    let floorplan = updatedrestaurant?.floorplans?.find(f => f._id === activeFloorplan)
    if (floorplan) {
      setfilteredSunbeds(floorplan?.sunbeds)
      setcolumns(floorplan?.floorplancolumns)
      setrows(floorplan?.floorplanrows)
    }
  }

  const handleDeleteFloorplan = async () => {
    try {
      const updatedrestaurant = await deleteFloorplan(activeFloorplan, editrestaurant?._id);
      const message = updatedrestaurant ? "Floorplan Deleted Successfully" : "Some Error Occurred";
      toastMessage(updatedrestaurant, message);
      if (updatedrestaurant) {
        seteditrestaurant(updatedrestaurant)
        let floorplan = updatedrestaurant?.floorplans?.find(f => f._id != activeFloorplan)
        if (floorplan) {
          setfilteredSunbeds(floorplan?.sunbeds)
          setcolumns(floorplan?.floorplancolumns)
          setrows(floorplan?.floorplanrows)
        }
      }
    } catch (error) {
      toast.error("Some Error Occurred");
      console.error("Error deleting Floorplan:", error);
    }
    setConfirmOpen(false);
  };

  const addfloorplan = async () => {
    try {
      const updatedRestaurant = await addFloorplan(editrestaurant?._id);
      const message = updatedRestaurant ? "Floorplan Added Successfully" : "Some Error Occurred";
      toastMessage(updatedRestaurant, message);
      if (updatedRestaurant) {
        updatedetails(updatedRestaurant)
      }
    } catch (error) {
      toast.error("Some Error Occurred");
      console.error("Error deleting Floorplan:", error);
    }
  }



  return (
    <>
      {!editrestaurant?.floorplans?.length > 0 ? (
        <>
          <div className="flex justify-center items-center h-screen">
            <div className="loader"></div>
          </div>
          <div className=" flex items-center justify-center space-x-2 bg-[#73D0D7]">
            {!(editrestaurant?.floorplans?.length > 2) && (
              <button
                onClick={() => addfloorplan()}
                className={`py-3 px-3  font-medium rounded-xl bg-white text-[#000000] col-span-3 text-sm md:text-lg my-2`}
              >
                Add FloorPlan
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="content py-10 px-4">
            <section>
              <div className="bg-[#fffc6ea8] overflow-hidden border rounded-3xl shadow-lg ">
                {/* --- MAP-BASED SUNBED ADDITION --- */}
                <div className="w-full my-8" style={{ height: "400px" }}>
                  <MapContainer
                    center={[
                      singleRestaurant?.location?.lat,
                      singleRestaurant?.location?.lng,
                    ]}
                    zoom={17}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {/* Existing sunbeds as markers */}
                    {filteredSunbeds?.map((sunbed, idx) =>
                      sunbed.latitude && sunbed.longitude ? (
                        <Marker
                          key={idx}
                          position={[sunbed.latitude, sunbed.longitude]}
                          icon={createSunbedIcon(sunbed.type)}
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
                                <strong>Disabled:</strong> {sunbed.disabled}
                                <br />
                                <strong>Disappear:</strong> {sunbed.disappear}
                                <br />
                                <strong>Worker:</strong> {sunbed.workerId ? 
                                  workers.find(w => w._id === sunbed.workerId)?.username || "Unknown" 
                                  : "None"}
                              </div>
                              <div className="flex gap-2">
                                <button
                                  className="py-1 px-2 bg-yellow-500 text-[12px] rounded flex items-center gap-1"
                                  onClick={() => {
                                    setisedit(true);
                                    seteditindex(idx);
                                    seteditsunbedid(sunbed._id);
                                    seteditprice(sunbed.price);
                                    setedittype(sunbed.type);
                                    seteditnrbed(sunbed.number);
                                    seteditdisabled(sunbed.disabled);
                                    seteditdisappear(sunbed.disappear);
                                    seteditworkerId(sunbed.workerId || ""); // Set worker ID if exists
                                  }}
                                >
                                  <MdEdit /> Edit
                                </button>
                                <button
                                  className="py-1 px-2 text-[12px] bg-rose-500 rounded flex items-center gap-1"
                                  onClick={() => deleteSunbed(sunbed._id)}
                                >
                                  <MdDelete /> Delete
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ) : null
                    )}

                    {/* Marker for new sunbed being added */}
                    {newMarker && (
                      <Marker
                        position={[newMarker.lat, newMarker.lng]}
                        icon={sunbedIcon}
                      >
                        <Popup>
                          <form
                            onSubmit={handleAddSunbedWithCoords}
                            className="flex flex-col gap-2"
                          >
                            <label>Price:</label>
                            <input
                              type="number"
                              value={newSunbedDetails.price}
                              onChange={(e) =>
                                setNewSunbedDetails({
                                  ...newSunbedDetails,
                                  price: e.target.value,
                                })
                              }
                              required
                            />
                            <label>Type:</label>
                            <select
                              value={newSunbedDetails.type}
                              onChange={(e) =>
                                setNewSunbedDetails({
                                  ...newSunbedDetails,
                                  type: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">Select Type</option>
                              <option value="circle">Circle umbrella</option>
                              <option value="square">Square umbrella</option>
                              <option value="squarev">VIP umbrella</option>
                            </select>
                            <label>Nr:</label>
                            <input
                              type="number"
                              value={newSunbedDetails.number}
                              onChange={(e) =>
                                setNewSunbedDetails({
                                  ...newSunbedDetails,
                                  number: e.target.value,
                                })
                              }
                              required
                            />
                            <label>Disable:</label>
                            <select
                              value={newSunbedDetails.disabled}
                              onChange={(e) =>
                                setNewSunbedDetails({
                                  ...newSunbedDetails,
                                  disabled: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">Select Disable</option>
                              <option value="jo">False</option>
                              <option value="po">True</option>
                            </select>
                            {/* Add worker assignment dropdown */}
                            <label>Assign Worker:</label>
                            <select
                              value={newSunbedDetails.workerId}
                              onChange={(e) =>
                                setNewSunbedDetails({
                                  ...newSunbedDetails,
                                  workerId: e.target.value,
                                })
                              }
                            >
                              <option value="">None</option>
                              {workers.map(worker => (
                                <option key={worker._id} value={worker._id}>
                                  {worker.username}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="bg-[#73D0D7] text-white rounded-md px-2 py-1 mt-2"
                            >
                              Add Sunbed
                            </button>
                          </form>
                        </Popup>
                      </Marker>
                    )}
                    {/* Enable map click for adding new sunbed */}
                    <AddSunbedMarker
                      onAdd={(latlng) => {
                        setNewMarker(latlng);
                        setisadd(false);
                      }}
                    />
                  </MapContainer>
                </div>
                {/* --- END MAP --- */}
                {/* ... existing floorplan grid code ... */}

                {/* Edit Sunbed Modal */}
                {isedit && (
                  <Modal isOpen={isedit} onClose={() => setisedit(false)}>
                    <form
                      onSubmit={handleSubmit}
                      className="flex flex-col gap-2 p-4"
                    >
                      <label>Price:</label>
                      <input
                        type="number"
                        value={editprice}
                        onChange={(e) => seteditprice(e.target.value)}
                        required
                      />
                      <label>Type:</label>
                      <select
                        value={edittype}
                        onChange={(e) => setedittype(e.target.value)}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="circle">Circle umbrella</option>
                        <option value="square">Square umbrella</option>
                        <option value="squarev">VIP umbrella</option>
                      </select>
                      <label>Nr:</label>
                      <input
                        type="number"
                        value={editnrbed}
                        onChange={(e) => seteditnrbed(e.target.value)}
                        required
                      />
                      <label>Disable:</label>
                      <select
                        value={editdisabled}
                        onChange={(e) => seteditdisabled(e.target.value)}
                        required
                      >
                        <option value="">Select Disable</option>
                        <option value="jo">False</option>
                        <option value="po">True</option>
                      </select>
                      <label>Disappear:</label>
                      <select
                        value={editdisappear}
                        onChange={(e) => seteditdisappear(e.target.value)}
                        required
                      >
                        <option value="false">False</option>
                        <option value="true">True</option>
                      </select>
                      {/* Add worker assignment dropdown */}
                      <label>Assign Worker:</label>
                      <select
                        value={editworkerId}
                        onChange={(e) => seteditworkerId(e.target.value)}
                      >
                        <option value="">None</option>
                        {workers.map(worker => (
                          <option key={worker._id} value={worker._id}>
                            {worker.username}
                          </option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          className="bg-gray-300 px-3 py-1 rounded"
                          onClick={() => setisedit(false)}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-[#73D0D7] text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </Modal>
                )}
                {/* Confirm Delete Floorplan Modal */}
                {isConfirmOpen && (
                  <Modal isOpen={isConfirmOpen} onClose={closeModal}>
                    <div className="p-4">
                      <p className="mb-4">
                        Are you sure you want to delete this floorplan?
                      </p>
                      <div className="flex justify-end gap-2">
                        <button
                          className="bg-gray-300 px-3 py-1 rounded"
                          onClick={closeModal}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded"
                          onClick={handleDeleteFloorplan}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
};

export default EditSunbed;

// Custom sunbed icon
// Create icons for different sunbed types
const createSunbedIcon = (type) => {
  const iconUrl = type === "circle" 
    ? blueCircle
    : type === "square" 
    ? blueSquare 
    : type === "squarev"
    ? blueVip
    : blueCircle;

  return new L.Icon({
    iconUrl,
    iconSize: [40, 40], // Adjust size as needed
    iconAnchor: [20, 40], // Adjust anchor as needed
    popupAnchor: [0, -40], // Adjust popup position as needed
  });
};

const sunbedIcon = createSunbedIcon("circle"); // Default icon for new markers
