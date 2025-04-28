import React, { useContext, useRef, useState } from 'react'
import Modal from "../../components/BookingModal/Modal";
import { MdDelete } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { FaMinus, FaPlus, FaTicketAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import cir from "../../assets/circle.png";
import cir1 from "../../assets/circle1.png";
import vip from "../../assets/umbrella8.jpg";
import sqr from "../../assets/quareum.jpg";
import sqr1 from "../../assets/quareum1.jpg";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";

const AdminReservationReport = () => {
    const {getreservationreport} = useContext(SuneasyContext)
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  const [minselectedDate, setminSelectedDate] = useState(minDate.toISOString().substr(0, 10));
  const [maxselectedDate, setmaxSelectedDate] = useState(maxDate.toISOString().substr(0, 10));
  const [numberofreservations, setnumberofreservations] = useState(null);
  const [sunbedPayments, setSunbedPayments] = useState({});
  const submitButtonRef = useRef(null);


    const minhandlechange = (e) => {
        setminSelectedDate(e.target.value);
      };
      const maxhandlechange = (e) => {
        setmaxSelectedDate(e.target.value);
      };
    
      const handlegetreport = async (e) => {
        e.preventDefault();
        let iscount = await getreservationreport(minselectedDate, maxselectedDate);
        if (iscount) {
          setnumberofreservations(iscount);
        } else {
          toast.error("No Reservations Found", {
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
      
    return (
    <>
                      <div className=" content ">
                        <div className=" p-4 bg-[#73D0D7] ">
                          <div className="grid py-2 grid-cols-2 px-2 bg-[#73D0D7]">
                            <label className=" py-2 text-lg font-semibold text-white ">
                              Min Date :{" "}
                            </label>
                            <input
                              className="cursor-pointer rounded-md text-sm md:text-md  py-2 outline-none px-4 bg-[#046E72] text-white"
                              type="date"
                              required
                              value={minselectedDate}
                              onChange={(e) => {
                                minhandlechange(e);
                              }}
                            />
                          </div>
                          <div className="grid py-2 grid-cols-2 px-2 bg-[#73D0D7]">
                            <label className=" py-2 text-lg font-semibold text-white ">
                              Max Date :{" "}
                            </label>
                            <input
                              className="cursor-pointer rounded-md text-sm md:text-md  py-2 outline-none px-4 bg-[#046E72] text-white"
                              type="date"
                              required
                              value={maxselectedDate}
                              onChange={(e) => {
                                maxhandlechange(e);
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <button
                            className="text-center w-full bg-gray-400 py-2 font-semibold"
                            onClick={(e) => {
                              handlegetreport(e);
                            }}
                          >
                            Get Report
                          </button>
                        </div>
                         <div className="flex flex-wrap justify-center">
                          <div className="text-center bg-[#73D0D7] font-semibold text-lg text-white flex flex-col py-4  justify-center items-center w-full sm:w-auto sm:flex-1 sm:mx-2">
                            <div className="mb-2">
                              No. of{" "}
                              <img
                                src={cir}
                                alt="Circle Sunbed"
                                className="w-6 h-6 inline-block"
                              />{" "}
                              Reservations
                            </div>
                            <div className="text-red-600">
                              {numberofreservations &&
                                numberofreservations.countCircle}{" "}
                              /{" "}
                              {numberofreservations &&
                                numberofreservations.totalPriceCircle}{" "}
                              ALL
                            </div>
                          </div>
                          <div className="text-center bg-[#73D0D7] font-semibold text-lg text-white flex flex-col py-4  justify-center items-center w-full sm:w-auto sm:flex-1 sm:mx-2">
                            <div className="mb-2">
                              No. of{" "}
                              <img
                                src={sqr}
                                alt="Square Sunbed"
                                className="w-6 h-6 inline-block"
                              />{" "}
                              Reservations
                            </div>
                            <div className="text-red-600">
                              {numberofreservations &&
                                numberofreservations.countSquare}{" "}
                              /{" "}
                              {numberofreservations &&
                                numberofreservations.totalPriceSquare}{" "}
                              ALL
                            </div>
                          </div>
                          <div className="text-center bg-[#73D0D7] font-semibold text-lg text-white flex flex-col py-4 justify-center items-center w-full sm:w-auto sm:flex-1 sm:mx-2">
                            <div className="mb-2">
                              No. of{" "}
                              <img
                                src={vip}
                                alt="VIP Sunbed"
                                className="w-6 h-6 inline-block"
                              />{" "}
                              Reservations
                            </div>
                            <div className="text-red-600">
                              {numberofreservations &&
                                numberofreservations.countSquareV}{" "}
                              /{" "}
                              {numberofreservations &&
                                numberofreservations.totalPriceSquareV}{" "}
                              ALL
                            </div>
                          </div>
                          <div className="text-center bg-[#73D0D7] font-semibold text-lg text-white flex flex-col py-4 justify-center items-center w-full sm:w-auto sm:flex-1 sm:mx-2">
                            <div className="mb-2">
                              Admin{" "}
                            </div>
                            <div className="text-red-600">
                            <img
                                src={cir}
                                alt="VIP Sunbed"
                                className="w-6 h-6 inline-block"
                              />{" "}
                              {numberofreservations &&
                                numberofreservations.countCircleAdmin}{" "}
                              /{" "}
                              {numberofreservations &&
                                numberofreservations.totalPriceCircleAdmin}{" "}
                              ALL
                            </div>
                            <div className="text-red-600">
                            <img
                                src={sqr}
                                alt="VIP Sunbed"
                                className="w-6 h-6 inline-block"
                              />{" "}
                              {numberofreservations &&
                                numberofreservations.countSquareAdmin}{" "}
                              /{" "}
                              {numberofreservations &&
                                numberofreservations.totalPriceSquareAdmin}{" "}
                              ALL
                            </div>
                            <div className="text-red-600">
                            <img
                                src={vip}
                                alt="VIP Sunbed"
                                className="w-6 h-6 inline-block"
                              />  {"  "}  
                               {numberofreservations &&
                                numberofreservations.countSquareVAdmin}{" "}
                              /{" "}
                              {numberofreservations &&
                                numberofreservations.totalPriceSquareVAdmin}{" "}
                              ALL
                            </div>

                          </div>
                          
                        </div>
                        <div className="text-center bg-[#73D0D7] font-semibold text-lg text-white flex flex-col py-4  justify-center items-center w-full sm:w-auto sm:flex-1 sm:mx-2">
  <div className="flex justify-around w-full">
    <div>
      <div>Total Sunbed Reservations</div>
      <div className="text-red-600">
        {numberofreservations &&
          numberofreservations.countCircle +
            numberofreservations.countSquare +
            numberofreservations.countSquareV}{" "}
        /{" "}
        {numberofreservations &&
          numberofreservations.totalPriceCircle +
            numberofreservations.totalPriceSquare +
            numberofreservations.totalPriceSquareV}{" "}
        ALL
      </div>
    </div>
    <div>
      <div>Total Sunbed Admin</div>
      <div className="text-red-600">
        {numberofreservations &&
          numberofreservations.countCircleAdmin +
            numberofreservations.countSquareAdmin +
            numberofreservations.countSquareVAdmin}{" "}
        /{" "}
        {numberofreservations &&
          numberofreservations.totalPriceCircleAdmin +
            numberofreservations.totalPriceSquareAdmin +
            numberofreservations.totalPriceSquareVAdmin}{" "}
        ALL
      </div>
    </div>
  </div>
</div>

                      </div>
                    </>
  )
}

export default AdminReservationReport
