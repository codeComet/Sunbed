import React, { useContext, useEffect, useRef, useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import Footer from "../../components/Footer/Footer";
import Restrauntcard from "../../components/RestrauntCard/Restrauntcard";
import Hero from "../../components/Hero/Hero";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../../components/Header/Header";
import L from "leaflet";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import sunbedicon from "./sunbedicon.png";
import { Link } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import Umbrella from "../src/umbrella.png";
const Home = () => {
  const { restaurants, setSingleRestaurant, getRestaurants } =
    useContext(SuneasyContext);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [totalSunbedsWithCurrentDate, setTotalSunbedsWithCurrentDate] = useState(0);
  const currentDate = new Date(); // Get the current date
  
  useEffect(() => {
    let totalSunbeds = 0;
    filteredRestaurants.forEach((restaurant) => {
      restaurant.floorplans.map(floorplan => {
        floorplan.sunbeds.forEach((sunbed) => {
        if (sunbed.dates && sunbed.dates.find(d=>d.date==getFormattedDate(currentDate))) {
          totalSunbeds++;
        }
      })});
    });
    setTotalSunbedsWithCurrentDate(totalSunbeds);
  }, [filteredRestaurants, currentDate]);
  
  function getFormattedDate(date) {
    // Format the date as "YYYY-MM-DD"
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
  
    const [isFilters, setIsFilters] = useState(false);
  const [cityFilter, setCityFilter] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [search, setsearch] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 430);

  useEffect(() => {
    if (restaurants) {
      setFilteredRestaurants(restaurants);
      setIsLoading(false);
      setSingleRestaurant({});
    }
  }, [restaurants]);
  useEffect(() => {
    getRestaurants();
  }, []);
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 430);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    const handleScroll = () => {
      const mapTopPosition = mapRef?.current?.getBoundingClientRect()?.top;
      if (mapTopPosition <= 670) {
        setIsHeroVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handlesearch = (e) => {
    setsearch(e.target.value);
  };
  useEffect(() => {
    if (search !== "") {
      const searchRestaurant = filteredRestaurants.filter((rest) =>
        rest.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredRestaurants(searchRestaurant);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [search, restaurants]);
  useEffect(() => {
    const handleScroll = () => {
      const mapTopPosition = mapRef?.current?.getBoundingClientRect()?.top;
      if (mapTopPosition <= 670) {
        setIsHeroVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handlechange = (e) => {
    e.preventDefault();
    if (e.target.value === "all") {
      setFilteredRestaurants(restaurants);
    } else {
      let filtered = restaurants.filter((restaurant) => {
        return restaurant.city.toLowerCase() === e.target.value.toLowerCase();
      });
      setFilteredRestaurants(filtered);
    }
    setIsFilters(false);
    setCityFilter(e.target.value);
  };

  const customIcon = L.icon({
    iconUrl: sunbedicon,
    iconSize: [30, 30],
  });

  return (
    <>
      {!filteredRestaurants ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <div>
          <Header />
          {<Hero isHeroVisible={isHeroVisible} />}
          {filteredRestaurants && (
            <div
              ref={mapRef}
              className="overflow-hidden md:rounded-bl-[100px] md:rounded-br-[100px] "
            >
              <MapContainer
                center={[40.73187417316789, 19.371607334960366]}
                zoom={8}
                className="h-[500px] -z-0 w-full mx-auto md:rounded-bl-[100px] md:rounded-br-[100px]"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredRestaurants?.length > 0 &&
                  filteredRestaurants?.map((element, index) => (
                    <Marker
                      key={index}
                      position={[
                        element?.location?.lat,
                        element?.location?.lng,
                      ]}
                      icon={customIcon}
                    >
                      <Popup className="popup w-[200px] h-150px py-0 px-0 m-0">
                        <Link to={`restaurants/${element?._id}`}>
                          <div className="bg-white">
                            <div className="h-1/2">
                              <img
                                src={element?.img}
                                alt=""
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="pt-2 text-left text-[#73D0D7] text-sm">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="text-[#FFC300] font-semibold">
                                    {element?.name}
                                  </h3>
                                  <h2 className="text-md font-medium">
                                    {element?.city}
                                  </h2>
                                </div>
                                <div className="flex items-center">
                                <p className="text-sm mr-1" style={{
  backgroundColor: "#f0f0f0",
  boxShadow: "0 5px 4px rgba(0, 0, 0, 0.1)",
  borderRadius: "5px",
  padding: "5px",
  color: "green"
}}>
  <img src={Umbrella} alt="Umbrella" className="inline-block h-5 w-5" />{" "}
  {element?.floorplans?.length>0 && element?.floorplans?.map(floorplan =>
    floorplan?.sunbeds?.filter(sunbed => sunbed.disappear !== "true").length
  ).reduce((acc, curr) => acc + curr, 0)}
</p>

                                  {/* <p
                                    className="text-sm"
                                    style={{
                                      backgroundColor: "#f0f0f0",
                                      boxShadow: "0 5px 4px rgba(0, 0, 0, 0.1)",
                                      borderRadius: "5px",
                                      padding: "5px",
                                    }}
                                  >
                                    $
                                    {Math.min(...element?.floorplans[0]?.sunbeds?.map(umbrella => umbrella.price))} ALL

                                  </p> */}
                                </div>
                              </div>
                              <div className="flex justify-end items-center">
                                <Link to={`restaurants/${element?._id}`}>
                                  <button className="bg-[#73D0D7] text-black px-2 py-1 rounded-md text-xs">
                                    Book +
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          )}
          <section className="mb-6 mx-auto items-center max-w-[1400px] flex flex-col ">
            <div className="border mt-2 rounded-3xl p-2 md:p-6 w-[95%] bg-white shadow-lg">
              <div className="  relative my-2 flex justify-between  items-center md:px-6 ">
                {/* <div className='hidden md:block relative'></div> */}
                <div className="">
                  <input
                    type="search"
                    placeholder="Search..."
                    valur={search}
                    onChange={(e) => {
                      handlesearch(e);
                    }}
                    className="border px-6 py-3 rounded-lg focus:outline-[#73D0D7] w-full"
                  />
                </div>
                <div className="text-right">
                  <div
                    onClick={() => {
                      setIsFilters(!isFilters);
                    }}
                    className={`px-6 py-3 cursor-pointer rounded-lg inline-block space-x-2 ${
                      isFilters ? "border-red-600" : "border-[#73D0D7]"
                    }  border-2`}
                  >
                    {isSmallScreen ? (
                      <IoFilterSharp
                        className={`font-semibold inline-block ${
                          isFilters ? "text-red-600" : "text-[#000000]"
                        }`}
                      />
                    ) : (
                      <span
                        className={`font-semibold ${
                          isFilters ? "text-red-600" : "text-[#73D0D7]"
                        }`}
                      >
                        {isFilters ? "Close" : "Filters"}
                      </span>
                    )}
                    {isFilters && (
                      <IoClose className="inline-block text-red-600 font-semibold" />
                    )}
                  </div>
                  {isFilters && (
                    <div className="absolute w-full md:w-1/2 left-0 md:right-5 md:left-auto">
                      <div className="bg-[#73D0D7] grid gap-4 shadow-2xl border-white border rounded-3xl grid-cols-2 text-left justify-start p-10 text-white rounded-tr-none">
                        <label htmlFor="" className="py-2">
                          City:{" "}
                        </label>
                        <select
                          id="cityFilter"
                          value={cityFilter}
                          onChange={handlechange}
                          className="bg-[#046E72] rounded-full text-lg px-4 py-2 outline-none text-white"
                        >
                          <option value="all">All</option>
                          <option value="vlore">Vlore</option>
                          <option value="sarande">Sarande</option>
                          <option value="durres">Durres</option>
                          <option value="shengjin">Shengjin</option>
                          <option value="velipoje">Velipoje</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="my-4 grid grid-cols-1 md:grid-cols-3 text-center gap-2 md:p-6">
                {filteredRestaurants?.length > 0 &&
                  filteredRestaurants?.map((element) => (
                    <Restrauntcard key={element?._id} sunbed={element} />
                  ))}
              </div>
            </div>
          </section>
          <Footer />
        </div>
      )}
    </>
  );
};

export default React.memo(Home);
// import React, { useContext, useEffect, useRef, useState } from "react";
// import { IoFilterSharp } from "react-icons/io5";
// import { IoClose } from "react-icons/io5";
// import Footer from "../../components/Footer/Footer";
// import Restrauntcard from "../../components/RestrauntCard/Restrauntcard";
// import Hero from "../../components/Hero/Hero";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import Header from "../../components/Header/Header";
// import L from "leaflet";
// import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
// import sunbedicon from "./sunbedicon.png";
// import { Link } from "react-router-dom";
// import { Bounce, ToastContainer, toast } from "react-toastify";

// const Home = () => {
//   const { restaurants, setSingleRestaurant, getRestaurants } =
//     useContext(SuneasyContext);
//   const [filteredRestaurants, setFilteredRestaurants] = useState([]);
//   const [isFilters, setIsFilters] = useState(false);
//   const [cityFilter, setCityFilter] = useState("");

//   const [isLoading, setIsLoading] = useState(true);
//   const mapRef = useRef(null);
//   const [isHeroVisible, setIsHeroVisible] = useState(true);
//   const [search, setsearch] = useState("");

//   useEffect(() => {
//     if (restaurants) {
//       setFilteredRestaurants(restaurants);
//       setIsLoading(false);
//       setSingleRestaurant({});
//     }
//   }, [restaurants]);
//   useEffect(() => {
//     getRestaurants();
//   }, []);

//   const handlesearch = (e) => {
//     setsearch(e.target.value);
//   };
//   useEffect(() => {
//     if (search !== "") {
//       const searchRestaurant = filteredRestaurants.filter((rest) =>
//         rest.name.toLowerCase().includes(search.toLowerCase())
//       );
//       setFilteredRestaurants(searchRestaurant);
//     } else {
//       setFilteredRestaurants(restaurants);
//     }
//   }, [search, restaurants]);
//   useEffect(() => {
//     const handleScroll = () => {
//       const mapTopPosition = mapRef?.current?.getBoundingClientRect()?.top;
//       if (mapTopPosition <= 670) {
//         setIsHeroVisible(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   const handlechange = (e) => {
//     e.preventDefault();
//     if (e.target.value === "all") {
//       setFilteredRestaurants(restaurants);
//     } else {
//       let filtered = restaurants.filter((restaurant) => {
//         return restaurant.city.toLowerCase() === e.target.value.toLowerCase();
//       });
//       setFilteredRestaurants(filtered);
//     }
//     setIsFilters(false);
//     setCityFilter(e.target.value);
//   };

//   const customIcon = L.icon({
//     iconUrl: sunbedicon,
//     iconSize: [80, 80],
//   });

//   return (
//     <>
//       {!filteredRestaurants ? (
//         <div className="flex justify-center items-center h-screen">
//           <div className="loader"></div>
//         </div>
//       ) : (
//         <div>
//           <Header />
//           {<Hero isHeroVisible={isHeroVisible} />}
//           {filteredRestaurants && (
//             <div
//               ref={mapRef}
//               className="overflow-hidden md:rounded-bl-[100px] md:rounded-br-[100px] "
//             >
//               <MapContainer
//                 center={[40.3865853, 19.469678]}
//                 zoom={11}
//                 className="h-[500px] -z-0 w-full mx-auto md:rounded-bl-[100px] md:rounded-br-[100px]"
//               >
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 />
//                 {filteredRestaurants?.length > 0 &&
//                   filteredRestaurants?.map((element, index) => (
//                     <Marker
//                       key={index}
//                       position={[
//                         element?.location?.lat,
//                         element?.location?.lng,
//                       ]}
//                       icon={customIcon}
//                     >
//                       <Popup className="popup w-[200px] h-150px py-0 px-0 m-0">
//                         <Link to={`restaurants/${element?.id}`}>
//                           <div className="bg-white">
//                             <div className="h-1/2">
//                               <img
//                                 src={element?.img}
//                                 alt=""
//                                 className="object-cover w-full h-full "
//                               />
//                             </div>
//                             <div className="pt-2 text-left text-[#73D0D7] text-sm">
//                               <h3 className="text-[#FFC300] font-semibold">
//                                 {element?.name}
//                               </h3>
//                               <h2 className="text-md font-medium">
//                                 {element?.city}
//                               </h2>
//                               <p className="text-md">{element?.desc}</p>
//                             </div>
//                           </div>
//                         </Link>
//                       </Popup>
//                     </Marker>
//                   ))}
//               </MapContainer>
//             </div>
//           )}
//           <section className="mb-6 mx-auto items-center max-w-[1400px] flex flex-col ">
//             <div className="border mt-2 rounded-3xl p-2 md:p-6 w-[95%] bg-white shadow-lg">
//               <div className=" px-4 relative my-2 flex justify-between  items-center md:px-6 ">
//                 {/* <div className='hidden md:block relative'></div> */}
//                 <div className="">
//                   <input
//                     type="search"
//                     placeholder="Search..."
//                     valur={search}
//                     onChange={(e) => {
//                       handlesearch(e);
//                     }}
//                     className="border px-6 py-3 rounded-lg focus:outline-[#73D0D7]"
//                   />
//                 </div>
//                 <div className=" text-right">
//                   <div
//                     onClick={() => {
//                       setIsFilters(!isFilters);
//                     }}
//                     className={`px-6 py-3 cursor-pointer rounded-lg inline-block space-x-2 ${
//                       isFilters ? "border-red-600" : "border-[#73D0D7]"
//                     }  border-2`}
//                   >
//                     <span
//                       className={`font-semibold ${
//                         isFilters ? "text-red-600" : "text-[#73D0D7]"
//                       }`}
//                     >
//                       {isFilters ? "Close" : "Filters"}
//                     </span>
//                     {isFilters ? (
//                       <IoClose className="inline-block text-red-600 font-semibold" />
//                     ) : (
//                       <IoFilterSharp
//                         className={`font-semibold inline-block ${
//                           isFilters ? "text-red-600" : "text-[#000000]"
//                         }`}
//                       />
//                     )}
//                   </div>
//                   {isFilters && (
//                     <>
//                       <div className="absolute w-full md:w-1/2 left-0 md:right-5  md:left-auto">
//                         <div className="bg-[#73D0D7] grid gap-4 shadow-2xl border-white border rounded-3xl grid-cols-2 text-left justify-start p-10 text-white rounded-tr-none">
//                           <label htmlFor="" className="py-2 ">
//                             City:{" "}
//                           </label>
//                           <select
//                             id="cityFilter"
//                             value={cityFilter}
//                             onChange={(e) => {
//                               handlechange(e);
//                             }}
//                             className="bg-[#046E72] rounded-full text-lg px-4 py-2 outline-none text-white"
//                           >
//                             <option value="all">All</option>
//                             <option value="volere">Volere</option>
//                             <option value="sarande">Sarande</option>
//                             <option value="durres">Durres</option>
//                             <option value="shengjin">Shengjin</option>
//                             <option value="velupoje">Velupoje</option>
//                           </select>
//                         </div>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="my-4 grid grid-cols-1 md:grid-cols-3 text-center gap-2 md:p-6">
//                 {filteredRestaurants?.length > 0 &&
//                   filteredRestaurants?.map((element) => (
//                     <Restrauntcard key={element?.id} sunbed={element} />
//                   ))}
//               </div>
//             </div>
//           </section>
//           <Footer />
//         </div>
//       )}
//     </>
//   );
// };

// export default React.memo(Home);
