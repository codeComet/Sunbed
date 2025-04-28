import React, { useContext, useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FaMinus, FaPlus, FaCalendarDay } from "react-icons/fa";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { Bounce, ToastContainer, toast } from "react-toastify";
import cir from "../../assets/circleum.png";
import cir1 from "../../assets/circleum2.png";
import sqr from "../../assets/squareum.jpg";
import sqr1 from "../../assets/squareum3.jpg";
import sqrv from "../../assets/squareum2.jpg";
import { Link } from "react-router-dom";


const FloorPlan = ({getallsunbedsbookingsbydate,sunbeds,setSelectedDate,setSelectedPrice,isSelected,setIsSelected,selectedDate}) => {
   const {
    singleRestaurant,
    user,
  } = useContext(SuneasyContext);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const maxDateFormatted = maxDate.toISOString().split("T")[0];
const [activeFloorplan, setActiveFloorplan] = useState(null);

  useEffect(() => {
    if (!user || user.role === "admin") {

      setActiveFloorplan(sunbeds.length > 0 ? sunbeds[0]._id : null);
    } else if (user.role === "manager" && user.floorplanId.length > 0) {

      const matchingFloorplan = sunbeds.find(e => user.floorplanId.includes(e._id));
      setActiveFloorplan(matchingFloorplan ? matchingFloorplan._id : null);
    } else {
      setActiveFloorplan(null); 
    }
  }, [user, sunbeds]);  const [filteredSunbeds,setfilteredSunbeds]=useState(activeFloorplan && (!user || user?.role=="admin")?sunbeds[0]?.sunbeds :(sunbeds.find(e => e._id === activeFloorplan)?.sunbeds));
  const [floorPlanColumns,setfloorPlanColumns]=useState(activeFloorplan && (!user || user?.role=="admin")?sunbeds[0]?.floorplancolumns :(sunbeds.find(e => e._id === activeFloorplan)?.floorplancolumns))
  const [floorPlanRows,setfloorPlanRows]=useState(activeFloorplan && (!user || user?.role=="admin")?sunbeds[0]?.floorplanrows :(sunbeds.find(e => e._id === activeFloorplan)?.floorplanrows))

  useEffect(()=>{
    if(activeFloorplan){
      let floorplan= sunbeds.find(f=>f._id===activeFloorplan)
      if(floorplan){
        setfilteredSunbeds(floorplan?.sunbeds)
        setfloorPlanColumns(floorplan?.floorplancolumns)
        setfloorPlanRows(floorplan?.floorplanrows)
      } 
    }
  },[sunbeds,activeFloorplan])
  // useEffect(()=>{
  //   useEffect(() => {
  //     if (sunbeds) {
  //       const matchingFloorplanId = (!user ||user?.role === "admin") ? sunbeds[0]?._id : sunbeds.find(e => e._id === user?.sunbeds[0])?._id;
  //         setactiveFloorplan(matchingFloorplanId);
  //         setfilteredSunbeds(matchingFloorplanId && (sunbeds.find(e => e._id === matchingFloorplanId)?.sunbeds));
  //         setcolumns(matchingFloorplanId && (sunbeds.find(e => e._id === matchingFloorplanId)?.floorplancolumns));
  //         setrows(matchingFloorplanId && (sunbeds.find(e => e._id === matchingFloorplanId)?.floorplanrows));
  //     }
  // }, [sunbeds, user]);
  // },[])

  const handlechange = (e) => {
    if (!e.target.value) {
      const today = new Date();
      const year = today.getFullYear();
      let month = today.getMonth() + 1;
      let day = today.getDate();
        if (month < 10) {
        month = `0${month}`;
      }
      if (day < 10) {
        day = `0${day}`;
      }
  
      const currentDate = `${year}-${month}-${day}`;
      setIsSelected(null);
      setSelectedDate(currentDate);
      getallsunbedsbookingsbydate(singleRestaurant._id, currentDate);
    } else {
      setIsSelected(null);
      setSelectedDate(e.target.value);
      getallsunbedsbookingsbydate(singleRestaurant._id, e.target.value);
    }
  };
  const floorplanClicked = async(id)=>{
    setActiveFloorplan(id)
    let floorplan= sunbeds.find(f=>f._id===id)
    if(floorplan){
      setfilteredSunbeds(floorplan?.sunbeds)
      setfloorPlanColumns(floorplan?.floorplancolumns)
      setfloorPlanRows(floorplan?.floorplanrows)
    }
  }
  return (<>
    {filteredSunbeds &&
    <div className="content">
    <div className="grid py-2 grid-cols-2 px-2 bg-[#73D0D7]">
      <label className=" py-2 text-lg font-semibold text-black ">
        Select Date :{" "}
      </label>
      <input
        className="cursor-pointer rounded-md text-sm md:text-md  py-2 outline-none px-4 bg-[#046E72] text-white"
        type="date"
        required
        min={new Date().toISOString().split("T")[0]}
        max={maxDateFormatted}
        value={selectedDate}
        onChange={(e) => {
          handlechange(e);
        }}
      />
    </div>
       {sunbeds?.length > 1 && (
    <div className=" flex items-center justify-center space-x-2 bg-[#73D0D7]">
    {sunbeds?.map((element, index) => 
    {if ((!user || user?.role=="admin") || user?.floorplanId?.includes(element?._id)) {
      return (
          <button
              key={element._id}
              onClick={() => floorplanClicked(element._id, index)}
              className={`py-3 px-6 font-medium rounded-xl ${activeFloorplan === element._id ? "bg-[#ffa82d]" : "bg-white"} text-[#000000] col-span-3 text-sm md:text-lg my-2`}
          >
              {String.fromCharCode(65 + index)} {/* Convert index to ASCII character */}
          </button>
      );
  } else {
      return null;
  }})}
    </div>
        )}
    <div className="flex  floorplan ">
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={100}
        disabled={true}
      >
        {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
          <div className="relative boxx">
            <div className="tools absolute top-2 left-6 space-x-2 z-20">
              <button
                onClick={() => resetTransform()}
                className="z-20 p-2 bg-white rounded-md"
              >
                <ImCross />
              </button>
              <button
                onClick={() => zoomIn()}
                className="z-20 p-2 bg-white rounded-md"
              >
                <FaPlus />
              </button>
              <button
                onClick={() => zoomOut()}
                className="z-20 p-2 bg-white rounded-md"
              >
                <FaMinus />
              </button>

              {user && (
                <Link to={`/admindashboard/`}>
                  <button className="bg-white text-black p-2 rounded-md text">
                    <FaCalendarDay />
                  </button>
                </Link>
              )}
            </div>
            <TransformComponent className="flex justify-center">
              {filteredSunbeds?.length > 0 &&
                filteredSunbeds?.map((element, index) => {
                  return (
                    <div
                      onClick={
                        element.disappear === "true"
                          ? null
                          : () => {
                              if (!element?.reserved) {
                                if (
                                  element?.disabled !== "po"
                                ) {
                                  setIsSelected(element?._id);
                                  setSelectedPrice(
                                    element?.price
                                  );
                                } else if (
                                  element?.disabled === "po" &&
                                  user
                                ) {
                                  setIsSelected(element?._id);
                                  setSelectedPrice(
                                    element?.price
                                  );
                                } else {
                                  toast.error(
                                    "Sunbed is disabled.",
                                    {
                                      position: "top-center",
                                      autoClose: 5000,
                                      hideProgressBar: false,
                                      closeOnClick: true,
                                      pauseOnHover: true,
                                      draggable: true,
                                      progress: undefined,
                                    }
                                  );
                                }
                              } else {
                                toast.error(
                                  "Sunbed is already reserved",
                                  {
                                    position: "top-center",
                                    autoClose: 5000,
                                    hideProgressBar: false,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                  }
                                );
                              }
                            }
                      }
                     
                      className={`relative w-[30%] h-[30%] mx-auto flex justify-center  items-center my-auto ${
                        isSelected !== element._id ? "" : "pulse"
                      }`}
                      key={index}
                      style={{
                        flexBasis: `calc(100% / ${floorPlanColumns})`,
                      }}
                    >
                      <img
src={
element?.reserved
? element.type === "circle" ? cir : 
element.type === "square" ? sqr :
element.type === "squarev" ? sqrv : ""
: element.type === "circle" ? cir1 :
element.type === "square" ? sqr1 :
element.type === "squarev" ? sqrv : ""
}
                        className={`w-full object-cover ${
                          isSelected === element?._id ||
                          element?.reserved
                            ? "opacity-100"
                            : "opacity-50"
                        }`}
                        alt=""
                        style={{
                          display:
                            element.disappear === "true"
                              ? "none"
                              : "block",
                        }}
                      />
                       {!user && element?.disabled === "po" && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600"
                          style={{ fontSize: "10px" }}
                        >
                          <ImCross className="text-gray-600" />
                        </div>
                      )}
                       {user && element?.disabled === "po" && (
                        <div
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-600"
                          style={{ fontSize: "10px" }}
                        >
                          {element?.number}
                        </div>
                      )}
                    </div>
                  );
                })}
            </TransformComponent>
          </div>
        )}
      </TransformWrapper>
    </div>
  </div>}
  </>
  )
}

export default FloorPlan
