import React, { useContext, useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import restimg from "../../assets/12.jpg";
import sunbedicon from "../../assets/sunbedicon.png";

import EditSunbed from "../../components/EditSunbed/EditSunbed";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { MdClose } from "react-icons/md";
import QRCode from "react-qr-code";
import BookingForm from "../../components/BookingForm/BookingForm";
import FloorPlan from "../../components/FloorPlan/FloorPlan";
import redCircle from "../src/circle.png";
import blueCircle from "../src/circle1.png";
import redSquare from "../src/quareum.jpg";
import blueSquare from "../src/quareum1.jpg";
import blueVip from "../src/umbrella8.jpg";
import redVip from "../src/vip-umbrella-red.jpg";

const SingleDetails = () => {
  const {
    getRestaurantDetails,
    handleBooking,
    singleRestaurant,
    setSingleRestaurant,
    user,
    getAllSunbedsByDate,
  } = useContext(SuneasyContext);
  const navigate = useNavigate();
  const params = useParams();
  const currentDate = new Date();
  const [selectedPrice, setSelectedPrice] = useState(null);
  const formattedDate = currentDate.toISOString().split("T")[0];
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const [selectedTime, setSelectedTime] = useState(formattedTime);
  const [randomId, setRandomId] = useState("");
  const [sunbeds, setsunbeds] = useState([]);
  const [selectedDate, setSelectedDate] = useState(formattedDate);
  const [isSelected, setIsSelected] = useState(null);
  const [active, setActive] = useState("floorplan");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [qrContent, setQrContent] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("false");
  const [selectedMarkers, setSelectedMarkers] = useState([]);

  const openModal = (index) => {
    if (!isOpen) {
      setSelectedIndex(index);
      setIsOpen(true);
    }
  };
  const openModal2 = (index) => {
    if (!isOpen) {
      setSelectedIndex(index);
      setIsOpen2(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };
  const closeModal2 = () => {
    setIsOpen2(false);
  };
  const handleSlideChange = (index) => {
    setSelectedIndex(index);
  };

  const getCustomIcon = (type, isBooked = false) => {
    let iconUrl;
    switch (type?.toLowerCase()) {
      case "circle":
        iconUrl = isBooked ? redCircle : blueCircle;
        break;
      case "square":
        iconUrl = isBooked ? redSquare : blueSquare;
        break;
      case "squarev":
      case "vip":
        iconUrl = isBooked ? redVip : blueVip;
        break;
      default:
        iconUrl = sunbedicon;
    }
    return L.icon({
      iconUrl,
      iconSize: [40, 40],
    });
  };

  let customIcon = getCustomIcon(singleRestaurant?.type);
  useEffect(() => {
    if (singleRestaurant?.type) {
      customIcon = getCustomIcon(singleRestaurant?.type);
    }
  }, [singleRestaurant?.type]);

  useEffect(() => {
    getallsunbedsbookingsbydate(params?.id, selectedDate);
  }, []);

  const tabhandler = (tab) => {
    setActive(tab);
  };

  const handleGetRestaurantDetails = async () => {
    const restaurantDetails = await getRestaurantDetails(
      params?.id,
      selectedDate
    );
    if (restaurantDetails) {
      setSingleRestaurant(restaurantDetails);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    if (params?.id) {
      handleGetRestaurantDetails(params?.id);
    } else {
      navigate("/");
    }
    // eslint-disable-next-line
  }, []);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const maxDateFormatted = maxDate.toISOString().split("T")[0];

  const getallsunbedsbookingsbydate = async (restaurantId, date) => {
    const allSunbedsDetails = await getAllSunbedsByDate(restaurantId, date);
    if (allSunbedsDetails) {
      setsunbeds(allSunbedsDetails);
    } else {
      setsunbeds([]);
    }
  };

  // Multi-marker selection logic
  const handleMarkerClick = (sunbed) => {
    setSelectedMarkers((prev) => {
      const alreadySelected = prev.find((s) => s._id === sunbed._id);
      if (alreadySelected) {
        return prev.filter((s) => s._id !== sunbed._id);
      } else {
        return [...prev, sunbed];
      }
    });
  };

  const totalSelectedPrice = selectedMarkers.reduce(
    (sum, sunbed) => sum + Number(sunbed.price || 0),
    0
  );

  const handleMultiBooking = () => {
    setIsSelected(selectedMarkers.map((s) => s._id));
    setSelectedPrice(totalSelectedPrice);
    setActive("floorplan");
    document
      .getElementById("booking-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {!singleRestaurant?._id ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <Header />

          {isOpen2 && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex z-40 justify-center items-center">
              <div className="p-4 max-h-[80%] max-w-[80%] rounded-lg shadow-lg">
                <div className="modal-content ">
                  <div className="w-full text-right  ">
                    <button
                      onClick={closeModal2}
                      className="px-2 py-1 text-red-600 bg-white "
                    >
                      <MdClose className="font-bold" />
                    </button>
                  </div>
                  <Carousel
                    showArrows={true}
                    showThumbs={false}
                    selectedItem={selectedIndex}
                    onChange={handleSlideChange}
                  >
                    {singleRestaurant?.images?.map((image, index) => (
                      <div
                        key={index}
                        className="flex justify-center items-center"
                      >
                        <img
                          src={image}
                          className=" object-cover h-full w-full cursor-pointer"
                          alt={`Image ${index + 1}`}
                        />
                      </div>
                    ))}
                  </Carousel>
                </div>
              </div>
            </div>
          )}
          {/* Show map with sunbed markers if location exists */}

          <section className="max-w-[1400px] w-[95%] md:w-[80%] mx-auto my-2">
            <h2 className="capitalize pb-4 border-b text-3xl text-black font-semibold">
              {" "}
              {singleRestaurant?.name}
            </h2>
            <div className="rounded-3xl overflow-hidden mx-auto shadow-md">
              <ul className="md:pt-10 overflow-auto py-4 border-b bg-[#73D0D7] items-center  md:justify-start md:items-start flex  gap-2 text-md font-semibold md:text-2xl">
                <li
                  className={`py-2 px-6 text-center cursor-pointer capitalize ${
                    active === "floorplan" ? "text-black" : " text-white "
                  }`}
                  onClick={() => tabhandler("floorplan")}
                >
                  Sunbeds
                </li>
                <li
                  className={`py-2 px-6 text-center cursor-pointer capitalize ${
                    active === "about" ? "text-black" : " text-white  "
                  }`}
                  onClick={() => tabhandler("about")}
                >
                  About
                </li>
                <li
                  className={`py-2 px-6 text-center cursor-pointer capitalize ${
                    active === "location" ? "text-black" : " text-white   "
                  }`}
                  onClick={() => tabhandler("location")}
                >
                  Location
                </li>
                {user &&
                  user.role == "admin" &&
                  user?.restaurantId?.includes(singleRestaurant?._id) && (
                    <li
                      className={`py-2 px-6 text-center cursor-pointer capitalize ${
                        active === "editfloorplan"
                          ? "text-black"
                          : " text-white "
                      }`}
                      onClick={() => tabhandler("editfloorplan")}
                    >
                      Edit Floor plan
                    </li>
                  )}
              </ul>
              <div className="tab-content">
                {active === "about" && (
                  <>
                    <div className="bg-[#73D0D7] flex wrap py-10 px-4 content">
                      {singleRestaurant?.images?.length > 0 &&
                        singleRestaurant?.images
                          .slice(
                            0,
                            Math.min(singleRestaurant?.images.length, 4)
                          )
                          .map((image, index) => (
                            <div key={index} onClick={() => openModal2(index)}>
                              <img
                                src={image}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ))}
                    </div>
                  </>
                )}
                {active === "floorplan" && (
                  <>
                    {sunbeds.length > 0 ? (
                      <>
                        {singleRestaurant?.location?.lng &&
                          singleRestaurant?.location?.lat && (
                            <div className="overflow-hidden md:rounded-bl-[20px] md:rounded-br-[20px]">
                              <MapContainer
                                center={[
                                  singleRestaurant?.location?.lat,
                                  singleRestaurant?.location?.lng,
                                ]}
                                zoom={19}
                                className="h-[350px] w-full mx-auto md:rounded-bl-[20px] md:rounded-br-[20px]"
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {/* Main restaurant marker */}
                                <Marker
                                  position={[
                                    singleRestaurant?.location?.lat,
                                    singleRestaurant?.location?.lng,
                                  ]}
                                  icon={customIcon}
                                >
                                  <Popup>
                                    <div>
                                      <strong>{singleRestaurant?.name}</strong>
                                      <br />
                                      {singleRestaurant?.city}
                                    </div>
                                  </Popup>
                                </Marker>
                                {/* Sunbed markers with selection */}
                                // In the sunbed marker rendering:
                                {sunbeds?.length > 0 &&
                                  sunbeds.map((floorplan) =>
                                    floorplan.sunbeds
                                      .filter(
                                        (sunbed) =>
                                          sunbed.latitude &&
                                          sunbed.longitude &&
                                          sunbed.disappear !== "true"
                                      )
                                      .map((sunbed, idx) => {
                                        const isSelected = selectedMarkers.some(
                                          (s) => s._id === sunbed._id
                                        );
                                        return (
                                          <Marker
                                            key={sunbed._id || idx}
                                            position={[
                                              sunbed.latitude,
                                              sunbed.longitude,
                                            ]}
                                            icon={getCustomIcon(sunbed.type, sunbed.isBooked)} // Pass booking status
                                            eventHandlers={{
                                              click: () =>
                                                handleMarkerClick(sunbed),
                                            }}
                                          >
                                            <Popup>
                                              <div>
                                                <strong>
                                                  Nr: {sunbed.number}
                                                </strong>
                                                <br />
                                                Price: {sunbed.price} ALL
                                                <br />
                                                Type: {sunbed.type}
                                                <br />
                                                {sunbed.disabled === "po" && (
                                                  <span className="text-red-600">
                                                    Disabled
                                                  </span>
                                                )}
                                                <br />
                                                <span
                                                  style={{
                                                    color: isSelected
                                                      ? "#ffa82d"
                                                      : "#046E72",
                                                    fontWeight: "bold",
                                                  }}
                                                >
                                                  {isSelected
                                                    ? "Selected"
                                                    : "Click to select"}
                                                </span>
                                              </div>
                                            </Popup>
                                          </Marker>
                                        );
                                      })
                                  )}
                              </MapContainer>
                              {/* Show total price and booking button below the map */}
                              {selectedMarkers.length > 0 && (
                                <div className="flex flex-col items-center my-4">
                                  <div className="text-lg font-semibold text-[#046E72] mb-2">
                                    Selected Sunbeds:{" "}
                                    {selectedMarkers
                                      .map((s) => s.number)
                                      .join(", ")}
                                  </div>
                                  <div className="text-xl font-bold text-[#ffa82d] mb-2">
                                    Total Price: {totalSelectedPrice} ALL
                                  </div>
                                  <button
                                    className="bg-[#73D0D7] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#046E72] hover:text-white transition"
                                    onClick={handleMultiBooking}
                                  >
                                    Book Selected Sunbeds
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                      </>
                    ) : (
                      <div className="flex justify-center items-center h-screen">
                        <div className="loader"></div>
                      </div>
                    )}
                  </>
                )}
                {active === "location" && (
                  <div className="bg-[#73D0D7] py-10 px-4 content">
                    {singleRestaurant?.location && (
                      <div>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${singleRestaurant?.location?.lat},${singleRestaurant?.location?.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black underline cursor-pointer text-lg hover:text-[#F2BD25] transition duration-500"
                        >
                          Restaurant Location Google Map
                        </a>
                      </div>
                    )}
                    <div style={{ marginTop: "10px" }}>
                      <MapContainer
                        center={[
                          singleRestaurant?.location?.lat,
                          singleRestaurant?.location?.lng,
                        ]}
                        zoom={20}
                        className="h-[300px] -z-0 w-full mx-auto md:rounded-bl-[100px] md:rounded-br-[100px]  "
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={[
                            singleRestaurant?.location?.lat,
                            singleRestaurant?.location?.lng,
                          ]}
                          icon={customIcon}
                        >
                          <Popup className="popup w-[200px] h-150px py-0 px-0 m-0">
                            <div className=" bg-white  ">
                              <div className="h-1/2">
                                <img
                                  src={
                                    singleRestaurant?.img
                                      ? singleRestaurant?.img
                                      : restimg
                                  }
                                  alt=""
                                  className="object-cover w-full h-full rounded-3xl "
                                />
                              </div>
                              <div
                                className={`px-4 pt-2 text-left text-[#73D0D7] text-sm `}
                              >
                                <h3 className="text-[#FFC300] font-semibold uppercase">
                                  ALBANIA
                                </h3>
                                <h2 className="text-md font-medium uppercase">
                                  {singleRestaurant?.city}
                                </h2>
                                <p className="text-md capitalize">
                                  {singleRestaurant?.desc}
                                </p>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}
                {user &&
                  user.role == "admin" &&
                  user?.restaurantId?.includes(singleRestaurant?._id) &&
                  active === "editfloorplan" && (
                    <>
                      <EditSunbed sunbeds={sunbeds} />
                    </>
                  )}
              </div>
            </div>
          </section>
          {active === "floorplan" && (
            <div id="booking-form">
              <BookingForm
                paypal={singleRestaurant.paypal}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                getallsunbedsbookingsbydate={getallsunbedsbookingsbydate}
                sunbeds={sunbeds}
                selectedPrice={selectedPrice}
                isSelected={isSelected}
                setIsSelected={setIsSelected}
                setQrContent={setQrContent}
                openModal={openModal}
                setRandomId={setRandomId}
                selectedMarkers={selectedMarkers}
              />
            </div>
          )}
          {isOpen && !user && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex z-40 justify-center items-center">
              <div className="p-4 max-h-[80%] max-w-[80%] rounded-lg shadow-lg">
                <div className="modal-content ">
                  <div className="w-full text-right  ">
                    <button
                      onClick={closeModal}
                      className="px-2 py-1 text-red-600 bg-white "
                    >
                      <MdClose className="font-bold" />
                    </button>
                  </div>
                  <div className="flex justify-center items-center h-full">
                    {/* Render QR code */}
                    <QRCode value={qrContent} />
                  </div>
                  <div className="text-white text-center text-lg mt-5">
                    {randomId}
                  </div>
                  <div className="text-white text-center text-lg mt-5">
                    Screenshot{" "}
                  </div>
                </div>
              </div>
            </div>
          )}
          <Footer />
        </>
      )}
    </>
  );
};

export default SingleDetails;
