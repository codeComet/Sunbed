import React, { useContext, useState, useEffect, useRef } from "react";
import { SuneasyContext } from "../../context/sunEasy/sunEasyState";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

const BookingForm = ({
  getallsunbedsbookingsbydate,
  sunbeds,
  selectedPrice,
  isSelected,
  setIsSelected,
  setQrContent,
  openModal,
  setRandomId,
  paypal,
  selectedDate,
}) => {
  const { singleRestaurant, setSingleRestaurant, handleBooking, user } =
    useContext(SuneasyContext);
  const params = useParams();
  const bookingInProgress = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const [selectedTime, setSelectedTime] = useState(formattedTime);
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [captcha, setCaptcha] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isVerificationFieldVisible, setIsVerificationFieldVisible] =
    useState(false);
  const [verficationComplete, setIsVerificationComplete] = useState(false);
  const storeBookingData = (form) => {
    localStorage.setItem("bookingData", JSON.stringify(form));
    localStorage.setItem("bookingStatus", "pending");
  };

  const handlePayPalPayment = async (form) => {
    try {
      const currentUrl = window.location.href;
      const amountWithFee = (form.price * 1.03).toFixed(2);
      const response = await axios.post(`http://localhost:5001/pay`, null, {
        params: {
          amount: amountWithFee,
          returnUrl: currentUrl,
        },
      });

      const { url } = response.data;
      storeBookingData(form);
      window.location.href = url;
    } catch (error) {
      console.log(error);
      toast.error("PayPal payment failed", {
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

  const handleBookingFromLocalStorage = async () => {
    const bookingStatus = localStorage.getItem("bookingStatus");
    if (bookingStatus === "completed") {
      return;
    }
    const newRandomId = generateRandomId();
    setRandomId(newRandomId);
    const bookingData = localStorage.getItem("bookingData");
    if (bookingData) {
      const form = JSON.parse(bookingData);
      form.randomId = newRandomId;
      form.payment = "true";
      const isBooked = await handleBooking(form);
      if (isBooked) {
        toast.success("Booking Confirmed Successfully", {
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
        getallsunbedsbookingsbydate(params.id, form.date);
        setSingleRestaurant(isBooked);
        setName("");
        setEmail("");
        setPhone("");
        setIsSelected(null);
        const qrCodeEncodeData = btoa(
          JSON.stringify({
            r: singleRestaurant?._id,
            s: form.sunbedId,
            d: form.date,
            n: form.name,
            p: form.phone,
            rr: form.randomId,
            email: form.email,
            payment: form.payment,
          })
        );
        const qrContent = `https://sunbed.al/qrCode/${qrCodeEncodeData}`;
        setQrContent(qrContent);
        openModal();
        localStorage.setItem("bookingStatus", "completed");
        localStorage.removeItem("bookingData");
      } else if (isBooked == null) {
        throw new Error("Sunbed Already Reserved At This Date");
      } else {
        throw new Error("Booking Unsuccessful");
      }
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    if (status === "success") {
      setShowConfirmation(true);
    }
  }, [location.search]);

  const bookingForm = async (e) => {
    e.preventDefault();
    if (bookingInProgress.current) return;
    bookingInProgress.current = true;

    try {
      if (!selectedDate) {
        throw new Error("Please Select Date");
      }

      if (!isSelected) {
        throw new Error("Please Select Umbrella");
      }

      if (
        name &&
        !(email.length > 0 || phone.length > 0) &&
        !user &&
        !user?.restaurantId.includes(singleRestaurant?._id)
      ) {
        throw new Error("Please Fill All Fields Correctly");
      }

      if (user && user?.restaurantId.includes(singleRestaurant?._id)) {
        setName(user?.username);
        setEmail(user?.email);
        setPhone("");
        setDescription(description);
      }
      const selectedSunbed = sunbeds.some((floorplan) => {
        return floorplan.sunbeds.some((sunbed) => sunbed._id === isSelected);
      });
      if (!selectedSunbed) {
        throw new Error("Invalid Sunbed Selection");
      }
      const newRandomId = generateRandomId();
      setRandomId(newRandomId);

      const form = {
        name:
          !name && user && user?.restaurantId.includes(singleRestaurant?._id)
            ? user?.role == "admin"
              ? "admin"
              : "manager"
            : name,
        email:
          !user && !user?.restaurantId.includes(singleRestaurant?._id)
            ? email
            : user?.email,
        phone,
        date: selectedDate,
        time: selectedTime,
        sunbedId: isSelected,
        restaurantId: singleRestaurant?._id,
        price: selectedPrice,
        description: !description.length > 0 ? "no description" : description,
        payment,
        randomId: newRandomId,
        isAdmin:
          user &&
          user?.restaurantId?.includes(singleRestaurant?._id) &&
          user?.role == "admin"
            ? true
            : false,
        isManager:
          user &&
          user?.restaurantId?.includes(singleRestaurant?._id) &&
          user?.role == "manager"
            ? true
            : false,
      };

      if (payment === "Cash") {
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
          getallsunbedsbookingsbydate(params.id, selectedDate);
          setSingleRestaurant(isBooked);
          setName("");
          setEmail("");
          setPhone("");
          setIsSelected(null);
          const qrCodeEncodeData = btoa(
            JSON.stringify({
              r: singleRestaurant?._id,
              email: email,
              s: selectedSunbed?._id,
              d: selectedDate,
              price: selectedPrice,
              n: name,
              p: phone,
              rr: newRandomId,
              payment: payment,
            })
          );
          const qrContent = `https://sunbed.al/qrCode/${qrCodeEncodeData}`;
          console.log(qrCodeEncodeData);
          setQrContent(qrContent);
          openModal();
        } else if (isBooked == null) {
          throw new Error("Sunbed Already Reserved At This Date");
        } else {
          throw new Error("Booking Unsuccessful");
        }
      } else {
        handlePayPalPayment(form);
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
    } finally {
      bookingInProgress.current = false;
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

  const handleConfirmation = () => {
    setShowConfirmation(false);
    handleBookingFromLocalStorage();
    const { search, pathname } = location;
    const queryParams = new URLSearchParams(search);
    queryParams.delete("status");
    navigate(`${pathname}?${queryParams.toString()}`, { replace: true });
  };

  const sendVerificationCode = async () => {
    try {
      if (!email) {
        throw new Error("Please enter an email address.");
      }

      await axios.post(
        "http://localhost:5001/bookings/send-verification-code",
        { email }
      );
      toast.success("Verification code sent to your email", {
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

      setIsVerificationFieldVisible(true);
    } catch (error) {
      toast.error("Failed to send verification code", {
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

  const verifyCode = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5001/bookings/verify-code",
        {
          email,
          code: verificationCode,
        }
      );

      if (response.data.message === "Verification successful") {
        toast.success("Email verified successfully", {
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
        setVerificationCode("");
        setIsVerificationComplete(true);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to verify code", {
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


      {showConfirmation ? (
        <section className="max-w-[1400px] w-[95%] md:w-[80%] my-4 mx-auto ">
          <div className="flex justify-center items-center">
            <div className="bg-[#73D0D7] p-8 rounded-3xl shadow-2xl text-center">
              {showConfirmation && (
                <div className="space-y-4">
                  <p className="text-2xl text-black font-semibold">
                    Your payment has been successfully processed. Click below to
                    confirm your reservation.
                  </p>
                  <button
                    className="py-2 px-4 font-medium rounded-lg bg-green-500 text-white text-lg w-full"
                    onClick={handleConfirmation}
                  >
                    Confirm Reservation
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-[1400px] w-[95%] md:w-[80%] my-4 mx-auto">
          <div className="bg-[#73D0D7] p-4 rounded-3xl shadow-2xl flex">
            <div className="grow px-2 md:py-20 md:px-6">
              <h2 className="capitalize pb-4 border-b text-3xl text-black font-semibold">
                Book Now
              </h2>
              <form
                onSubmit={bookingForm}
                className="grid grid-cols-3 gap-3 py-4 text-lg md:text-xl text-white"
              >
                {(!user || user) &&
                  !user?.restaurantId?.includes(singleRestaurant?._id) && (
                    <>
                      <label className="col-span-1 py-2">
                        Name: <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="rounded-md text-sm md:text-md col-span-2 py-2 outline-none px-4 bg-[#ffffff] text-black"
                        placeholder="Name..."
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <label className="col-span-1 py-2">
                        Phone No: <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="rounded-md text-sm md:text-md col-span-2 py-2 outline-none px-4 bg-[#ffffff] text-black"
                        type="tel"
                        placeholder="Phone No..."
                        value={phone}
                        min={10}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                      <label className="col-span-1 py-2">
                        Email: <span className="text-red-500">*</span>
                      </label>
                      <div className="col-span-2 flex items-center">
                        <input
                          className="rounded-md text-sm md:text-md py-2 outline-none px-4 bg-[#ffffff] text-black flex-grow"
                          placeholder="Email..."
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      {isVerificationFieldVisible && (
                        <>
                          <label className="col-span-1 py-2">
                            Verification Code:
                          </label>
                          <div className="col-span-2 flex items-center">
                            <input
                              className="rounded-md text-sm md:text-md py-2 outline-none px-4 bg-[#ffffff] text-black flex-grow"
                              placeholder="Enter verification code..."
                              type="text"
                              value={verificationCode}
                              onChange={(e) =>
                                setVerificationCode(e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}
                      {selectedPrice && (
                        <>
                          <label className="col-span-1 py-2">Price: </label>
                          <div className="rounded-md text-sm md:text-md col-span-2 py-2 outline-none px-4 bg-[#ffffff] text-black">
                            {selectedPrice}
                          </div>
                        </>
                      )}
                    </>
                  )}
                {/*                   {user && singleRestaurant?._id == user?.restaurantId && (
                    <>
                      <label className="col-span-1 py-2">
                        Description:<span className="text-red-500">*</span>
                      </label>
                      <input
                        className="rounded-md text-sm md:text-md col-span-2 outline-none px-4 bg-[#ffffff] text-black"
                        placeholder="Add a brief description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={50}
                      />
                    </>
                  )} */}
                {!user ? (
                  <>
                    <label className="col-span-1 py-2">Mode of Payment:</label>
                    <div className="col-span-2 py-2">
                      <label className="mr-4">
                        <input
                          type="radio"
                          value="Cash"
                          checked={payment === "Cash"}
                          onChange={() => setPayment("Cash")}
                        />{" "}
                        Cash
                      </label>
                      {paypal && (
                        <label>
                          <input
                            type="radio"
                            value="PayPal"
                            checked={payment === "PayPal"}
                            onChange={() => setPayment("PayPal")}
                          />{" "}
                          PayPal
                        </label>
                      )}
                    </div>

                    {!isVerificationFieldVisible ? (
                      <button
                        type="button"
                        className="md:py-2 md:px-4 p-2 font-medium rounded-3xl bg-white text-[#000000] col-span-3 text-sm md:text-lg my-2"
                        onClick={sendVerificationCode}
                        disabled={email == ""}
                      >
                        Verify Email
                      </button>
                    ) : (
                      !verficationComplete && (
                        <>
                          {" "}
                          <button
                            type="button"
                            className="md:py-2 md:px-4 p-2 font-medium rounded-3xl bg-white text-[#000000] col-span-3 text-sm md:text-lg my-2"
                            onClick={verifyCode}
                          >
                            Verify Code
                          </button>
                        </>
                      )
                    )}

                    {verficationComplete && (
                      <button
                        disabled={isVerified}
                        className="md:py-2 md:px-4 p-2 font-medium rounded-3xl bg-white text-[#000000] col-span-3 text-sm md:text-lg my-2"
                      >
                        {payment === "Cash"
                          ? "BOOK NOW"
                          : "PAY NOW WITH PAYPAL"}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {/*                         <button
                          disabled={(isVerified)}
                          className="md:py-2 md:px-4 p-2 font-medium rounded-3xl bg-white text-[#000000] col-span-3 text-sm md:text-lg my-2"
                        >
                          {payment === "Cash" ? "BOOK NOW" : "PAY NOW WITH PAYPAL"}
                        </button> */}
                  </>
                )}
              </form>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default BookingForm;
