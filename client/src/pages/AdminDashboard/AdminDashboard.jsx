import React, { useContext, useEffect, useState, useRef } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Restrauntcard from "../../components/RestrauntCard/Restrauntcard";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { Bounce, ToastContainer, toast } from "react-toastify";
import AdminReservationComponent from "../../components/AdminReservationComponent/AdminReservationComponent";
import AdminReservationReport from "../../components/AdminReservationReport/AdminReservationReport";
import WorkerManagement from "../../components/WorkerManagement/WorkerManagement";

const AdminDashboard = () => {
  const {
    restaurants,
    user,
    getRestaurants,
  } = useContext(SuneasyContext);
  const [active, setActive] = useState("allreservations");
  const [ownerrestaurants, setownerrestaurants] = useState(null);
  const [activeTab, setActiveTab] = useState("bookings");

  
  useEffect(() => {
    if (restaurants) {
      setownerrestaurants(
        restaurants?.filter((restaurant) => user && user?.restaurantId?.includes(restaurant?._id))
      );
    }
  }, [restaurants]);
  
  useEffect(() => {
    getRestaurants();
  }, []);
 
  const tabhandler = (tab) => {
    setActive(tab);
  };
 

  return (
    <>
      {ownerrestaurants == null ? (
        <div className="flex justify-center items-center h-screen">
          <div className="loader"></div>
        </div>
      ) : (
        <>
          <Header />
          <section className="max-w-[1400px] w-[95%] md:w-[80%] my-10 mx-auto">
            <div className="bg-white border rounded-3xl overflow-hidden mt-10 mx-auto shadow-md">
              <ul className="md:pt-10 py-4 border-b bg-white  items-center  md:justify-start md:items-start flex  gap-2 text-md font-semibold md:text-2xl ">
                <li
                  className={`py-2 px-2 md:px-6 text-center cursor-pointer capitalize font-semibold ${
                    active === "allsunbeds"
                      ? "text-[#000000]"
                      : "text-[#19898D] opacity-45"
                  }`}
                  onClick={() => tabhandler("allsunbeds")}
                >
                  RESTAURANTS
                </li>
                <li
                  className={`py-2 px-2 md:px-6 text-center cursor-pointer capitalize font-semibold ${
                    active === "allreservations"
                      ? "text-[#000000]"
                      : "text-[#19898D] opacity-45"
                  }`}
                  onClick={() => tabhandler("allreservations")}
                >
                  RESERVATIONS
                </li>
                {user && user.role == "admin" && (
                  <li
                    className={`py-2 px-2 md:px-6 text-center cursor-pointer capitalize font-semibold ${
                      active === "report"
                        ? "text-[#000000]"
                        : "text-[#19898D] opacity-45"
                    }`}
                    onClick={() => tabhandler("report")}
                  >
                    REPORT
                  </li>
                )}
                <li
                  className={`py-2 px-2 md:px-6 text-center cursor-pointer capitalize font-semibold ${
                    active === "worker"
                      ? "text-[#000000]"
                      : "text-[#19898D] opacity-45"
                  }`}
                  onClick={() => tabhandler("worker")}
                >
                  WORKER
                </li>
              </ul>
              <div className="tab-content">
                <>
                  {active === "allsunbeds" && (
                    <div className=" content ">
                      <div className="my-4 grid grid-cols-1 md:grid-cols-2 text-center gap-2 p-4">
                        {ownerrestaurants?.length > 0 &&
                          ownerrestaurants?.map((rest, idx) => (
                            <div key={idx}>
                              <Restrauntcard sunbed={rest} key={rest?.id} />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {active === "allreservations" && (
                    <div className=" content  flex flex-col gap-2 md:gap-5 my-10 px-2 md:px-6  ">
                      {ownerrestaurants?.length > 0 &&
                        ownerrestaurants?.map((restaurant) => (
                          <div key={restaurant?._id}>
                            <AdminReservationComponent
                              restaurantdata={restaurant}
                              ownerrestaurants={ownerrestaurants}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                  {active === "report" && user && user?.role == "admin" && (
                    <>
                      <AdminReservationReport />
                    </>
                    // <></>
                  )}
                  {active === "worker" && (
                    <div className="content my-10 px-2 md:px-6">
                      <WorkerManagement />
                    </div>
                  )}
                </>
              </div>
            </div>
          </section>
          <Footer />
        </>
      )}
    </>
  );
};

export default  React.memo(AdminDashboard);
